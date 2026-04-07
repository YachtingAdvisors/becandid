export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/reengagement/route.ts
//
// Daily cron: 3-stage churn prevention email escalation.
//
//   Stage 1 (day 3 inactive)  → Gentle nudge: streak + last mood
//   Stage 2 (day 7 inactive)  → Urgency: progress stats, streak at risk
//   Stage 3 (day 14 inactive) → Final: no guilt, we'll be here
//
// After stage 3, stop emailing. Respect the user's space.
//
// Tracks progress via users.churn_stage (0-3) and
// users.last_churn_email_at to prevent spamming.
//
// Schedule: "0 10 * * *" (daily at 10 AM UTC)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyCronAuth } from '@/lib/cronAuth';
import { escapeHtml } from '@/lib/security';
import { emailWrapper } from '@/lib/email/template';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';
const FROM = process.env.EMAIL_FROM ?? 'Be Candid <noreply@becandid.io>';

// ─── Types ──────────────────────────────────────────────────

interface UserStats {
  streak: number;
  journalCount: number;
  conversationCount: number;
  lastMood: string | null;
}

interface ChurnStage {
  /** Minimum days inactive to trigger this stage */
  inactiveDays: number;
  /** The churn_stage value after sending (1-indexed) */
  stageAfterSend: number;
  /** Generate subject line */
  subject: (name: string, stats: UserStats) => string;
  /** Generate email body HTML */
  body: (firstName: string, stats: UserStats) => string;
  /** CTA button label */
  ctaLabel: string;
  /** CTA URL path */
  ctaPath: string;
  /** Preheader text */
  preheader: (name: string, stats: UserStats) => string;
}

// ─── Stage definitions ──────────────────────────────────────

