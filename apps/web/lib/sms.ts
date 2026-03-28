// ============================================================
// Be Candid — SMS Service (Twilio)
// ============================================================

import twilio from 'twilio';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';
import type { User, Partner, Event, Alert } from '@be-candid/shared';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

export async function sendPartnerAlertSMS(params: {
  partner: Partner;
  user: User;
  event: Event;
  alert: Alert;
}) {
  const { partner, user, event, alert } = params;
  if (!partner.partner_phone) return;

  const categoryLabel = GOAL_LABELS[event.category as GoalCategory] ?? event.category;
  const url = `${APP_URL}/conversation/${alert.id}`;
  const body = `Be Candid: ${user.name} triggered a ${event.severity} ${categoryLabel} flag. Your conversation guide is ready: ${url}`;

  return client.messages.create({ body, from: FROM_NUMBER, to: partner.partner_phone });
}

export async function sendUserSelfNotificationSMS(params: {
  user: User;
  partner: Partner;
  event: Event;
  alert: Alert;
}) {
  const { user, partner, event, alert } = params;
  if (!user.phone) return;

  const url = `${APP_URL}/conversation/${alert.id}`;
  const body = `Hey ${user.name}, we noticed something. ${partner.partner_name} has been notified. Your conversation guide: ${url}`;

  return client.messages.create({ body, from: FROM_NUMBER, to: user.phone });
}

export async function sendPartnerInviteSMS(params: {
  partnerPhone: string;
  inviterName: string;
  inviteToken: string;
}) {
  const { partnerPhone, inviterName, inviteToken } = params;
  const url = `${APP_URL}/invite/${inviteToken}`;
  const body = `${inviterName} invited you to be their accountability partner on Be Candid. Accept here: ${url}`;

  return client.messages.create({ body, from: FROM_NUMBER, to: partnerPhone });
}
