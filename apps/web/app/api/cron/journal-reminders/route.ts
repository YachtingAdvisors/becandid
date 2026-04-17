export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/journal-reminders/route.ts
//
// Runs every hour. Sends personalized smart notifications:
//
// 1. Morning (user's preferred hour):
//    - Daily commitment + streak count + therapeutic prompt
//
// 2. Evening (after 8 PM user time):
//    - Daily inventory reminder + streak count
//
// 3. After relapse (30 min delay, from journal preferences):
//    - Compassionate nudge + sealed letter hint + coach link
//
// Schedule: "0 * * * *" (every hour, top of hour)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendPushToUser } from '@/lib/push/pushService';
import { Resend } from 'resend';
import {
  JOURNAL_NOTIFICATION_PROMPTS,
  STRINGER_QUOTES,
  THERAPEUTIC_PROMPTS,
} from '@be-candid/shared';
import { verifyCronAuth } from '@/lib/cronAuth';
import { logCronRun } from '@/lib/cronAudit';
import { escapeHtml } from '@/lib/security';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@updates.becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

const FREQUENCY_HOURS: Record<string, number> = {
  daily: 24,
  every_2_days: 48,
  every_3_days: 72,
  weekly: 168,
};

const EVENING_HOUR = 20; // 8 PM

function getCurrentHourInTimezone(tz: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    });
    return parseInt(formatter.format(now));
  } catch {
    return new Date().getUTCHours(); // fallback
  }
}

// ─── Pick a rotating therapeutic prompt ─────────────────────

function pickTherapeuticPrompt(): string {
  const idx = Math.floor(Math.random() * THERAPEUTIC_PROMPTS.length);
  return THERAPEUTIC_PROMPTS[idx].text;
}

// ─── Compute streak from focus_segments ─────────────────────

async function getStreakForUser(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<number> {
  const { data: segments } = await db
    .from('focus_segments')
    .select('date, status')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(90);

  if (!segments) return 0;
  let streak = 0;
  for (const seg of segments) {
    if (seg.status === 'focused') streak++;
    else break;
  }
  return streak;
}

// ─── Get today's commitment ─────────────────────────────────

async function getTodayCommitment(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
  tz: string,
): Promise<string | null> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: tz });
  const { data } = await db
    .from('daily_commitments')
    .select('intention')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();
  return data?.intention ?? null;
}

// ─── Check for sealed letter hint ───────────────────────────