const CHURN_STAGES: readonly ChurnStage[] = [
  // ── Stage 1: Day 3 — Gentle nudge ──────────────────────
  {
    inactiveDays: 3,
    stageAfterSend: 1,
    subject: (name) => `We miss you, ${name}`,
    preheader: (_, stats) =>
      stats.streak > 0
        ? `Your ${stats.streak}-day streak is waiting.`
        : 'Your accountability journey is waiting.',
    ctaLabel: 'Quick check-in',
    ctaPath: '/dashboard?trigger=churn-nudge',
    body: (firstName, stats) => {
      const streakLine =
        stats.streak > 0
          ? `<p style="font-size:28px;font-weight:700;color:#226779;margin:0 0 4px;text-align:center;">${stats.streak}-day streak</p>
             <p class="text-muted" style="font-size:13px;color:#9ca3af;margin:0 0 20px;text-align:center;">waiting for you</p>`
          : '';

      const moodLine = stats.lastMood
        ? `<p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">Last time you checked in, you were feeling <strong>${escapeHtml(stats.lastMood)}</strong>. How are things now?</p>`
        : '';

      return `
        <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
          We miss you, ${escapeHtml(firstName)}
        </h2>
        ${streakLine}
        ${moodLine}
        <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
          Your streak is waiting. One check-in keeps it alive — and it only takes 30 seconds.
        </p>`;
    },
  },

  // ── Stage 2: Day 7 — Urgency ───────────────────────────
  {
    inactiveDays: 7,
    stageAfterSend: 2,
    subject: (name, stats) =>
      stats.streak > 0
        ? `Your ${stats.streak}-day streak is about to reset`
        : `${name}, your progress is waiting`,
    preheader: (_, stats) =>
      `You've journaled ${stats.journalCount} times. Don't let that momentum go.`,
    ctaLabel: 'Come back',
    ctaPath: '/dashboard?trigger=churn-urgent',
    body: (firstName, stats) => {
      const progressLines: string[] = [];
      if (stats.journalCount > 0) {
        progressLines.push(
          `Journaled <strong>${stats.journalCount}</strong> time${stats.journalCount !== 1 ? 's' : ''}`,
        );
      }
      if (stats.conversationCount > 0) {
        progressLines.push(
          `Completed <strong>${stats.conversationCount}</strong> coaching conversation${stats.conversationCount !== 1 ? 's' : ''}`,
        );
      }
      if (stats.streak > 0) {
        progressLines.push(
          `Built a <strong>${stats.streak}-day</strong> streak`,
        );
      }

      const progressBlock =
        progressLines.length > 0
          ? `<div style="background:#f0f9ff;border-radius:12px;padding:20px;margin:0 0 16px;">
               <p style="margin:0 0 8px;font-size:14px;color:#0c4a5e;font-weight:600;">Your progress so far:</p>
               <ul style="margin:0;padding-left:20px;color:#0c4a5e;font-size:15px;line-height:1.8;">
                 ${progressLines.map((l) => `<li>${l}</li>`).join('')}
               </ul>
             </div>`
          : '';

      return `
        <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
          ${escapeHtml(firstName)}, don't let the momentum go
        </h2>
        ${progressBlock}
        <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
          Everything you've built is still here. One check-in is all it takes to pick back up.
        </p>`;
    },
  },

  // ── Stage 3: Day 14 — Final (no guilt) ─────────────────
  {
    inactiveDays: 14,
    stageAfterSend: 3,
    subject: () => "We'll be here when you're ready",
    preheader: () => 'Your journals, streak, and progress are saved.',
    ctaLabel: 'Return to your dashboard',
    ctaPath: '/dashboard?trigger=churn-final',
    body: (firstName) => `
      <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
        No pressure, ${escapeHtml(firstName)}
      </h2>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        Recovery isn't linear. Life gets busy, motivation fluctuates, and sometimes you need space. That's okay.
      </p>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        We've saved everything — your streak, your journals, your coaching conversations, and your progress. Nothing is lost.
      </p>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
        Come back whenever you're ready. We'll be here.
      </p>`,
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────

function daysInactive(lastActiveAt: string | null): number {
  if (!lastActiveAt) return 30; // treat never-active as 30 days
  return Math.floor(
    (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24),
  );
}

async function getUserStats(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<UserStats> {
  const [streakResult, journalResult, conversationResult, moodResult] =
    await Promise.all([
      // Streak from focus_segments
      db
        .from('focus_segments')
        .select('date, status')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(90),
      // Journal count
      db
        .from('stringer_journal')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      // Conversation count
      db
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      // Last mood from check-ins
      db
        .from('check_ins')
        .select('mood')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  // Calculate streak
  let streak = 0;
  const segments = streakResult.data ?? [];
  for (const seg of segments) {
    if (seg.status === 'focused') streak++;
    else break;
  }

  return {
    streak,
    journalCount: journalResult.count ?? 0,
    conversationCount: conversationResult.count ?? 0,
    lastMood: moodResult.data?.mood ?? null,
  };
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Handler ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const results = { sent: 0, skipped: 0, errors: 0 };

  // Find users inactive for 3+ days who haven't completed all 3 stages.
  // Also exclude users who signed up less than 14 days ago and are still
  // in the onboarding sequence (don't overlap).
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const fourteenDaysAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: dormantUsers } = await db
    .from('users')
    .select(
      'id, name, email, last_active_at, notification_prefs, churn_stage, last_churn_email_at, onboarding_step, created_at',
    )
    .eq('monitoring_enabled', true)
    .lt('churn_stage', 3)
    .or(`last_active_at.lt.${threeDaysAgo},last_active_at.is.null`);

  if (!dormantUsers || dormantUsers.length === 0) {
    return NextResponse.json({ ok: true, ...results, message: 'No dormant users' });
  }

  for (const user of dormantUsers) {
    try {
      // Respect notification preferences
      const prefs = user.notification_prefs ?? {};
      if (prefs.digest_email === false) {
        results.skipped++;
        continue;
      }

      // Skip users still in active onboarding (< 14 days old, not done)
      const userAge = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (userAge < 14 && (user.onboarding_step ?? 0) < 5) {
        results.skipped++;
        continue;
      }

      const inactive = daysInactive(user.last_active_at);
      const currentStage = user.churn_stage ?? 0;

      // Prevent sending more than one churn email per 3 days
      if (user.last_churn_email_at) {
        const daysSinceLastChurn = Math.floor(
          (Date.now() - new Date(user.last_churn_email_at).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysSinceLastChurn < 3) {
          results.skipped++;
          continue;
        }
      }

      // Find the next stage to send
      const nextStage = CHURN_STAGES.find(
        (s) =>
          s.stageAfterSend === currentStage + 1 &&
          inactive >= s.inactiveDays,
      );

      if (!nextStage) {
        results.skipped++;
        continue;
      }

      const firstName = user.name?.split(' ')[0] ?? 'there';
      const stats = await getUserStats(db, user.id);

      const subject = nextStage.subject(firstName, stats);
      const preheader = nextStage.preheader(firstName, stats);
      const bodyHtml = nextStage.body(firstName, stats);

      const html = emailWrapper({
        preheader,
        body: bodyHtml,
        ctaUrl: `${APP_URL}${nextStage.ctaPath}`,
        ctaLabel: nextStage.ctaLabel,
      });

      // Send the email
      try {
        await sendEmail(user.email, subject, html);
      } catch (emailErr) {
        console.error(
          `[cron/reengagement] Email send failed for ${user.id}:`,
          emailErr,
        );
        results.errors++;
        continue;
      }

      // Update churn tracking
      await db
        .from('users')
        .update({
          churn_stage: nextStage.stageAfterSend,
          last_churn_email_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Log as a nudge for audit trail
      await db.from('nudges').insert({
        user_id: user.id,
        trigger_type: 'churn_prevention' as any,
        severity:
          nextStage.stageAfterSend === 1
            ? 'info'
            : nextStage.stageAfterSend === 2
              ? 'warning'
              : 'info',
        message: `Churn prevention stage ${nextStage.stageAfterSend} sent (${inactive} days inactive)`,
      });

      results.sent++;
    } catch (err) {
      console.error(`[cron/reengagement] Error for ${user.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
