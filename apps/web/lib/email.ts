// ============================================================
// Be Candid — Email Service (Resend)
// ============================================================

import { Resend } from 'resend';
import { formatGuideForEmail, type AIConversationGuide } from './claude';
import type { User, Partner, Event, Alert } from '@be-candid/shared';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// ─── Email Footer (unsubscribe + settings links) ─────────────
function emailFooter(): string {
  return `
  <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
      Be Candid · Accountability that heals<br/>
      <a href="${APP_URL}/dashboard/notifications" style="color:#7c3aed;text-decoration:underline;">Manage notifications</a>
      &nbsp;·&nbsp;
      <a href="${APP_URL}/dashboard/settings" style="color:#7c3aed;text-decoration:underline;">Settings</a>
    </p>
  </div>`;
}

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
    subject: `⚡ ${user.name} needs your support — ${categoryLabel} alert`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">${user.name} flagged: ${categoryLabel}</h2>
    <p style="margin:0 0 4px;color:#6b7280;font-size:14px;">Severity: <strong>${event.severity}</strong> · ${event.platform}</p>
    <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">${new Date(event.timestamp).toLocaleString()}</p>

    ${guideHtml}

    <a href="${conversationUrl}" style="display:block;text-align:center;background:#4f46e5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">
      Start the Conversation →
    </a>
  </div>
  ${emailFooter()}
</div>
</body></html>`,
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
    subject: `💙 We noticed something — here's your conversation guide`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">Hey ${user.name}</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      A ${event.severity} ${categoryLabel} flag was just recorded. ${partner.partner_name} has been notified.
      Here's your conversation guide to get ahead of it.
    </p>

    ${guideHtml}

    <a href="${conversationUrl}" style="display:block;text-align:center;background:#4f46e5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin-top:20px;">
      View Full Guide →
    </a>
  </div>
  ${emailFooter()}
</div>
</body></html>`,
  });
}
