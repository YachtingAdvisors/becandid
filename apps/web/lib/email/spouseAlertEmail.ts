// ============================================================
// lib/email/spouseAlertEmail.ts
//
// When an alert fires and the partner is a spouse, the email
// is fundamentally different from the friend/mentor version.
//
// Friend email: "Hey, your friend could use support."
// Spouse email: "This happened. You're allowed to feel whatever
//   you're feeling. Check in with yourself before you respond."
//
// The spouse email:
//   1. Acknowledges this is personal, not abstract
//   2. Validates whatever they're feeling
//   3. Tells them to check in with THEMSELVES first
//   4. Offers the conversation guide when they're ready
//   5. Links to their journal (not just the guide)
//   6. Reminds them they're a Committed Contender
// ============================================================

import { SPOUSE_ALERT_PROMPTS } from '../spouseExperience';

interface SpouseAlertEmailInput {
  spouseName: string;
  userName: string;
  categoryLabel: string;
  severity: string;
  alertId: string;
  appUrl: string;
  contenderLevel: number;
}

export function generateSpouseAlertEmail(input: SpouseAlertEmailInput): {
  subject: string;
  html: string;
} {
  const prompt = SPOUSE_ALERT_PROMPTS[Math.floor(Math.random() * SPOUSE_ALERT_PROMPTS.length)];

  const contenderMessage = input.contenderLevel >= 2
    ? "You've shown up through hard moments before. You'll get through this one too."
    : input.contenderLevel >= 1
      ? "Every time you engage with courage, you're building something real."
      : "Being here — reading this — is a choice. And it matters.";

  return {
    subject: `Be Candid — ${input.userName} had a moment of struggle`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#4f46e5;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">

    <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 16px;">
      ${input.spouseName},
    </h2>

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
      ${input.userName} had a flag in <strong>${input.categoryLabel}</strong>.
      This is the information you asked to receive. What you do with it is up to you.
    </p>

    <!-- Self-care first -->
    <div style="background:#fef2f2;border-left:3px solid #f87171;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#991b1b;font-weight:600;margin-bottom:6px;">Check in with yourself first</p>
      <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
        ${prompt}
      </p>
    </div>

    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
      You don't have to respond right now. You don't have to be okay with this.
      You're allowed to feel whatever you're feeling — hurt, anger, numbness, all of it.
    </p>

    <!-- Two CTAs -->
    <div style="display:flex;gap:10px;margin-bottom:20px;">
      <a href="${input.appUrl}/partner/journal" style="flex:1;display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:13px 16px;border-radius:10px;font-weight:600;font-size:13px;">
        📓 My Journal
      </a>
      <a href="${input.appUrl}/partner/conversation/${input.alertId}" style="flex:1;display:block;text-align:center;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 16px;border-radius:10px;font-weight:600;font-size:13px;">
        💬 Conversation Guide
      </a>
    </div>

    <!-- Contender acknowledgment -->
    <div style="background:#faf5ff;border-radius:10px;padding:14px;margin-bottom:16px;">
      <p style="margin:0;font-size:12px;color:#6d28d9;line-height:1.6;">
        <strong>You are a Committed Contender.</strong>
        ${contenderMessage}
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;">
      "Healing is not about simply saying no; it is about saying yes to the good, the true, and the beautiful."
    </p>
  </div>

  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
    Your journal is private. Your impact check-ins are private unless you choose to share them.
  </p>
</div></body></html>`,
  };
}
