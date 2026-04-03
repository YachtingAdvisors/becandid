// ============================================================
// Be Candid — Check-in Notifications
// Sends email + SMS to both user and partner when a check-in
// is created, and follow-ups when one side confirms.
// ============================================================

import { escapeHtml } from '@/lib/security';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// ─── Email Templates ──────────────────────────────────────────

export function buildUserCheckInEmail(params: {
  userName: string;
  prompt: string;
  checkInId: string;
  dueAt: string;
  frequency: string;
}): { subject: string; html: string } {
  const { userName, prompt, checkInId, dueAt, frequency } = params;
  const url = `${APP_URL}/dashboard/checkins`;
  const dueDate = new Date(dueAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return {
    subject: `📋 Check-in time, ${escapeHtml(userName)}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="width:48px;height:48px;border-radius:12px;background:#4f46e5;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:white;font-weight:bold;font-size:18px;">C</span>
    </div>
  </div>

  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">Hey ${escapeHtml(userName)} 👋</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">${escapeHtml(prompt)}</p>

    <div style="background:#f8f7ff;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#4f46e5;font-size:13px;font-weight:600;">
        ⏰ Both you and your partner must confirm by ${dueDate}
      </p>
    </div>

    <a href="${url}" style="display:block;text-align:center;background:#4f46e5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Open Check-in →
    </a>
  </div>

  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
    Be Candid · Accountability that heals
  </p>
</div>
</body></html>`,
  };
}

export function buildPartnerCheckInEmail(params: {
  partnerName: string;
  monitoredUserName: string;
  checkInId: string;
  dueAt: string;
}): { subject: string; html: string } {
  const { partnerName, monitoredUserName, checkInId, dueAt } = params;
  const url = `${APP_URL}/partner/checkins`;
  const dueDate = new Date(dueAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return {
    subject: `📋 ${escapeHtml(monitoredUserName)}'s check-in needs your response`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="width:48px;height:48px;border-radius:12px;background:#4f46e5;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:white;font-weight:bold;font-size:18px;">C</span>
    </div>
  </div>

  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">Hey ${escapeHtml(partnerName)} 👋</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      ${escapeHtml(monitoredUserName)} has a check-in waiting. Your confirmation shows you're engaged
      and paying attention — it matters more than you think.
    </p>

    <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#059669;font-size:13px;">
        <strong>How it works:</strong> Share how you feel about ${escapeHtml(monitoredUserName)}'s progress.
        Both of you must respond by ${dueDate} for the check-in to count.
      </p>
    </div>

    <a href="${url}" style="display:block;text-align:center;background:#4f46e5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Confirm Check-in →
    </a>
  </div>

  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
    Be Candid · Accountability that heals
  </p>
</div>
</body></html>`,
  };
}

export function buildConfirmationFollowUpEmail(params: {
  recipientName: string;
  confirmerName: string;
  confirmerRole: 'user' | 'partner';
  checkInId: string;
}): { subject: string; html: string } {
  const { recipientName, confirmerName, confirmerRole, checkInId } = params;
  const url = confirmerRole === 'user'
    ? `${APP_URL}/partner/checkins`
    : `${APP_URL}/dashboard/checkins`;

  return {
    subject: `✅ ${escapeHtml(confirmerName)} confirmed — your turn!`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #e5e7eb;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">✅</div>
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">${escapeHtml(confirmerName)} just checked in</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      Hey ${escapeHtml(recipientName)} — ${escapeHtml(confirmerName)} has confirmed their side of the check-in.
      Now it's your turn to complete it.
    </p>
    <a href="${url}" style="display:inline-block;background:#4f46e5;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Complete Check-in →
    </a>
  </div>
</div>
</body></html>`,
  };
}

// ─── SMS Templates ────────────────────────────────────────────

export function buildUserCheckInSMS(userName: string, prompt: string): string {
  return `${prompt} Both you and your partner need to confirm. Open Be Candid to check in.`;
}

export function buildPartnerCheckInSMS(partnerName: string, monitoredName: string): string {
  return `Hey ${partnerName} — ${monitoredName} has a check-in waiting for your response. Open Be Candid to confirm.`;
}

export function buildFollowUpSMS(recipientName: string, confirmerName: string): string {
  return `${confirmerName} just confirmed their check-in. Your turn, ${recipientName}! Open Be Candid to complete it.`;
}
