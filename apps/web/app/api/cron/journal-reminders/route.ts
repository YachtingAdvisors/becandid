export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/journal-reminders/route.ts
//
// Runs every hour. For each user with reminders enabled:
//   1. Check if it's their preferred hour (in their timezone)
//   2. Check if enough time has passed since last reminder
//   3. Pick a Stringer prompt from the rotation
//   4. Send push notification + optional email
//   5. Update last_reminder_at
//
// Schedule: "0 * * * *" (every hour, top of hour)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendPush } from '@/lib/push/pushService';
import { Resend } from 'resend';
import {
  JOURNAL_NOTIFICATION_PROMPTS,
  STRINGER_QUOTES,
} from '@be-candid/shared';
import { verifyCronAuth } from '@/lib/cronAuth';

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

const FREQUENCY_HOURS: Record<string, number> = {
  daily: 24,
  every_2_days: 48,
  every_3_days: 72,
  weekly: 168,
};

function getCurrentHourInTimezone(tz: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', hour12: false,
    });
    return parseInt(formatter.format(now));
  } catch {
    return new Date().getUTCHours(); // fallback
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret (supports Vercel Crons Bearer header + custom x-cron-secret)
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const now = new Date();
  let sent = 0;
  let skipped = 0;

  // Fetch all users with reminders enabled
  const { data: prefs } = await db.from('journal_preferences')
    .select('*')
    .eq('reminder_enabled', true);

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No users with reminders enabled' });
  }

  for (const pref of prefs) {
    try {
      // 1. Is it their preferred hour?
      const currentHour = getCurrentHourInTimezone(pref.timezone || 'America/New_York');
      if (currentHour !== pref.preferred_hour) { skipped++; continue; }

      // 2. Has enough time passed since last reminder?
      if (pref.last_reminder_at) {
        const hoursSinceLast = (now.getTime() - new Date(pref.last_reminder_at).getTime()) / 3600000;
        const requiredHours = FREQUENCY_HOURS[pref.frequency] || 24;
        if (hoursSinceLast < requiredHours - 1) { skipped++; continue; } // -1 for clock drift
      }

      // 3. Pick a Stringer prompt
      const prompt = JOURNAL_NOTIFICATION_PROMPTS[
        Math.floor(Math.random() * JOURNAL_NOTIFICATION_PROMPTS.length)
      ];

      // 4. Get user info + push tokens
      const [{ data: user }, { data: tokens }] = await Promise.all([
        db.from('users').select('name, email').eq('id', pref.user_id).single(),
        db.from('push_tokens').select('token, platform').eq('user_id', pref.user_id),
      ]);

      if (!user) { skipped++; continue; }

      // Send push notification with the prompt
      if (tokens && tokens.length > 0) {
        await Promise.allSettled(
          tokens.map((t: any) => sendPush(t.token, t.platform, {
            title: '📓 Time to reflect',
            body: prompt,
            data: {
              type: 'journal_reminder',
              prompt,
              url: '/dashboard/stringer-journal?action=write&trigger=reminder',
            },
          }))
        );
      }

      // Send email with the prompt + journal link
      if (user.email) {
        const quote = STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)];
        await getResend().emails.send({
          from: FROM,
          to: user.email,
          subject: '📓 Your journal is waiting',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-block;background:#4f46e5;color:white;padding:5px 16px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 16px;text-align:center;">Time to reflect</h2>
    <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;">${prompt}</p>
    </div>
    <a href="${APP_URL}/dashboard/stringer-journal?action=write&trigger=reminder&prompt=${encodeURIComponent(prompt)}"
      style="display:block;text-align:center;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;font-size:14px;">
      Open Journal →
    </a>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;font-style:italic;">
      "${quote.text}"
    </p>
  </div>
</div></body></html>`,
        }).catch(() => {}); // Non-fatal
      }

      // 5. Update last_reminder_at
      await db.from('journal_preferences').update({
        last_reminder_at: now.toISOString(),
      }).eq('user_id', pref.user_id);

      sent++;
    } catch (e) {
      console.error(`Journal reminder failed for ${pref.user_id}:`, e);
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped, total: prefs.length });
}
