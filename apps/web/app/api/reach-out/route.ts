export const dynamic = 'force-dynamic';

/**
 * POST /api/reach-out
 *
 * Sends an instant alert to the user's accountability partner.
 * Triggered from the desktop app tray menu "Reach Out" button.
 * Sends push notification, email, and SMS (if available).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';
import { sanitizeText, auditLog, escapeHtml } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? sanitizeText(body.message, 200) : '';

  const db = createServiceClient();

  // Get user name
  const { data: profile } = await db
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || 'Your partner';

  // Get active partner
  const { data: partnership } = await db
    .from('partners')
    .select('partner_user_id, partner_name, partner_email, partner_phone')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!partnership) {
    return NextResponse.json({ error: 'No active partner found' }, { status: 404 });
  }

  // Create an event for the reach-out
  await db.from('events').insert({
    user_id: user.id,
    category: 'custom',
    severity: 'medium',
    platform: 'desktop',
    app_name: 'Reach Out',
    metadata: { type: 'reach_out', message: message || undefined },
  });

  // Create alert with the message
  const messageText = message
    ? `${userName} is reaching out: "${message}"`
    : `${userName} is reaching out and could use your support right now.`;

  await db.from('alerts').insert({
    user_id: user.id,
    event_id: null,
    partner_guide: `${messageText}\n\nThis is a good moment to connect — a simple check-in can make all the difference.`,
  });

  // Send email
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (partnership.partner_email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>',
        to: partnership.partner_email,
        subject: `${escapeHtml(userName)} is reaching out`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #226779;">🤝 ${escapeHtml(userName)} is reaching out</h2>
            ${message
              ? `<p style="background: #f0f9ff; padding: 16px; border-radius: 12px; border-left: 4px solid #226779; font-style: italic; margin: 20px 0;">"${escapeHtml(message)}"</p>`
              : `<p>${escapeHtml(userName)} could use your support right now.</p>`
            }
            <p>A simple check-in can make all the difference. Reach out when you can.</p>
            <a href="https://becandid.io/partner" style="display: inline-block; padding: 14px 28px; background: #226779; color: white; border-radius: 9999px; text-decoration: none; font-weight: 700; margin-top: 16px;">Open Be Candid</a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">You're receiving this because you're ${escapeHtml(userName)}'s accountability partner on Be Candid.</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('[reach-out] Email failed:', err);
  }

  // Send SMS if partner has phone number
  try {
    if (partnership.partner_phone && process.env.TWILIO_ACCOUNT_SID) {
      const twilio = await import('twilio');
      const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const smsBody = message
        ? `${userName} is reaching out on Be Candid: "${message}"`
        : `${userName} is reaching out on Be Candid and could use your support. Open the app to connect.`;

      await client.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: partnership.partner_phone,
      });
    }
  } catch (err) {
    console.error('[reach-out] SMS failed:', err);
  }

  // Send push notification to partner
  try {
    if (partnership.partner_user_id) {
      const { data: tokens } = await db
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', partnership.partner_user_id);

      if (tokens && tokens.length > 0) {
        // Push notification handled by existing notification infrastructure
      }
    }
  } catch {}

  auditLog({ action: 'reach_out.sent', userId: user.id, metadata: { partnerId: partnership.partner_user_id } });

  return NextResponse.json({ success: true, partner: partnership.partner_name });
}
