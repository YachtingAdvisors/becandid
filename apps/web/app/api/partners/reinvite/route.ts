export const dynamic = 'force-dynamic';
// POST /api/partners/reinvite — resend invite to pending partner

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, auditLog, escapeHtml } from '@/lib/security';
import { createInviteToken } from '@/lib/inviteTokens';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/partners/reinvite', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Accept optional partner_id to reinvite a specific partner
    const body = await req.json().catch(() => ({}));
    const partnerId = body?.partner_id;

    let query = db
      .from('partners')
      .select('id, partner_email, partner_name')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (partnerId) {
      query = query.eq('id', partnerId);
    }

    const { data: partner } = await query.maybeSingle();

    if (!partner) {
      return NextResponse.json({ error: 'No pending invite found' }, { status: 404 });
    }

    // Generate new token
    const { rawToken: newToken, tokenHash, expiresAt } = createInviteToken();
    await db.from('partners')
      .update({
        invite_token: tokenHash,
        invite_expires_at: expiresAt,
        invited_at: new Date().toISOString(),
      })
      .eq('id', partner.id);

    // Send via Resend using the same emailWrapper template as the original invite
    try {
      const { Resend } = await import('resend');
      const { emailWrapper } = await import('@/lib/email/template');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

      const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();
      const inviterName = profile?.name ?? 'Someone';
      const partnerName = partner.partner_name;

      await resend.emails.send({
        from: FROM,
        to: partner.partner_email,
        subject: `${escapeHtml(inviterName)} is still waiting — join Be Candid as their accountability partner`,
        html: emailWrapper({
          preheader: `${escapeHtml(inviterName)} resent your invitation to Be Candid`,
          body: `
            <h2 class="text-heading" style="margin:0 0 12px;color:#1a1a2e;font-size:22px;font-weight:700;text-align:center;">
              Hey ${escapeHtml(partnerName)},
            </h2>
            <p class="text-body" style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.7;text-align:center;">
              <strong>${escapeHtml(inviterName)}</strong> is on a journey to align their digital life with who they want to be &mdash; and they&rsquo;re still hoping you&rsquo;ll walk with them.
            </p>
            <p class="text-body" style="margin:0 0 8px;color:#4b5563;font-size:14px;line-height:1.7;text-align:center;">
              No setup required &mdash; just accept and you&rsquo;re connected. You can optionally start your own journey too and get <strong>30 free days</strong>.
            </p>
          `,
          ctaUrl: `${APP_URL}/invite/${newToken}`,
          ctaLabel: 'Accept Invitation',
          footerNote: '&ldquo;A cord of three strands is not easily broken.&rdquo; &mdash; King Solomon',
        }),
      });
    } catch (emailErr) {
      console.error('Reinvite email failed:', emailErr);
      // Non-fatal — token was refreshed, email just failed to send
    }

    auditLog({ action: 'partner.invite', userId: user.id, metadata: { type: 'reinvite', partnerId: partner.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/partners/reinvite', err);
  }
}
