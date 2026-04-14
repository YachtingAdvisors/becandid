export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/onboarding-emails/route.ts
//
// Daily cron: sends the right onboarding email based on each
// user's signup age. 5 emails over 14 days:
//
//   Day  0 → Welcome
//   Day  2 → How to journal (Stringer prompts)
//   Day  5 → Invite a partner
//   Day  8 → Try the coach
//   Day 13 → Weekly reflection preview
//
// Tracks progress via users.onboarding_step (0-5).
// Respects notification_prefs.digest_email opt-out.
//
// Schedule: "0 9 * * *" (daily at 9 AM UTC)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyCronAuth } from '@/lib/cronAuth';
import { escapeHtml } from '@/lib/security';
import { emailWrapper } from '@/lib/email/template';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';
const FROM = process.env.EMAIL_FROM ?? 'Be Candid <noreply@becandid.io>';

// ─── Email step definitions ─────────────────────────────────

interface OnboardingStep {
  /** Minimum days since signup to send this email */
  dayThreshold: number;
  /** The onboarding_step value after sending (1-indexed) */
  stepAfterSend: number;
  /** Generate subject line */
  subject: (name: string) => string;
  /** Generate email body HTML (inner content for emailWrapper) */
  body: (ctx: EmailContext) => string;
  /** CTA button label */
  ctaLabel: string;
  /** CTA URL path */
  ctaPath: string;
  /** Preheader text */
  preheader: string;
}

