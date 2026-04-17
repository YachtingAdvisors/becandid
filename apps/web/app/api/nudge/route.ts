export const dynamic = 'force-dynamic';
// POST /api/nudge — send a nudge to user's accountability partner(s)

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog, sanitizeText, escapeHtml } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sendNudgeSMS } from '@/lib/sms';
import { Resend } from 'resend';
import { z } from 'zod';

const NudgeSchema = z.object({
  mood: z.enum(['low', 'crisis']),
  message: z.string().max(500).optional(),
});

const MOOD_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  low: { label: 'Low', emoji: '\u{1F614}', color: '#f59e0b' },
  crisis: { label: 'In Crisis', emoji: '\u{1F198}', color: '#ef4444' },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/nudge', 'Unauthorized', 401);

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    const parsed = NudgeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    if (parsed.data.message) {
      parsed.data.message = sanitizeText(parsed.data.message, 500);
    }

    const db = createServiceClient();

    // Get user info
    const { data: userProfile } = await db
      .from('users')
      .select('name, notification_prefs')
      .eq('id', user.id)
      .single();

    const userName = userProfile?.name?.split(' ')[0] ?? 'Your partner';
    const moodInfo = MOOD_LABELS[parsed.data.mood];

    // Get all active partners
    const { data: partners } = await db
      .from('partners')
      .select('partner_name, partner_email, partner_phone, partner_user_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'accepted']);

    if (!partners || partners.length === 0) {
      return NextResponse.json({ error: 'No active partners to nudge' }, { status: 400 });
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';
    const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@updates.becandid.io>';

    let nudgedCount = 0;

    for (const partner of partners) {
      // Send email
      if (partner.partner_email) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY!);
          await resend.emails.send({
            from: FROM,
            to: partner.partner_email,
            subject: `${moodInfo.emoji} ${escapeHtml(userName)} could use your support right now`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fbf9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#226779;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">${moodInfo.emoji}</div>
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Hey ${escapeHtml(partner.partner_name?.split(' ')[0] ?? 'Partner')},</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
      <strong>${escapeHtml(userName)}</strong> is feeling <strong style="color:${moodInfo.color}">${moodInfo.label.toLowerCase()}</strong> right now and reached out for support.
    </p>
    ${parsed.data.message ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left;">
      <p style="margin:0;color:#374151;font-size:14px;font-style:italic;line-height:1.6;">&ldquo;${escapeHtml(parsed.data.message)}&rdquo;</p>
    </div>` : ''}
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      A simple text, call, or check-in can make all the difference. You don&rsquo;t need to fix anything &mdash; just show up.
    </p>
    <a href="${APP_URL}/dashboard/conversations" style="display:inline-block;background:#226779;color:white;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px;">
      Check In With ${escapeHtml(userName)} &rarr;
    </a>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;font-style:italic;">
      &ldquo;The people we trust with that important talk can help us know that we are not alone.&rdquo; &mdash; Fred Rogers
    </p>
  </div>
</div></body></html>`,
          });
          nudgedCount++;
        } catch (e) {
          console.error('Nudge email failed:', e);
        }
      }

      // Send SMS if phone available
      if (partner.partner_phone) {
        try {
          await sendNudgeSMS({
            partnerPhone: partner.partner_phone,
            partnerName: partner.partner_name ?? 'Partner',
            userName,
            moodLabel: moodInfo.label.toLowerCase(),
          });
        } catch (e) {
          console.error('Nudge SMS failed:', e);
        }
      }
    }

    auditLog({
      action: 'nudge.sent',
      userId: user.id,
      metadata: { type: 'nudge', mood: parsed.data.mood, partners_nudged: nudgedCount },
    });

    return NextResponse.json({ success: true, nudged: nudgedCount });
  } catch (err) {
    return safeError('POST /api/nudge', err);
  }
}
