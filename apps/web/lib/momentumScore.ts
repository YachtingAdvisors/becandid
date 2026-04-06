// ============================================================
// Be Candid — Momentum Score Calculator
//
// Computes a 0-100 composite score reflecting the user's
// overall engagement and recovery trajectory.
//
// Weights:
//   Streak contribution  (30%)
//   Journal frequency    (25%)
//   Check-in completion  (25%)
//   Mood trend           (20%)
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

export interface MomentumBreakdown {
  streak: number;
  journal: number;
  checkin: number;
  mood: number;
}

export interface MomentumResult {
  score: number; // 0-100
  breakdown: MomentumBreakdown;
  trend: 'rising' | 'falling' | 'stable';
  sparkline: number[]; // last 14 days of scores
}

// ─── Internal helpers ───────────────────────────────────────

function dateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStreakScore(streakDays: number): number {
  return Math.min(streakDays / 30, 1) * 30;
}

function computeJournalScore(journalsThisWeek: number): number {
  return Math.min(journalsThisWeek / 5, 1) * 25;
}

function computeCheckinScore(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 25;
}

function computeMoodScore(direction: 'up' | 'down' | 'stable'): number {
  if (direction === 'up') return 20;
  if (direction === 'stable') return 15;
  return 10;
}

function determineMoodDirection(
  moodValues: number[],
): 'up' | 'down' | 'stable' {
  if (moodValues.length < 2) return 'stable';
  const first = moodValues[0];
  const last = moodValues[moodValues.length - 1];
  const diff = last - first;
  if (diff > 0.3) return 'up';
  if (diff < -0.3) return 'down';
  return 'stable';
}

// ─── Streak calculation from focus_segments ─────────────────

function computeStreakFromSegments(
  segments: Array<{ date: string; status: string }>,
): number {
  let streak = 0;
  for (const seg of segments) {
    if (seg.status === 'focused') streak++;
    else break;
  }
  return streak;
}

// ─── Main calculator ────────────────────────────────────────

export async function calculateMomentumScore(
  db: SupabaseClient,
  userId: string,
): Promise<MomentumResult> {
  const fourteenDaysAgo = daysAgo(14).toISOString();
  const sevenDaysAgo = daysAgo(7).toISOString();

  // Parallel fetch all required data
  const [
    focusRes,
    journalRes,
    checkinCompletedRes,
    checkinTotalRes,
    moodRes,
    journalDailyRes,
    checkinDailyRes,
  ] = await Promise.all([
    // Streak from focus_segments (90 days for streak calc)
    db
      .from('focus_segments')
      .select('date, status')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90),
    // Journals this week
    db
      .from('stringer_journal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo),
    // Completed check-ins (14 days for sparkline)
    db
      .from('check_ins')
      .select('sent_at, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('sent_at', fourteenDaysAgo),
    // Total check-ins (14 days)
    db
      .from('check_ins')
      .select('sent_at, status')
      .eq('user_id', userId)
      .gte('sent_at', fourteenDaysAgo),
    // Mood values from check-ins (14 days)
    db
      .from('check_ins')
      .select('user_mood, sent_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('sent_at', fourteenDaysAgo)
      .order('sent_at', { ascending: true }),
    // Journals per day (14 days, for sparkline)
    db
      .from('stringer_journal')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo),
    // Check-ins per day (14 days, for sparkline)
    db
      .from('check_ins')
      .select('sent_at, status')
      .eq('user_id', userId)
      .gte('sent_at', fourteenDaysAgo),
  ]);

  const focusSegments = (focusRes?.data ?? []) as Array<{
    date: string;
    status: string;
  }>;
  const journalsThisWeek = journalRes?.count ?? 0;
  const completedCheckins = (checkinCompletedRes?.data ?? []).length;
  const totalCheckins = (checkinTotalRes?.data ?? []).length;
  const moodValues = ((moodRes?.data ?? []) as Array<{ user_mood: number | null; sent_at: string }>)
    .filter((c) => c.user_mood != null)
    .map((c) => c.user_mood as number);

  // Current scores
  const streakDays = computeStreakFromSegments(focusSegments);
  const moodDirection = determineMoodDirection(moodValues);

  const breakdown: MomentumBreakdown = {
    streak: Math.round(computeStreakScore(streakDays)),
    journal: Math.round(computeJournalScore(journalsThisWeek)),
    checkin: Math.round(computeCheckinScore(completedCheckins, totalCheckins)),
    mood: computeMoodScore(moodDirection),
  };

  const score = Math.round(
    breakdown.streak + breakdown.journal + breakdown.checkin + breakdown.mood,
  );

  // ── Sparkline: daily scores for last 14 days ──────────────

  const journalDates = ((journalDailyRes?.data ?? []) as Array<{ created_at: string }>).map(
    (j) => j.created_at.split('T')[0],
  );
  const checkinDailyData = (checkinDailyRes?.data ?? []) as Array<{
    sent_at: string;
    status: string;
  }>;
  const focusDateSet = new Set(
    focusSegments.filter((s) => s.status === 'focused').map((s) => s.date),
  );

  const sparkline: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = daysAgo(i);
    const dayStr = dateStr(day);

    // Streak: count consecutive focused days ending on this day
    let dayStreak = 0;
    if (focusDateSet.has(dayStr)) {
      dayStreak = 1;
      for (let j = 1; j <= 30; j++) {
        const prev = dateStr(daysAgo(i + j));
        if (focusDateSet.has(prev)) dayStreak++;
        else break;
      }
    }

    // Journals in the 7 days ending on this day
    const weekStart = dateStr(daysAgo(i + 6));
    const dayJournals = journalDates.filter(
      (d) => d >= weekStart && d <= dayStr,
    ).length;

    // Check-ins on this day
    const dayCheckinTotal = checkinDailyData.filter(
      (c) => c.sent_at.split('T')[0] === dayStr,
    ).length;
    const dayCheckinCompleted = checkinDailyData.filter(
      (c) => c.sent_at.split('T')[0] === dayStr && c.status === 'completed',
    ).length;

    // Mood: use overall direction for simplicity in sparkline
    const dayScore =
      computeStreakScore(dayStreak) +
      computeJournalScore(dayJournals) +
      computeCheckinScore(dayCheckinCompleted, dayCheckinTotal) +
      computeMoodScore(moodDirection);

    sparkline.push(Math.round(dayScore));
  }

  // ── Trend: compare last 7 avg vs previous 7 avg ──────────

  const last7 = sparkline.slice(7);
  const prev7 = sparkline.slice(0, 7);
  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  const last7Avg = avg(last7);
  const prev7Avg = avg(prev7);
  const trendDiff = last7Avg - prev7Avg;

  let trend: 'rising' | 'falling' | 'stable';
  if (trendDiff > 3) trend = 'rising';
  else if (trendDiff < -3) trend = 'falling';
  else trend = 'stable';

  return { score, breakdown, trend, sparkline };
}
