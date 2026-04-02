// ============================================================
// Be Candid — SMS Service (Twilio)
// ============================================================

import twilio from 'twilio';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );
}
const FROM_NUMBER = () => process.env.TWILIO_PHONE_NUMBER!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

/**
 * Send SMS to partner when an alert fires.
 * Compassionate tone — not clinical, not alarmist.
 */
export async function sendPartnerAlertSMS(params: {
  partnerPhone: string;
  partnerName: string;
  userName: string;
  category: string;
  severity: string;
  alertId: string;
}) {
  const { partnerPhone, partnerName, userName, category, severity, alertId } = params;
  if (!partnerPhone) return;

  const categoryLabel = GOAL_LABELS[category as GoalCategory] ?? category;
  const url = `${APP_URL}/dashboard/conversations`;

  // Compassionate, not alarmist
  const body = severity === 'high'
    ? `Be Candid: Hey ${partnerName}, ${userName} had a moment of struggle today (${categoryLabel}). A conversation guide is ready for you both. No judgment — just honesty. ${url}`
    : `Be Candid: Hey ${partnerName}, ${userName} could use your support (${categoryLabel}). A conversation guide is ready when you are. ${url}`;

  try {
    return await getClient().messages.create({ body, from: FROM_NUMBER(), to: partnerPhone });
  } catch (e) {
    console.error('Partner alert SMS failed:', e);
  }
}

/**
 * Send SMS to the user themselves after an alert.
 * Stringer-informed: kind, curious, not shaming.
 */
export async function sendUserSelfNotificationSMS(params: {
  userPhone: string;
  userName: string;
  category: string;
  alertId: string;
  hasParter: boolean;
}) {
  const { userPhone, userName, category, alertId, hasParter } = params;
  if (!userPhone) return;

  const journalUrl = `${APP_URL}/dashboard/stringer-journal?action=write&trigger=relapse&alert=${alertId}`;

  const body = hasParter
    ? `Be Candid: Hey ${userName}, we noticed something. Your partner has been notified to walk with you — not to judge you. When you're ready, reflect here: ${journalUrl}`
    : `Be Candid: Hey ${userName}, take a moment. The behavior is the signal, not the problem. What were you actually reaching for? Reflect here: ${journalUrl}`;

  try {
    return await getClient().messages.create({ body, from: FROM_NUMBER(), to: userPhone });
  } catch (e) {
    console.error('User self-notification SMS failed:', e);
  }
}

/**
 * Send nudge SMS to partner when user reports feeling low or in crisis.
 */
export async function sendNudgeSMS(params: {
  partnerPhone: string;
  partnerName: string;
  userName: string;
  moodLabel: string;
}) {
  const { partnerPhone, partnerName, userName, moodLabel } = params;
  if (!partnerPhone) return;

  const url = `${APP_URL}/dashboard/conversations`;
  const body = `Be Candid: Hey ${partnerName}, ${userName} is feeling ${moodLabel} right now and could use your support. A simple check-in can make all the difference. ${url}`;

  try {
    return await getClient().messages.create({ body, from: FROM_NUMBER(), to: partnerPhone });
  } catch (e) {
    console.error('Nudge SMS failed:', e);
  }
}

/**
 * Send partner invite via SMS.
 */
export async function sendPartnerInviteSMS(params: {
  partnerPhone: string;
  inviterName: string;
  inviteToken: string;
}) {
  const { partnerPhone, inviterName, inviteToken } = params;
  const url = `${APP_URL}/invite/${inviteToken}`;
  const body = `${inviterName} invited you to be their accountability partner on Be Candid. Accept here: ${url}`;

  try {
    return await getClient().messages.create({ body, from: FROM_NUMBER(), to: partnerPhone });
  } catch (e) {
    console.error('Partner invite SMS failed:', e);
  }
}
