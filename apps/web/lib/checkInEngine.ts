// ============================================================
// Be Candid — Check-in Engine
//
// Handles check-in scheduling, dual confirmation, and frequency.
// A check-in only counts as "completed" when BOTH the monitored
// user AND the partner have confirmed it.
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────

export type CheckInFrequency =
  | 'daily'
  | 'every_2_days'
  | 'every_3_days'
  | 'weekly'
  | 'every_2_weeks';

export type CheckInStatus = 'pending' | 'partial' | 'completed' | 'expired';

export type UserMood = 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
export type PartnerMood = 'confident' | 'hopeful' | 'concerned' | 'worried';

export interface CheckInRow {
  id: string;
  user_id: string;
  partner_user_id: string | null;
  prompt: string;
  status: CheckInStatus;
  sent_at: string;
  due_at: string | null;
  user_confirmed_at: string | null;
  user_mood: UserMood | null;
  user_response: string | null;
  partner_confirmed_at: string | null;
  partner_mood: PartnerMood | null;
  partner_response: string | null;
}

// ─── Constants ────────────────────────────────────────────────

export const FREQUENCY_LABELS: Record<CheckInFrequency, string> = {
  daily:         'Every day',
  every_2_days:  'Every 2 days',
  every_3_days:  'Every 3 days',
  weekly:        'Every week',
  every_2_weeks: 'Every 2 weeks',
};

export const FREQUENCY_DESCRIPTIONS: Record<CheckInFrequency, string> = {
  daily:         'A check-in every day — highest accountability',
  every_2_days:  'A check-in every other day',
  every_3_days:  'A check-in every 3 days',
  weekly:        'A weekly check-in — lighter touch',
  every_2_weeks: 'A check-in every 2 weeks — minimal',
};

const FREQUENCY_DAYS: Record<CheckInFrequency, number> = {
  daily:         1,
  every_2_days:  2,
  every_3_days:  3,
  weekly:        7,
  every_2_weeks: 14,
};

// Grace period: how long after a check-in is sent before it expires
// Users get 2x the frequency interval (min 24h, max 3 days)
function getGracePeriodHours(frequency: CheckInFrequency): number {
  const days = FREQUENCY_DAYS[frequency];
  const graceDays = Math.min(Math.max(days, 1), 3);
  return graceDays * 24;
}

// ─── Scheduling ───────────────────────────────────────────────

/**
 * Determines if a check-in should be sent to this user right now.
 * Called by the cron job each hour.
 */
export function shouldSendCheckIn(params: {
  checkInHour: number;
  timezone: string;
  frequency: CheckInFrequency;
  lastSentAt: Date | null;
}): boolean {
  const { checkInHour, timezone, frequency, lastSentAt } = params;

  // Is it the right hour in the user's timezone?
  const nowLocal = new Date().toLocaleString('en-US', { timeZone: timezone });
  const localHour = new Date(nowLocal).getHours();
  if (localHour !== checkInHour) return false;

  // Has enough time passed since the last check-in?
  if (lastSentAt) {
    const hoursSinceLast = (Date.now() - lastSentAt.getTime()) / (1000 * 60 * 60);
    const requiredHours = FREQUENCY_DAYS[frequency] * 24 - 2; // 2h buffer
    if (hoursSinceLast < requiredHours) return false;
  }

  return true;
}

/**
 * Calculate the due date for a check-in based on frequency.
 */
export function calculateDueDate(
  sentAt: Date,
  frequency: CheckInFrequency
): Date {
  const graceHours = getGracePeriodHours(frequency);
  return new Date(sentAt.getTime() + graceHours * 60 * 60 * 1000);
}

// ─── User Confirmation ───────────────────────────────────────

/**
 * Record the monitored user's check-in response.
 * Updates status to 'partial' if partner hasn't confirmed yet,
 * or 'completed' if partner already confirmed.
 */
