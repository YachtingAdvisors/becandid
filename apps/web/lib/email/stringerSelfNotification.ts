// ============================================================
// lib/email/stringerSelfNotification.ts
//
// If this file doesn't exist from a previous package, use this.
// The alert pipeline imports generateSelfNotificationEmail.
// ============================================================

import { STRINGER_QUOTES } from '@be-candid/shared';

interface SelfNotificationInput {
  userName: string;
  category: string;
  categoryLabel: string;
  severity: 'low' | 'medium' | 'high';
  alertId: string;
  appUrl: string;
  journalUrl: string;
}

export function generateSelfNotificationEmail(input: SelfNotificationInput): {
  subject: string;
  html: string;
} {
  const quote = STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)];
  const introMap: Record<string, string> = {
    low: "Something came up on your screen today.",
    medium: "We noticed some activity that matched one of your focus areas.",
    high: "There was significant activity in one of your focus areas today.",
  };

  return {
    subject: 'Be Candid \u2014 A moment to pause and reflect',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#4f46e5;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="font-family:Georgia,serif;font-size:22px;color:#0f0e1a;margin:0 0 16px;text-align:center;">Hey ${input.userName}</h2>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">${introMap[input.severity] || introMap.medium} Your partner has been notified \u2014 not to judge, but to walk with you.</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px;">Research shows that these moments are never random \u2014 they're connected to what's happening beneath the surface.</p>
    <div style="background:#faf5ff;border-left:3px solid #8b5cf6;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 24px;">
      <p style="margin:0;font-size:13px;color:#6d28d9;font-style:italic;line-height:1.6;">"${quote.text}"</p>
      <p style="margin:6px 0 0;font-size:11px;color:#a78bfa;">\u2014 ${quote.ref}</p>
    </div>
    <p style="font-size:13px;font-weight:700;color:#0f0e1a;margin:0 0 10px;">Before you do anything else, ask yourself:</p>
    <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:0 0 24px;">
      <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.5;">\uD83C\uDF0A <strong>The Tributaries:</strong> What was happening emotionally in the hours before?</p>
      <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.5;">\uD83D\uDC9B <strong>The Unmet Longing:</strong> What did you actually need in that moment?</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">\uD83E\uDDED <strong>The Roadmap:</strong> What is this revealing about the life you want?</p>
    </div>
    <a href="${input.journalUrl}" style="display:block;text-align:center;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:14px;margin:0 0 12px;">Open Your Journal \u2192</a>
    <a href="${input.appUrl}/dashboard/conversation/${input.alertId}" style="display:block;text-align:center;color:#4f46e5;text-decoration:none;padding:10px;font-size:13px;">View Conversation Guide</a>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;line-height:1.6;margin-top:20px;">This is between you and your journey. Your partner sees the alert \u2014 not this email.</p>
</div></body></html>`,
  };
}
