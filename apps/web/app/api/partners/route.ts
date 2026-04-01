export const dynamic = 'force-dynamic';
// GET  /api/partners — get active partner
// POST /api/partners — invite a partner

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeName, sanitizeEmail, sanitizePhone, auditLog } from '@/lib/security';

const InviteSchema = z.object({
  partner_name: z.string().min(1).max(100),
  partner_email: z.string().email().max(254),
  partner_phone: z.string().max(20).optional(),
  relationship_type: z.string().min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to view your partner. Your session may have expired.' }, { status: 401 });

    const db = createServiceClient();
    const { data: partners } = await db
      .from('partners')
      .select('id, partner_name, partner_email, partner_phone, status, relationship, invited_at, accepted_at')
      .eq('user_id', user.id)
      .in('status', ['active', 'accepted', 'pending'])
      .order('invited_at', { ascending: false });

    // Also return the legacy single partner for backward compatibility
    const partner = partners?.[0] ?? null;

    const { data: userPlan } = await db
      .from('users').select('subscription_plan').eq('id', user.id).single();
    const isPro = userPlan?.subscription_plan === 'pro' || userPlan?.subscription_plan === 'therapy';

    return NextResponse.json({ partner, partners: partners ?? [], maxPartners: isPro ? 3 : 2 });
  } catch (err) {
    return safeError('GET /api/partners', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to invite a partner. Your session may have expired — try refreshing the page.' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('POST /api/partners', 'Invalid JSON', 400);

    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize
    const cleanName = sanitizeName(parsed.data.partner_name);
    const cleanEmail = sanitizeEmail(parsed.data.partner_email);
    if (!cleanEmail) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    // Can't invite yourself
    if (cleanEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot be your own partner' }, { status: 400 });
    }

    const cleanPhone = parsed.data.partner_phone ? sanitizePhone(parsed.data.partner_phone) : null;

    const db = createServiceClient();

    // Check partner limit: 2 for free users, 3 for Pro
    const { data: existingPartners } = await db
      .from('partners').select('id').eq('user_id', user.id).in('status', ['active', 'accepted', 'pending']);
    const { data: userPlan } = await db
      .from('users').select('subscription_plan').eq('id', user.id).single();
    const isPro = userPlan?.subscription_plan === 'pro' || userPlan?.subscription_plan === 'therapy';
    const maxPartners = isPro ? 3 : 2;
    const currentCount = existingPartners?.length ?? 0;

    if (currentCount >= maxPartners) {
      const upgradeMsg = isPro
        ? `You've reached the maximum of ${maxPartners} partners.`
        : `You've reached the free plan limit of ${maxPartners} partners. Upgrade to Pro to add a 3rd partner.`;
      return NextResponse.json({ error: upgradeMsg }, { status: 400 });
    }

    const inviteToken = crypto.randomUUID();

    const { data: partner, error } = await db
      .from('partners')
      .insert({
        user_id: user.id,
        partner_email: cleanEmail,
        partner_name: cleanName,
        partner_phone: cleanPhone,
        relationship: parsed.data.relationship_type,
        invite_token: inviteToken,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Partner insert error:', JSON.stringify(error));
      return NextResponse.json({ error: `Partner invite failed: ${error.message}` }, { status: 400 });
    }

    // Store primary relationship type on user (first selected value)
    const primaryRelationship = parsed.data.relationship_type.split(',')[0].trim();
    const { error: userUpdateError } = await db.from('users').update({
      relationship_type: primaryRelationship,
      partner_id: partner.id,
    }).eq('id', user.id);

    if (userUpdateError) {
      console.error('User update error:', JSON.stringify(userUpdateError));
      // Non-fatal — partner was created, user update failed
    }

    // If user is on a trial, extend to 30 days from now (bonus for adding a partner)
    const { data: trialUser } = await db
      .from('users')
      .select('subscription_status, trial_ends_at, created_at')
      .eq('id', user.id)
      .single();

    if (trialUser?.subscription_status === 'trialing') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db
        .from('users')
        .update({ trial_ends_at: thirtyDaysFromNow })
        .eq('id', user.id);
    }

    // Send invite email to partner
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

      const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();
      const inviterName = profile?.name ?? 'Someone';

      await resend.emails.send({
        from: FROM,
        to: cleanEmail,
        subject: `${inviterName} invited you to Be Candid`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fbf9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#226779;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);text-align:center;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Hey ${cleanName},</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
      <strong>${inviterName}</strong> is on a journey to align their digital life with who they want to be &mdash; and they&rsquo;ve chosen <strong>you</strong> as someone they trust to walk with them.
    </p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      No setup required &mdash; just accept and you&rsquo;re connected. You can optionally start your own journey too and get <strong>30 free days</strong>.
    </p>
    <a href="${APP_URL}/invite/${inviteToken}" style="display:inline-block;background:#226779;color:white;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px;">
      Accept Invitation &rarr;
    </a>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;font-style:italic;">
      &ldquo;A cord of three strands is not easily broken.&rdquo; &mdash; King Solomon
    </p>
  </div>
</div></body></html>`,
      });
    } catch (emailErr) {
      console.error('Partner invite email failed:', emailErr);
      // Non-fatal — invite was created, email just failed to send
    }

    // Send SMS if partner has phone number
    if (cleanPhone) {
      try {
        const { sendPartnerInviteSMS } = await import('@/lib/sms');
        const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();
        await sendPartnerInviteSMS({
          partnerPhone: cleanPhone,
          inviterName: profile?.name ?? 'Someone',
          inviteToken,
        });
      } catch (smsErr) {
        console.error('Partner invite SMS failed:', smsErr);
      }
    }

    auditLog({
      action: 'partner.invite',
      userId: user.id,
      metadata: { partnerEmail: cleanEmail },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/partners', err);
  }
}
