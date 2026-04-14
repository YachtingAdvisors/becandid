export const dynamic = 'force-dynamic';
// POST /api/check-ins/[id]/confirm

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { confirmUserCheckIn, confirmPartnerCheckIn, type UserMood, type PartnerMood } from '@/lib/checkInEngine';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText, isValidUUID, auditLog } from '@/lib/security';
import { buildConfirmationFollowUpEmail, buildFollowUpSMS } from '@/lib/checkInNotifications';
import { pushNotifyUser } from '@/lib/pushNotify';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/check-ins/confirm', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const checkInId = id;
    if (!isValidUUID(checkInId)) {
      return safeError('POST /api/check-ins/confirm', 'Invalid ID', 400);
    }

    const body = await req.json().catch(() => null);
    if (!body?.mood) {
      return NextResponse.json({ error: 'mood is required' }, { status: 400 });
    }

    const db = createServiceClient();

    const { data: checkIn } = await db
      .from('check_ins')
      .select('user_id, partner_user_id, status')
      .eq('id', checkInId)
      .single();

    if (!checkIn) return safeError('POST /api/check-ins/confirm', 'Not found', 404);

    const isMonitoredUser = checkIn.user_id === user.id;
    const isPartner = checkIn.partner_user_id === user.id;
    if (!isMonitoredUser && !isPartner) return safeError('POST /api/check-ins/confirm', 'Forbidden', 403);

    // Sanitize response text
    const cleanResponse = body.response ? sanitizeText(body.response, 1000) : undefined;

    let result;

    if (isMonitoredUser) {
      const validMoods: UserMood[] = ['great', 'good', 'okay', 'struggling', 'crisis'];
      if (!validMoods.includes(body.mood)) {
        return NextResponse.json({ error: 'Invalid mood' }, { status: 400 });
      }
      result = await confirmUserCheckIn(db, checkInId, user.id, body.mood, cleanResponse);
    } else {
      const validMoods: PartnerMood[] = ['confident', 'hopeful', 'concerned', 'worried'];
      if (!validMoods.includes(body.mood)) {
        return NextResponse.json({ error: 'Invalid mood' }, { status: 400 });
      }
      result = await confirmPartnerCheckIn(db, checkInId, user.id, body.mood, cleanResponse);
    }

    auditLog({
      action: 'checkin.confirmed',
      userId: user.id,
      metadata: { checkInId, role: isMonitoredUser ? 'user' : 'partner', mood: body.mood },
    });

    // Send follow-up notification to the other party if check-in is now partial
    // (i.e. one side confirmed, the other hasn't yet)
    if (result.status === 'partial') {
      try {
        const { data: fullCheckIn } = await db
          .from('check_ins')
          .select('user_id, partner_user_id')
          .eq('id', checkInId)
          .single();

        if (fullCheckIn) {
          // Determine who to notify (the person who has NOT confirmed yet)
          const recipientUserId = isMonitoredUser
            ? fullCheckIn.partner_user_id
            : fullCheckIn.user_id;

          if (recipientUserId) {
            // Get names for both parties
            const [confirmerProfile, recipientProfile] = await Promise.all([
              db.from('users').select('name, email, phone').eq('id', user.id).single(),
              db.from('users').select('name, email, phone').eq('id', recipientUserId).single(),
            ]);

            const confirmerName = confirmerProfile.data?.name?.split(' ')[0] ?? 'Your partner';
            const recipientName = recipientProfile.data?.name?.split(' ')[0] ?? 'there';

            const emailContent = buildConfirmationFollowUpEmail({
              recipientName,
              confirmerName,
              confirmerRole: isMonitoredUser ? 'user' : 'partner',
              checkInId,
            });

            const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY!);

            const sends: Promise<any>[] = [];

            // Email follow-up
            if (recipientProfile.data?.email) {
              sends.push(resend.emails.send({
                from: FROM,
                to: recipientProfile.data.email,
                ...emailContent,
              }));
            }

            // Push notification follow-up
            sends.push(pushNotifyUser(db, recipientUserId, {
              type: 'check_in',
              title: `${confirmerName} just checked in`,
              body: `${confirmerName} confirmed their check-in. Your turn, ${recipientName}!`,
              data: {
                url: isMonitoredUser ? '/partner/checkins' : '/dashboard/checkins',
                tag: `checkin-followup-${checkInId}`,
              },
            }));

            // SMS follow-up
            if (recipientProfile.data?.phone) {
              const smsBody = buildFollowUpSMS(recipientName, confirmerName);
              const twilio = (await import('twilio')).default;
              const smsClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
              sends.push(smsClient.messages.create({
                body: smsBody,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: recipientProfile.data.phone,
              }));
            }

            await Promise.allSettled(sends);
          }
        }
      } catch (notifErr) {
        // Non-fatal — confirmation was recorded even if follow-up notification fails
        console.error('[check-in/confirm] Follow-up notification error:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      role: isMonitoredUser ? 'user' : 'partner',
      bothConfirmed: result.status === 'completed',
      milestonesUnlocked: result.milestonesUnlocked,
    });
  } catch (err: any) {
    const status = err.message?.includes('already') ? 409
      : err.message?.includes('expired') ? 410 : 500;
    return safeError('POST /api/check-ins/confirm', err, status);
  }
}
