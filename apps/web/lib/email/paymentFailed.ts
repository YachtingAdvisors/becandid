// ============================================================
// lib/email/paymentFailed.ts
//
// Sent when Stripe invoice.payment_failed fires.
// Gentle, non-alarming tone — directs user to update billing.
// ============================================================

import { Resend } from 'resend';
import { emailWrapper } from './template';
import { escapeHtml } from '@/lib/security';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <billing@becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

export async function sendPaymentFailedEmail(params: {
  email: string;
  name: string;
  attemptCount: number;
  nextAttempt: Date | null;
}) {
  const { email, name, attemptCount, nextAttempt } = params;
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const retryNote = nextAttempt
    ? `We'll automatically retry on ${nextAttempt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
    : 'Please update your payment method to keep your plan active.';

  const html = emailWrapper({
    preheader: 'Quick heads-up about your Be Candid subscription payment',
    body: `
      <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
        Hey ${escapeHtml(name)},
      </h2>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        We had trouble processing your subscription payment${attemptCount > 1 ? ` (attempt ${attemptCount})` : ''}.
        Your access isn't affected yet, but we wanted to let you know.
      </p>
      <p class="text-body" style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.7;">
        ${retryNote}
      </p>
      <p class="text-body" style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
        If your card has changed or expired, you can update it in billing settings.
      </p>
    `,
    ctaUrl: `${APP_URL}/dashboard/settings?tab=billing`,
    ctaLabel: 'Update Payment Method',
    footerNote: 'If you believe this is an error, just reply to this email.',
  });

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Action needed: Payment issue with your Be Candid subscription',
    html,
  });
}
