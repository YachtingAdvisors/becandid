// ============================================================
// lib/journalRelapseTrigger.ts
//
// Called from alertPipeline.ts after an alert fires.
// Checks if the user has after_relapse journaling enabled,
// waits the configured delay, then sends a push notification
// with a post-relapse Stringer prompt and a deep link to the
// journal pre-loaded with the alert context.
//
// Usage in alertPipeline.ts:
//
//   import { triggerRelapseJournal } from './journalRelapseTrigger';
//
//   // After sending partner alert + self notification:
//   await triggerRelapseJournal(db, userId, alert.id, event.category);
//
// ============================================================

import { sendPush } from './push/pushService';
import { Resend } from 'resend';
import {
  RELAPSE_NOTIFICATION_PROMPTS,
  STRINGER_QUOTES,
} from '@be-candid/shared';

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

export async function triggerRelapseJournal(
  db: any,
  userId: string,
  alertId: string,
  category: string,
) {
  // Check if user has after_relapse journaling enabled
  const { data: prefs } = await db.from('journal_preferences')
    .select('*').eq('user_id', userId).single();

  // Default: after_relapse is true even if no prefs row exists
  const afterRelapse = prefs?.after_relapse ?? true;
  if (!afterRelapse) return;

  const delayMin = prefs?.relapse_delay_min ?? 30;

  // Deduplicate: don't send another relapse prompt within 2 hours
  if (prefs?.last_relapse_prompt) {
    const hoursSince = (Date.now() - new Date(prefs.last_relapse_prompt).getTime()) / 3600000;
    if (hoursSince < 2) return;
  }

  // Pick a relapse-specific prompt
  const prompt = RELAPSE_NOTIFICATION_PROMPTS[
    Math.floor(Math.random() * RELAPSE_NOTIFICATION_PROMPTS.length)
  ];

  const journalUrl = `${APP_URL}/dashboard/stringer-journal?action=write&trigger=relapse&alert=${alertId}&prompt=${encodeURIComponent(prompt)}`;

  // Schedule the delayed send
  // In production, use a queue (Inngest, QStash, etc.)
  // For MVP, setTimeout works within the serverless function timeout
  const sendNotifications = async () => {
    try {
      // Get user info + push tokens
      const [{ data: user }, { data: tokens }] = await Promise.all([
        db.from('users').select('name, email').eq('id', userId).single(),
        db.from('push_tokens').select('token, platform').eq('user_id', userId),
      ]);

      if (!user) return;

      // Push notification
      if (tokens && tokens.length > 0) {
        await Promise.allSettled(
          tokens.map((t: any) => sendPush(t.token, t.platform, {
            title: '📓 A moment to reflect',
            body: prompt,
            data: {
              type: 'relapse_journal',
              alert_id: alertId,
              category,
              prompt,
              url: `/dashboard/stringer-journal?action=write&trigger=relapse&alert=${alertId}`,
            },
          }))
        );
      }

      // Email
      if (user.email) {
        const quote = STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)];
        await getResend().emails.send({
          from: FROM,
          to: user.email,
          subject: 'Be Candid — A moment to reflect',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-block;background:#4f46e5;color:white;padding:5px 16px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
      Hey ${user.name || 'there'} — something came up a little while ago. Your partner has been notified and your conversation guide is ready.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
      But before anything else, Stringer would ask you to get curious — not critical. This moment has something to teach you.
    </p>
    <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;font-style:italic;">${prompt}</p>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:14px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#374151;">Three questions to sit with:</p>
      <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">🌊 What was happening — emotionally — before this?</p>
      <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">💛 What did you actually need?</p>
      <p style="margin:0;font-size:12px;color:#6b7280;">🧭 What is this revealing about the life you want?</p>
    </div>
    <a href="${journalUrl}" style="display:block;text-align:center;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;font-size:14px;">
      Open Your Journal →
    </a>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;font-style:italic;">
      "${quote.text}" — Jay Stringer
    </p>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
    This email is just for you. Your partner sees the alert — not this reflection.
  </p>
</div></body></html>`,
        }).catch(() => {});
      }

      // Update last_relapse_prompt timestamp
      await db.from('journal_preferences').upsert({
        user_id: userId,
        last_relapse_prompt: new Date().toISOString(),
        after_relapse: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    } catch (e) {
      console.error('Relapse journal trigger failed:', e);
    }
  };

  // Delay before sending (let the dust settle)
  if (delayMin > 0) {
    // For serverless: use a queue in production.
    // For MVP within Vercel's 60s timeout, cap at 45s.
    const actualDelay = Math.min(delayMin * 60 * 1000, 45000);
    setTimeout(sendNotifications, actualDelay);
  } else {
    await sendNotifications();
  }
}
