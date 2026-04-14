// ============================================================
// Be Candid — Email Service (Resend)
// ============================================================

import { Resend } from 'resend';
import { formatGuideForEmail, type AIConversationGuide } from './claude';
import type { User, Partner, Event, Alert } from '@be-candid/shared';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';
import { emailWrapper } from './email/template';

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

/**
 * Canonical FROM address for all outbound emails.
 * Import this from '@/lib/email' instead of defining your own FROM constant.
 * Using a single sender identity avoids SPF/DKIM alignment issues.
 */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';

const FROM = EMAIL_FROM;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// ─── Partner Alert Email ──────────────────────────────────────
export async function sendPartnerAlertEmail(params: {
  partner: Partner;
  user: User;
  event: Event;
  alert: Alert;
  guide: AIConversationGuide | null;
}) {
  const { partner, user, event, alert, guide } = params;
  const categoryLabel = GOAL_LABELS[event.category as GoalCategory] ?? event.category;
  const conversationUrl = `${APP_URL}/conversation/${alert.id}`;

  const guideHtml = guide
    ? formatGuideForEmail(guide, 'partner', partner.partner_name)
    : '';

  return getResend().emails.send({
    from: FROM,
    to: partner.partner_email,
    subject: `${user.name} needs your support — ${categoryLabel} alert`,
    html: emailWrapper({
      preheader: `${user.name} flagged activity in ${categoryLabel} — your conversation guide is ready`,
      body: `
        <h2 class="text-heading" style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;">
          ${user.name} flagged: ${categoryLabel}
        </h2>
        <p class="text-body" style="margin:0 0 4px;color:#6b7280;font-size:14px;">
          Severity: <strong>${event.severity}</strong> &middot; ${event.platform}
        </p>
        <p class="text-muted" style="margin:0 0 20px;color:#9ca3af;font-size:13px;">
          ${new Date(event.timestamp).toLocaleString()}
        </p>
        ${guideHtml}
      `,
      ctaUrl: conversationUrl,
      ctaLabel: 'Start the Conversation',
    }),
  });
}

// ─── User Self-Notification Email ─────────────────────────────
export async function sendUserSelfNotificationEmail(params: {
  user: User;
  partner: Partner;
  event: Event;
  alert: Alert;
  guide: AIConversationGuide | null;
}) {
  const { user, partner, event, alert, guide } = params;
  const categoryLabel = GOAL_LABELS[event.category as GoalCategory] ?? event.category;
  const conversationUrl = `${APP_URL}/conversation/${alert.id}`;

  const guideHtml = guide
    ? formatGuideForEmail(guide, 'user', user.name)
    : '';

  return getResend().emails.send({
    from: FROM,
    to: user.email,
    subject: `We noticed something — here's your conversation guide`,
    html: emailWrapper({
      preheader: `A ${event.severity} ${categoryLabel} flag was recorded — your conversation guide is ready`,
      body: `
        <h2 class="text-heading" style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;">Hey ${user.name}</h2>
        <p class="text-body" style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.7;">
          A ${event.severity} ${categoryLabel} flag was just recorded. ${partner.partner_name} has been notified.
          Here's your conversation guide to get ahead of it.
        </p>
        ${guideHtml}
      `,
      ctaUrl: conversationUrl,
      ctaLabel: 'View Full Guide',
    }),
  });
}
