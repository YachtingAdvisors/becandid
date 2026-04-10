export const dynamic = 'force-dynamic';
// GET  /api/partners — get active partner
// POST /api/partners — invite a partner

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import { z } from 'zod';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeName, sanitizeEmail, sanitizePhone, auditLog, escapeHtml } from '@/lib/security';

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
    const plan = userPlan?.subscription_plan;
    const maxPartners = plan === 'therapy' ? 999 : plan === 'pro' ? 5 : 1;

    return NextResponse.json({ partner, partners: partners ?? [], maxPartners });
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

    // Ensure public.users row exists (signup profile creation is fire-and-forget,
    // so it may not have completed yet when the user reaches the partner step)
    await ensureUserRow(db, user);

    // Check partner limit: free=1, pro=5, therapy=unlimited
    const { data: existingPartners } = await db
      .from('partners').select('id').eq('user_id', user.id).in('status', ['active', 'accepted', 'pending']);
    const { data: userPlan } = await db
      .from('users').select('subscription_plan').eq('id', user.id).single();
    const plan = userPlan?.subscription_plan;
    const maxPartners = plan === 'therapy' ? Number.MAX_SAFE_INTEGER : plan === 'pro' ? 5 : 1;
    const currentCount = existingPartners?.length ?? 0;

    if (currentCount >= maxPartners) {
      const upgradeMsg = plan === 'therapy'
        ? `You've reached the maximum number of partners.`
        : plan === 'pro'
          ? `You've reached the Pro plan limit of 5 partners. Upgrade to Therapy for unlimited partners.`
          : `You've reached the free plan limit of 1 partner. Upgrade to Pro for up to 5 partners.`;
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
      return safeError('POST /api/partners', error);
    }

    // Store primary relationship type on user (first selected value)
    // Note: we no longer set partner_id on users — it's a legacy single-partner field.
    // The partners table is the source of truth for all partnerships.
    const primaryRelationship = parsed.data.relationship_type.split(',')[0].trim();
    const { error: userUpdateError } = await db.from('users').update({
      relationship_type: primaryRelationship,
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

      const { emailWrapper } = await import('@/lib/email/template');
      await resend.emails.send({
        from: FROM,
        to: cleanEmail,
        subject: `${escapeHtml(inviterName)} invited you to Be Candid`,
        html: emailWrapper({
          preheader: `${escapeHtml(inviterName)} chose you as their accountability partner on Be Candid`,
          body: `
            <h2 class="text-heading" style="margin:0 0 12px;color:#1a1a2e;font-size:22px;font-weight:700;text-align:center;">
              Hey ${escapeHtml(cleanName)},
            </h2>
            <p class="text-body" style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.7;text-align:center;">
              <strong>${escapeHtml(inviterName)}</strong> is on a journey to align their digital life with who they want to be &mdash; and they&rsquo;ve chosen <strong>you</strong> as someone they trust to walk with them.
            </p>
            <p class="text-body" style="margin:0 0 8px;color:#4b5563;font-size:14px;line-height:1.7;text-align:center;">
              No setup required &mdash; just accept and you&rsquo;re connected. You can optionally start your own journey too and get <strong>30 free days</strong>.
            </p>
          `,
          ctaUrl: `${APP_URL}/invite/${inviteToken}`,
          ctaLabel: 'Accept Invitation',
          footerNote: '&ldquo;A cord of three strands is not easily broken.&rdquo; &mdash; King Solomon',
        }),
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
