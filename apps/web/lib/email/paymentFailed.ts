// ============================================================
// lib/email/paymentFailed.ts
//
// Dunning email sequence for failed payments:
//   1. Immediate: gentle heads-up with billing portal link
//   2. 3 days: urgency with streak/journal data
//   3. 7 days: downgrade notification
// ============================================================

import { Resend } from 'resend';
import { emailWrapper } from './template';
import { escapeHtml } from '@/lib/security';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@updates.becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// ── Email 1: Immediate — gentle heads-up ────────────────────

export async function sendPaymentFailedEmail(params: {
  email: string;
  name: string;
  planName: string;
  attemptCount: number;
  nextAttempt: Date | null;
}) {
  const { email, name, planName, attemptCount, nextAttempt } = params;
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const retryNote = nextAttempt
    ? `We'll automatically retry on ${nextAttempt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
    : 'Please update your payment method to keep your plan active.';

  const html = emailWrapper({
    preheader: 'Your Be Candid payment needs attention',
    body: `
      <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
        Hey ${escapeHtml(name)},
      </h2>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        Your last payment didn't go through${attemptCount > 1 ? ` (attempt ${attemptCount})` : ''}.
        Update your payment method to keep your ${escapeHtml(planName)} features.
      </p>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        ${retryNote}
      </p>
      <p class="text-body" style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
        Your access isn't affected yet — we just wanted to give you a heads-up
        so nothing interrupts your journey.
      </p>
    `,
    ctaUrl: `${APP_URL}/dashboard/settings?tab=billing`,
    ctaLabel: 'Update Payment Method',
    footerNote: 'If you believe this is an error, just reply to this email.',
  });

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your Be Candid payment needs attention',
    html,
  });
}

// ── Email 2: 3-day follow-up — streak urgency ──────────────

export async function sendPaymentFollowUpEmail(params: {
  email: string;
  name: string;
  planName: string;
  streakDays: number;
  journalCount: number;
}) {
  const { email, name, planName, streakDays, journalCount } = params;
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const streakLine = streakDays > 0
    ? `You've built a <strong>${streakDays}-day streak</strong> and written <strong>${journalCount} journal entries</strong>.`
    : `You've written <strong>${journalCount} journal entries</strong> so far.`;

  const html = emailWrapper({
    preheader: `Don't lose your ${streakDays > 0 ? `${streakDays} day streak` : 'progress'}`,
    body: `
      <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
        ${escapeHtml(name)}, your ${escapeHtml(planName)} features are at risk
      </h2>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        We still haven't been able to process your payment. ${streakLine}
        Don't let a billing issue get in the way of your progress.
      </p>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        If your payment method isn't updated in the next few days,
        your ${escapeHtml(planName)} features will be paused. Your data is always safe —
        you just won't have access to premium features until billing is resolved.
      </p>
    `,
    ctaUrl: `${APP_URL}/dashboard/settings?tab=billing`,
    ctaLabel: 'Update Payment Method',
    footerNote: 'All your data is safe regardless of your plan status.',
  });

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Don't lose your ${streakDays > 0 ? `${streakDays} day streak` : 'progress'}`,
    html,
  });
}

// ── Email 3: 7-day downgrade notification ───────────────────

export async function sendDowngradeNotificationEmail(params: {
  email: string;
  name: string;
  planName: string;
}) {
  const { email, name, planName } = params;
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const html = emailWrapper({
    preheader: `Your ${planName} features have been paused`,
    body: `
      <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
        Your ${escapeHtml(planName)} features have been paused
      </h2>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        Hey ${escapeHtml(name)}, since we weren't able to process your payment,
        your account has been moved to the Free plan.
      </p>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        <strong>All your data is still here.</strong> Your journal entries, streaks,
        partner connections, and progress are exactly where you left them.
        Premium features are just paused until billing is resolved.
      </p>
      <p class="text-body" style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
        You can reactivate anytime by updating your payment method.
        We'd love to have you back.
      </p>
    `,
    ctaUrl: `${APP_URL}/dashboard/settings?tab=billing`,
    ctaLabel: 'Reactivate My Plan',
    footerNote: 'Your data is never deleted. You can always pick up where you left off.',
  });

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your ${planName} features have been paused`,
    html,
  });
}