export async function confirmUserCheckIn(
  db: SupabaseClient,
  checkInId: string,
  userId: string,
  mood: UserMood,
  response?: string
): Promise<{ status: CheckInStatus; milestonesUnlocked: string[] }> {
  // Verify ownership and status
  const { data: checkIn } = await db
    .from('check_ins')
    .select('*')
    .eq('id', checkInId)
    .eq('user_id', userId)
    .single();

  if (!checkIn) throw new Error('Check-in not found');
  if (checkIn.status === 'completed') throw new Error('Check-in already completed');
  if (checkIn.status === 'expired') throw new Error('Check-in has expired');
  if (checkIn.user_confirmed_at) throw new Error('Already confirmed');

  const partnerAlreadyConfirmed = !!checkIn.partner_confirmed_at;
  const newStatus: CheckInStatus = partnerAlreadyConfirmed ? 'completed' : 'partial';

  await db
    .from('check_ins')
    .update({
      user_confirmed_at: new Date().toISOString(),
      user_mood: mood,
      user_response: response || null,
      status: newStatus,
    })
    .eq('id', checkInId);

  // If now completed, award trust points
  let milestonesUnlocked: string[] = [];
  if (newStatus === 'completed') {
    milestonesUnlocked = await onCheckInCompleted(db, userId);
  }

  return { status: newStatus, milestonesUnlocked };
}

// ─── Partner Confirmation ─────────────────────────────────────

/**
 * Record the partner's check-in confirmation.
 * Updates status to 'partial' if user hasn't confirmed yet,
 * or 'completed' if user already confirmed.
 */
export async function confirmPartnerCheckIn(
  db: SupabaseClient,
  checkInId: string,
  partnerUserId: string,
  mood: PartnerMood,
  response?: string
): Promise<{ status: CheckInStatus; milestonesUnlocked: string[] }> {
  // Verify partner access
  const { data: checkIn } = await db
    .from('check_ins')
    .select('*')
    .eq('id', checkInId)
    .eq('partner_user_id', partnerUserId)
    .single();

  if (!checkIn) throw new Error('Check-in not found or unauthorized');
  if (checkIn.status === 'completed') throw new Error('Check-in already completed');
  if (checkIn.status === 'expired') throw new Error('Check-in has expired');
  if (checkIn.partner_confirmed_at) throw new Error('Already confirmed');

  const userAlreadyConfirmed = !!checkIn.user_confirmed_at;
  const newStatus: CheckInStatus = userAlreadyConfirmed ? 'completed' : 'partial';

  await db
    .from('check_ins')
    .update({
      partner_confirmed_at: new Date().toISOString(),
      partner_mood: mood,
      partner_response: response || null,
      status: newStatus,
    })
    .eq('id', checkInId);

  let milestonesUnlocked: string[] = [];
  if (newStatus === 'completed') {
    milestonesUnlocked = await onCheckInCompleted(db, checkIn.user_id);
  }

  return { status: newStatus, milestonesUnlocked };
}

// ─── Expiration ───────────────────────────────────────────────

/**
 * Mark overdue check-ins as expired. Called by cron.
 */
export async function expireOverdueCheckIns(
  db: SupabaseClient
): Promise<number> {
  const now = new Date().toISOString();

  const { data } = await db
    .from('check_ins')
    .update({ status: 'expired' })
    .in('status', ['pending', 'partial'])
    .lt('due_at', now)
    .select('id');

  return data?.length ?? 0;
}

// ─── Trust Points Integration ─────────────────────────────────

async function onCheckInCompleted(
  db: SupabaseClient,
  userId: string
): Promise<string[]> {
  // Award trust points for completed check-in
  await db.from('trust_points').insert({
    user_id: userId,
    points: 5,
    action: 'check_in_completed',
    note: 'Completed a dual-confirmed check-in',
  });

  // Also award partner
  const { data: partner } = await db
    .from('partners')
    .select('partner_user_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (partner?.partner_user_id) {
    await db.from('trust_points').insert({
      user_id: partner.partner_user_id,
      points: 5,
      action: 'check_in_completed',
      note: 'Completed a dual-confirmed check-in as partner',
    });
  }

  return []; // Milestone checking handled elsewhere
}

// ─── Stats ────────────────────────────────────────────────────

export interface CheckInStats {
  total: number;
  completed: number;
  partial: number;
  expired: number;
  completionRate: number;
  currentStreak: number;
}

export async function getCheckInStats(
  db: SupabaseClient,
  userId: string
): Promise<CheckInStats> {
  const { data: checkIns } = await db
    .from('check_ins')
    .select('status, sent_at')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(100);

  const all = checkIns ?? [];
  const total = all.length;
  const completed = all.filter(c => c.status === 'completed').length;
  const partial = all.filter(c => c.status === 'partial').length;
  const expired = all.filter(c => c.status === 'expired').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Streak: consecutive completed check-ins from most recent
  let currentStreak = 0;
  for (const ci of all) {
    if (ci.status === 'completed') currentStreak++;
    else break;
  }

  return { total, completed, partial, expired, completionRate, currentStreak };
}
