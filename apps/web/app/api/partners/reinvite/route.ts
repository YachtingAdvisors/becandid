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

    const blocked = await checkUserRate(actionLimiter, user.id);
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

    // Send via Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

      const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();
      const inviterName = profile?.name ?? 'Someone';

      await resend.emails.send({
        from: FROM,
        to: partner.partner_email,
        subject: `${escapeHtml(inviterName)} is waiting — join Be Candid as their accountability partner`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;text-align:center;">
    <h2 style="margin:0 0 12px;color:#0f0e1a;font-size:22px;font-family:Georgia,serif;">You're Invited</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      ${escapeHtml(inviterName)} wants you to be their accountability partner on Be Candid.
    </p>
    <a href="${APP_URL}/invite/${newToken}" style="display:inline-block;background:#7c3aed;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Accept Invitation →
    </a>
  </div>
</div>
</body></html>`,
      });
    } catch (emailErr) {
      console.error('Reinvite email failed:', emailErr);
    }

    auditLog({ action: 'partner.invite', userId: user.id, metadata: { type: 'reinvite' } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/partners/reinvite', err);
  }
}