async function getSealedLetterHint(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<boolean> {
  const { count } = await db
    .from('future_letters')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('delivered', false)
    .limit(1);
  return (count ?? 0) > 0;
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
  const { data: prefs } = await db
    .from('journal_preferences')
    .select(
      'user_id, frequency, preferred_hour, timezone, last_reminder_at, relapse_delay_minutes',
    )
    .eq('reminder_enabled', true);

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({
      sent: 0,
      message: 'No users with reminders enabled',
    });
  }

  for (const pref of prefs) {
    try {
      const tz = pref.timezone || 'America/New_York';
      const currentHour = getCurrentHourInTimezone(tz);

      // ── Determine notification type ───────────────────────

      const isMorningHour = currentHour === pref.preferred_hour;
      const isEveningHour = currentHour === EVENING_HOUR;

      if (!isMorningHour && !isEveningHour) {
        skipped++;
        continue;
      }

      // Frequency check: has enough time passed since last reminder?
      if (pref.last_reminder_at) {
        const hoursSinceLast =
          (now.getTime() - new Date(pref.last_reminder_at).getTime()) /
          3600000;
        const requiredHours = FREQUENCY_HOURS[pref.frequency] || 24;
        // For evening, allow if morning was sent (min 6 hours gap)
        const minGap = isEveningHour ? 6 : requiredHours - 1;
        if (hoursSinceLast < minGap) {
          skipped++;
          continue;
        }
      }

      // Get user info
      const [{ data: user }, streakCount] = await Promise.all([
        db
          .from('users')
          .select('name, email')
          .eq('id', pref.user_id)
          .single(),
        getStreakForUser(db, pref.user_id),
      ]);

      if (!user) {
        skipped++;
        continue;
      }

      const firstName = user.name?.split(' ')[0] || 'there';
      const streakText =
        streakCount > 0
          ? `Your streak: ${streakCount} day${streakCount !== 1 ? 's' : ''}.`
          : '';

      // ── Build notification content ────────────────────────

      let pushTitle: string;
      let pushBody: string;
      let pushUrl: string;
      let emailSubject: string;
      let emailBody: string;

      if (isMorningHour) {
        // Morning: commitment + streak + therapeutic prompt
        const [commitment, prompt] = await Promise.all([
          getTodayCommitment(db, pref.user_id, tz),
          Promise.resolve(pickTherapeuticPrompt()),
        ]);

        const commitmentText = commitment
          ? `${commitment}.`
          : `Good morning, ${firstName}.`;

        pushTitle = `Good morning, ${firstName}`;
        pushBody = `${commitmentText} ${streakText} Prompt: ${prompt}`;
        pushUrl =
          '/dashboard/stringer-journal?action=write&trigger=morning-reminder';
        emailSubject = `Good morning, ${firstName} — your daily reflection`;

        const quote =
          STRINGER_QUOTES[
            Math.floor(Math.random() * STRINGER_QUOTES.length)
          ];

        emailBody = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-block;background:#226779;color:white;padding:5px 16px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">Good morning, ${escapeHtml(firstName)}</h2>
    ${commitment ? `<p style="font-size:14px;color:#1a1a1a;margin:0 0 16px;line-height:1.6;"><strong>Today's commitment:</strong> ${escapeHtml(commitment)}</p>` : ''}
    ${streakCount > 0 ? `<p style="font-size:13px;color:#226779;font-weight:600;margin:0 0 16px;">${streakCount}-day streak</p>` : ''}
    <div style="background:#f0f9ff;border-left:3px solid #226779;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:#0c4a5e;line-height:1.6;">${escapeHtml(prompt)}</p>
    </div>
    <a href="${APP_URL}/dashboard/stringer-journal?action=write&trigger=morning-reminder&prompt=${encodeURIComponent(prompt)}"
      style="display:block;text-align:center;background:#226779;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;font-size:14px;">
      Open Journal
    </a>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;font-style:italic;">
      "${escapeHtml(quote.text)}"
    </p>
  </div>
</div></body></html>`;
      } else {
        // Evening: daily inventory reminder + streak
        pushTitle = 'Time for your daily inventory';
        pushBody = `${streakText ? `${streakCount}-day streak. ` : ''}How was today?`;
        pushUrl = '/dashboard/inventory?trigger=evening-reminder';
        emailSubject = 'Time for your daily inventory';

        emailBody = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-block;background:#226779;color:white;padding:5px 16px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">Evening check-in</h2>
    ${streakCount > 0 ? `<p style="font-size:13px;color:#226779;font-weight:600;margin:0 0 16px;">${streakCount}-day streak</p>` : ''}
    <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 20px;">Take a few minutes to review your day. What went well? Where did you struggle? Honest reflection builds lasting change.</p>
    <a href="${APP_URL}/dashboard/inventory?trigger=evening-reminder"
      style="display:block;text-align:center;background:#226779;color:#fff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:600;font-size:14px;">
      Start Inventory
    </a>
  </div>
</div></body></html>`;
      }

      // ── Send push notification ────────────────────────────

      await sendPushToUser(db, pref.user_id, {
        title: pushTitle,
        body: pushBody,
        data: {
          type: isMorningHour ? 'morning_reminder' : 'evening_reminder',
          url: pushUrl,
        },
      });

      // ── Send email ────────────────────────────────────────

      if (user.email) {
        await getResend()
          .emails.send({
            from: FROM,
            to: user.email,
            subject: emailSubject,
            html: emailBody,
          })
          .catch(() => {}); // Non-fatal
      }

      // Update last_reminder_at
      await db
        .from('journal_preferences')
        .update({ last_reminder_at: now.toISOString() })
        .eq('user_id', pref.user_id);

      sent++;
    } catch (e) {
      console.error(`Journal reminder failed for ${pref.user_id}:`, e);
      skipped++;
    }
  }

  // ── Handle relapse notifications ──────────────────────────
  // Check for users who logged a relapse event recently and need
  // a compassionate follow-up after their configured delay.

  let relapseSent = 0;
  try {
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    // Find recent relapse events within 30min - 2hr window
    // (so we send exactly once, ~30 min after the event)
    const { data: relapseEvents } = await db
      .from('events')
      .select('user_id, timestamp')
      .eq('category', 'relapse')
      .gte('timestamp', twoHoursAgo)
      .lte('timestamp', thirtyMinAgo)
      .order('timestamp', { ascending: false });

    if (relapseEvents && relapseEvents.length > 0) {
      // De-duplicate by user_id (only send once per user)
      const seen = new Set<string>();
      for (const event of relapseEvents) {
        if (seen.has(event.user_id)) continue;
        seen.add(event.user_id);

        try {
          // Check if we already sent a relapse notification recently
          const { data: recentNotif } = await db
            .from('journal_preferences')
            .select('last_relapse_notification_at')
            .eq('user_id', event.user_id)
            .maybeSingle();

          if (recentNotif?.last_relapse_notification_at) {
            const hoursSince =
              (now.getTime() -
                new Date(recentNotif.last_relapse_notification_at).getTime()) /
              3600000;
            if (hoursSince < 12) continue; // Don't spam — max once per 12 hours
          }

          const hasLetter = await getSealedLetterHint(db, event.user_id);

          let body = "Your coach is here when you're ready. No judgment \u2014 just understanding.";
          if (hasLetter) {
            body =
              "You wrote yourself a letter for this moment. Your coach is here when you're ready. No judgment \u2014 just understanding.";
          }

          await sendPushToUser(db, event.user_id, {
            title: "We're here for you",
            body,
            data: {
              type: 'relapse_support',
              url: '/dashboard/coach?trigger=relapse-support',
            },
          });

          // Mark that we sent the notification
          await db
            .from('journal_preferences')
            .update({ last_relapse_notification_at: now.toISOString() })
            .eq('user_id', event.user_id);

          relapseSent++;
        } catch (e) {
          console.error(
            `Relapse notification failed for ${event.user_id}:`,
            e,
          );
        }
      }
    }
  } catch (e) {
    console.error('Relapse notification scan failed:', e);
  }

  await logCronRun(db, 'journal-reminders', { sent, skipped, users_processed: prefs.length });
  return NextResponse.json({
    sent,
    skipped,
    relapseSent,
    total: prefs.length,
  });
}