interface EmailContext {
  firstName: string;
  journalCount: number;
}

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  // ── Day 0: Welcome ──────────────────────────────────────
  {
    dayThreshold: 0,
    stepAfterSend: 1,
    subject: (name) => `Welcome to Be Candid, ${name}`,
    preheader: 'Your accountability journey starts now.',
    ctaLabel: 'Write your first journal entry',
    ctaPath: '/dashboard/stringer-journal?action=write&trigger=onboarding-welcome',
    body: ({ firstName }) => `
      <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
        Welcome, ${escapeHtml(firstName)}
      </h2>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        You just took the hardest step — showing up. Be Candid is built to help you stay honest with yourself, build real accountability, and grow at your own pace.
      </p>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 8px;">
        Here's how it works:
      </p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:15px;line-height:1.8;">
        <li><strong>Journal honestly</strong> — guided prompts help you reflect on what matters, not just what happened.</li>
        <li><strong>Track your streak</strong> — consistency builds momentum. Even one sentence counts.</li>
        <li><strong>Get support</strong> — invite a partner, talk to the coach, or go solo. Your call.</li>
      </ul>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
        Start with a journal entry. It takes two minutes and sets the tone for everything else.
      </p>`,
  },

  // ── Day 2: How to journal ───────────────────────────────
  {
    dayThreshold: 2,
    stepAfterSend: 2,
    subject: () => 'The journal that changes everything',
    preheader: 'Three prompts. No wrong answers.',
    ctaLabel: 'Open your journal',
    ctaPath: '/dashboard/stringer-journal?action=write&trigger=onboarding-journal',
    body: ({ firstName }) => `
      <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
        ${escapeHtml(firstName)}, let's talk about journaling
      </h2>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        The Be Candid journal isn't a diary. It uses three prompts designed to surface what actually matters:
      </p>
      <div style="background:#f0f9ff;border-radius:12px;padding:20px;margin:0 0 16px;">
        <p style="margin:0 0 12px;font-size:15px;color:#0c4a5e;line-height:1.6;">
          <strong>Tributaries</strong> — What's flowing into your life right now? What influences, habits, or relationships are shaping your days?
        </p>
        <p style="margin:0 0 12px;font-size:15px;color:#0c4a5e;line-height:1.6;">
          <strong>Longing</strong> — What do you actually want? Not what you think you should want. What's the honest answer?
        </p>
        <p style="margin:0;font-size:15px;color:#0c4a5e;line-height:1.6;">
          <strong>Roadmap</strong> — What's one concrete step you can take today toward that longing?
        </p>
      </div>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
        You don't have to answer all three every time. Even one honest sentence moves the needle.
      </p>`,
  },

  // ── Day 5: Invite a partner ─────────────────────────────
  {
    dayThreshold: 5,
    stepAfterSend: 3,
    subject: () => 'Accountability works better with someone',
    preheader: '30 free days for both of you.',
    ctaLabel: 'Invite a partner',
    ctaPath: '/dashboard/partner?trigger=onboarding-invite',
    body: ({ firstName }) => `
      <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
        ${escapeHtml(firstName)}, consider bringing someone in
      </h2>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        An accountability partner doesn't need to see everything. Here's what they get access to:
      </p>
      <div style="margin:0 0 16px;">
        <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
          <span style="color:#22c55e;font-size:18px;margin-right:8px;line-height:1.4;">&#10003;</span>
          <span class="text-body" style="font-size:15px;color:#4b5563;line-height:1.6;">Your streak count and check-in status</span>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
          <span style="color:#22c55e;font-size:18px;margin-right:8px;line-height:1.4;">&#10003;</span>
          <span class="text-body" style="font-size:15px;color:#4b5563;line-height:1.6;">Alerts when you might need encouragement</span>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
          <span style="color:#ef4444;font-size:18px;margin-right:8px;line-height:1.4;">&#10007;</span>
          <span class="text-body" style="font-size:15px;color:#4b5563;line-height:1.6;">Your journal entries (always private)</span>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <span style="color:#ef4444;font-size:18px;margin-right:8px;line-height:1.4;">&#10007;</span>
          <span class="text-body" style="font-size:15px;color:#4b5563;line-height:1.6;">Your coaching conversations (always private)</span>
        </div>
      </div>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
        When you invite someone, you both get <strong>30 free days of Pro</strong>. They don't need to be in the same situation — they just need to care.
      </p>`,
  },

  // ── Day 8: Try the coach ────────────────────────────────
  {
    dayThreshold: 8,
    stepAfterSend: 4,
    subject: () => 'Your coach is here when things get hard',
    preheader: 'Not therapy. Not judgment. Guided self-reflection.',
    ctaLabel: 'Talk to your coach',
    ctaPath: '/dashboard/coach?trigger=onboarding-coach',
    body: ({ firstName }) => `
      <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
        ${escapeHtml(firstName)}, meet your Conversation Coach
      </h2>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        The coach is available 24/7 and designed for the moments when you need to think something through — before, during, or after a difficult moment.
      </p>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
        It's not therapy. It's not judgment. It's guided self-reflection that helps you:
      </p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:15px;line-height:1.8;">
        <li>Identify what triggered a craving or difficult emotion</li>
        <li>Work through urges without acting on them</li>
        <li>Process setbacks without spiraling</li>
        <li>Celebrate wins and understand what's working</li>
      </ul>
      <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
        Everything you say to the coach stays between you and the coach. Your partner never sees it.
      </p>`,
  },

  // ── Day 13: Weekly reflection preview ───────────────────
  {
    dayThreshold: 13,
    stepAfterSend: 5,
    subject: () => 'Your first weekly reflection arrives Monday',
    preheader: 'Journaling makes your reflection richer.',
    ctaLabel: 'Journal before Monday',
    ctaPath: '/dashboard/stringer-journal?action=write&trigger=onboarding-reflection',
    body: ({ firstName, journalCount }) => {
      const hasJournaled = journalCount >= 2;
      const progressNote = hasJournaled
        ? `<p class="text-body" style="font-size:15px;color:#226779;font-weight:600;line-height:1.7;margin:0 0 16px;">
            You've written ${journalCount} journal entries so far — your reflection this Monday will pull from all of them.
          </p>`
        : `<p class="text-body" style="font-size:15px;color:#b45309;line-height:1.7;margin:0 0 16px;">
            You haven't journaled much yet, and that's okay. Even one entry before Monday will give your reflection something real to work with.
          </p>`;

      return `
        <h2 class="text-heading" style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;">
          ${escapeHtml(firstName)}, your weekly reflection is coming
        </h2>
        <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
          Every Monday, Be Candid looks at your week — your journal entries, check-ins, streak, and coaching conversations — and generates a personalized reflection just for you.
        </p>
        <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
          It's not a report card. It's a mirror. It surfaces patterns you might not notice on your own and highlights what's actually changing.
        </p>
        ${progressNote}
        <p class="text-body" style="font-size:15px;color:#4b5563;line-height:1.7;margin:0;">
          The more you journal, the richer the reflection. One entry is enough to start.
        </p>`;
    },
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────

function daysSince(date: string): number {
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
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

  // Fetch users who haven't completed onboarding (step < 5)
  // and were created within the last 30 days (generous window).
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: users } = await db
    .from('users')
    .select('id, name, email, created_at, notification_prefs, onboarding_step')
    .lt('onboarding_step', 5)
    .gte('created_at', thirtyDaysAgo);

  if (!users || users.length === 0) {
    return NextResponse.json({ ok: true, ...results, message: 'No eligible users' });
  }

  for (const user of users) {
    try {
      // Respect notification preferences
      const prefs = user.notification_prefs ?? {};
      if (prefs.digest_email === false) {
        results.skipped++;
        continue;
      }

      const currentStep = user.onboarding_step ?? 0;
      const age = daysSince(user.created_at);

      // Find the next step this user should receive
      const nextStep = ONBOARDING_STEPS.find(
        (s) => s.stepAfterSend === currentStep + 1 && age >= s.dayThreshold,
      );

      if (!nextStep) {
        results.skipped++;
        continue;
      }

      const firstName = user.name?.split(' ')[0] ?? 'there';

      // For day 13, we need journal count
      let journalCount = 0;
      if (nextStep.stepAfterSend === 5) {
        const { count } = await db
          .from('stringer_journal')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        journalCount = count ?? 0;
      }

      const ctx: EmailContext = { firstName, journalCount };
      const subject = nextStep.subject(firstName);
      const bodyHtml = nextStep.body(ctx);

      const html = emailWrapper({
        preheader: nextStep.preheader,
        body: bodyHtml,
        ctaUrl: `${APP_URL}${nextStep.ctaPath}`,
        ctaLabel: nextStep.ctaLabel,
      });

      // Send the email
      try {
        await sendEmail(user.email, subject, html);
      } catch (emailErr) {
        console.error(`[cron/onboarding-emails] Email send failed for ${user.id}:`, emailErr);
        results.errors++;
        continue;
      }

      // Update the user's onboarding step
      await db
        .from('users')
        .update({ onboarding_step: nextStep.stepAfterSend })
        .eq('id', user.id);

      // Log as a nudge for audit trail
      await db.from('nudges').insert({
        user_id: user.id,
        trigger_type: 'onboarding' as any,
        severity: 'info',
        message: `Onboarding email step ${nextStep.stepAfterSend} sent (day ${age})`,
      });

      results.sent++;
    } catch (err) {
      console.error(`[cron/onboarding-emails] Error for ${user.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
