// ============================================================
// Be Candid — Focus Segment Engine
//
// Splits each day into Morning (5 AM – 4:59 PM) and Evening
// (5 PM – 4:59 AM next day). Evaluates whether each segment
// was "focused" (zero flags) or "distracted" (1+ flags).
//
// Called by:
//   1. Alert pipeline — immediately marks the current segment distracted
//   2. Nightly cron — backfills any segments that had no events (= focused)
//      and awards trust points for the completed day
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────
export type Segment = 'morning' | 'evening';
export type SegmentStatus = 'focused' | 'distracted';

export interface FocusSegmentRow {
  id: string;
  user_id: string;
  date: string;        // YYYY-MM-DD
  segment: Segment;
  status: SegmentStatus;
  flag_count: number;
  categories: string[];
}

interface SegmentWindow {
  segment: Segment;
  start: Date;
  end: Date;
}

// ─── Constants ────────────────────────────────────────────────
const POINTS = {
  focused_morning: 5,
  focused_evening: 5,
  focused_full_day: 10,   // bonus when BOTH segments focused
  streak_bonus_7: 30,
  streak_bonus_30: 100,
  streak_bonus_90: 250,
} as const;

// Morning: 5:00 AM – 4:59 PM local
// Evening: 5:00 PM – 4:59 AM local (next day)
const MORNING_START_HOUR = 5;
const EVENING_START_HOUR = 17;

// ─── Segment Utilities ───────────────────────────────────────

/** Given a timestamp and timezone, determine which segment it falls in */
export function getSegmentForTimestamp(
  timestamp: Date | string,
  timezone: string = 'America/New_York'
): { date: string; segment: Segment } {
  const dt = new Date(timestamp);
  // Get local hour in user's timezone
  const localHour = parseInt(
    dt.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })
  );
  const localDateStr = dt.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD

  if (localHour >= MORNING_START_HOUR && localHour < EVENING_START_HOUR) {
    return { date: localDateStr, segment: 'morning' };
  }

  // Evening: 5 PM – 4:59 AM
  // If it's midnight–4:59 AM, the segment belongs to the PREVIOUS calendar day's evening
  if (localHour < MORNING_START_HOUR) {
    const yesterday = new Date(dt);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: timezone });
    return { date: yesterdayStr, segment: 'evening' };
  }

  return { date: localDateStr, segment: 'evening' };
}

// ─── Mark Segment Distracted (called by alert pipeline) ──────

/** When a flag fires, immediately mark that segment as distracted */
export async function markSegmentDistracted(
  db: SupabaseClient,
  userId: string,
  eventTimestamp: string,
  category: string,
  timezone: string = 'America/New_York'
): Promise<void> {
  const { date, segment } = getSegmentForTimestamp(eventTimestamp, timezone);

  // Check if segment row exists
  const { data: existing } = await db
    .from('focus_segments')
    .select('id, flag_count, categories')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('segment', segment)
    .maybeSingle();

  if (existing) {
    // Update: increment flag count, add category, set distracted
    const cats = existing.categories || [];
    if (!cats.includes(category)) cats.push(category);

    await db
      .from('focus_segments')
      .update({
        status: 'distracted',
        flag_count: existing.flag_count + 1,
        categories: cats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Insert new segment as distracted
    await db
      .from('focus_segments')
      .insert({
        user_id: userId,
        date,
        segment,
        status: 'distracted',
        flag_count: 1,
        categories: [category],
      });
  }
}

// ─── Backfill Focused Segments (called by nightly cron) ──────

/**
 * For a given user and date, ensure both morning and evening segments exist.
 * Any segment without a row is "focused" (no flags were triggered).
 * Awards trust points for focused segments and full-day bonuses.
 */
export async function backfillAndScoreDay(
  db: SupabaseClient,
  userId: string,
  date: string  // YYYY-MM-DD
): Promise<{ morning: SegmentStatus; evening: SegmentStatus; pointsAwarded: number }> {
  let pointsAwarded = 0;

  // Get existing segments for this day
  const { data: segments } = await db
    .from('focus_segments')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  const existing = new Map<Segment, FocusSegmentRow>();
  for (const s of (segments || [])) {
    existing.set(s.segment as Segment, s as FocusSegmentRow);
  }

  // Backfill missing segments as "focused"
  for (const seg of ['morning', 'evening'] as Segment[]) {
    if (!existing.has(seg)) {
      await db.from('focus_segments').insert({
        user_id: userId,
        date,
        segment: seg,
        status: 'focused',
        flag_count: 0,
        categories: [],
      });
      existing.set(seg, {
        id: '', user_id: userId, date, segment: seg,
        status: 'focused', flag_count: 0, categories: [],
      });
    }
  }

  const morningStatus = existing.get('morning')!.status;
  const eveningStatus = existing.get('evening')!.status;

  // Award points for focused segments (idempotent — check for existing awards)
  const { data: existingPoints } = await db
    .from('trust_points')
    .select('action')
    .eq('user_id', userId)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59.999Z`)
    .in('action', ['focused_morning', 'focused_evening', 'focused_full_day']);

  const alreadyAwarded = new Set((existingPoints || []).map(p => p.action));

  if (morningStatus === 'focused' && !alreadyAwarded.has('focused_morning')) {
    await awardPoints(db, userId, 'focused_morning', POINTS.focused_morning,
      `Focused morning on ${date}`);
    pointsAwarded += POINTS.focused_morning;
  }

  if (eveningStatus === 'focused' && !alreadyAwarded.has('focused_evening')) {
    await awardPoints(db, userId, 'focused_evening', POINTS.focused_evening,
      `Focused evening on ${date}`);
    pointsAwarded += POINTS.focused_evening;
  }

  // Full day bonus: both segments focused
  if (morningStatus === 'focused' && eveningStatus === 'focused'
      && !alreadyAwarded.has('focused_full_day')) {
    await awardPoints(db, userId, 'focused_full_day', POINTS.focused_full_day,
      `Full focused day on ${date}`);
    pointsAwarded += POINTS.focused_full_day;
  }

  return { morning: morningStatus, evening: eveningStatus, pointsAwarded };
}

// ─── Streak Calculator ───────────────────────────────────────

/**
 * Calculates the current streak of consecutive fully-focused days
 * (both morning AND evening = focused), counting backward from today.
 */
export async function calculateFocusStreak(
  db: SupabaseClient,
  userId: string,
  timezone: string = 'America/New_York'
): Promise<{ streakDays: number; streakSegments: number }> {
  // Get last 120 days of segments, ordered by date desc
  const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
  const { data: segments } = await db
    .from('focus_segments')
    .select('date, segment, status')
    .eq('user_id', userId)
    .lte('date', today)
    .order('date', { ascending: false })
    .limit(240); // 120 days * 2 segments

  if (!segments || segments.length === 0) return { streakDays: 0, streakSegments: 0 };

  // Group by date
  const byDate = new Map<string, { morning?: SegmentStatus; evening?: SegmentStatus }>();
  for (const s of segments) {
    if (!byDate.has(s.date)) byDate.set(s.date, {});
    byDate.get(s.date)![s.segment as Segment] = s.status as SegmentStatus;
  }

  // Walk backward from today
  let streakDays = 0;
  let streakSegments = 0;
  const cursor = new Date(today);

  while (true) {
    const dateStr = cursor.toLocaleDateString('en-CA', { timeZone: timezone });
    const day = byDate.get(dateStr);

    if (!day) break; // no data for this date

    const mFocused = day.morning === 'focused';
    const eFocused = day.evening === 'focused';

    if (mFocused && eFocused) {
      streakDays++;
      streakSegments += 2;
    } else if (mFocused || eFocused) {
      // Partial day — count the focused segments but break the full-day streak
      streakSegments += (mFocused ? 1 : 0) + (eFocused ? 1 : 0);
      break;
    } else {
      break;
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return { streakDays, streakSegments };
}

/**
 * Calculate the focus streak as of a specific date (e.g. when a partner joined).
 * Walks backward from `asOfDate` through focus_segments.
 */
export async function calculateFocusStreakAsOf(
  db: SupabaseClient,
  userId: string,
  asOfDate: string, // ISO timestamp or YYYY-MM-DD
  timezone: string = 'America/New_York'
): Promise<number> {
  const dateStr = new Date(asOfDate).toLocaleDateString('en-CA', { timeZone: timezone });

  const { data: segments } = await db
    .from('focus_segments')
    .select('date, segment, status')
    .eq('user_id', userId)
    .lte('date', dateStr)
    .order('date', { ascending: false })
    .limit(240);

  if (!segments || segments.length === 0) return 0;

  const byDate = new Map<string, { morning?: SegmentStatus; evening?: SegmentStatus }>();
  for (const s of segments) {
    if (!byDate.has(s.date)) byDate.set(s.date, {});
    byDate.get(s.date)![s.segment as Segment] = s.status as SegmentStatus;
  }

  let streakDays = 0;
  const cursor = new Date(dateStr);

  while (true) {
    const curDateStr = cursor.toLocaleDateString('en-CA', { timeZone: timezone });
    const day = byDate.get(curDateStr);
    if (!day) break;

    const mFocused = day.morning === 'focused';
    const eFocused = day.evening === 'focused';

    if (mFocused && eFocused) {
      streakDays++;
    } else {
      break;
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streakDays;
}

// ─── Check & Award Streak Milestones ─────────────────────────

export async function checkStreakMilestones(
  db: SupabaseClient,
  userId: string,
  streakDays: number
): Promise<string[]> {
  const milestoneMap: Record<number, string> = {
    7: 'streak_7',
    30: 'streak_30',
    90: 'streak_90',
  };

  const unlocked: string[] = [];

  for (const [days, milestone] of Object.entries(milestoneMap)) {
    if (streakDays >= parseInt(days)) {
      // Check if already unlocked
      const { data: existing } = await db
        .from('milestones')
        .select('id')
        .eq('user_id', userId)
        .eq('milestone', milestone)
        .maybeSingle();

      if (!existing) {
        await db.from('milestones').insert({
          user_id: userId,
          milestone,
        });

        // Award bonus points
        const bonusAction = `streak_bonus_${days}` as keyof typeof POINTS;
        if (POINTS[bonusAction]) {
          await awardPoints(db, userId, bonusAction, POINTS[bonusAction],
            `${days}-day focus streak milestone!`);
        }

        unlocked.push(milestone);
      }
    }
  }

  return unlocked;
}

// ─── 21-Day Heatmap Data ─────────────────────────────────────

export interface HeatmapDay {
  date: string;
  morning: SegmentStatus | 'pending';
  evening: SegmentStatus | 'pending';
}

/**
 * Returns the last 21 days of focus data for the heatmap view.
 * "pending" = segment hasn't been evaluated yet (today's current/future segment).
 */
export async function get21DayHeatmap(
  db: SupabaseClient,
  userId: string,
  timezone: string = 'America/New_York'
): Promise<HeatmapDay[]> {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: timezone });

  // Calculate 21 days ago
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 20); // 20 days back + today = 21 days
  const startStr = startDate.toLocaleDateString('en-CA', { timeZone: timezone });

  const { data: segments } = await db
    .from('focus_segments')
    .select('date, segment, status')
    .eq('user_id', userId)
    .gte('date', startStr)
    .lte('date', todayStr)
    .order('date', { ascending: true });

  // Build lookup
  const lookup = new Map<string, { morning?: SegmentStatus; evening?: SegmentStatus }>();
  for (const s of (segments || [])) {
    if (!lookup.has(s.date)) lookup.set(s.date, {});
    lookup.get(s.date)![s.segment as Segment] = s.status as SegmentStatus;
  }

  // Determine current segment to know what's "pending"
  const { segment: currentSegment } = getSegmentForTimestamp(today, timezone);

  // Build 21-day array
  const days: HeatmapDay[] = [];
  const cursor = new Date(startDate);

  for (let i = 0; i < 21; i++) {
    const dateStr = cursor.toLocaleDateString('en-CA', { timeZone: timezone });
    const dayData = lookup.get(dateStr);
    const isToday = dateStr === todayStr;

    let morning: SegmentStatus | 'pending' = dayData?.morning || 'focused';
    let evening: SegmentStatus | 'pending' = dayData?.evening || 'focused';

    // For today, mark the current or future segment as pending
    if (isToday) {
      if (currentSegment === 'morning') {
        // Morning is live, evening hasn't started
        morning = dayData?.morning || 'pending';
        evening = 'pending';
      } else {
        // Evening is live, morning is settled
        morning = dayData?.morning || 'focused';
        evening = dayData?.evening || 'pending';
      }
    }

    // For future dates (shouldn't happen, but guard)
    if (dateStr > todayStr) {
      morning = 'pending';
      evening = 'pending';
    }

    days.push({ date: dateStr, morning, evening });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

// ─── Trust Points Helpers ────────────────────────────────────

async function awardPoints(
  db: SupabaseClient,
  userId: string,
  action: string,
  points: number,
  note: string,
  referenceId?: string
): Promise<void> {
  await db.from('trust_points').insert({
    user_id: userId,
    points,
    action,
    note,
    reference_id: referenceId || null,
  });
}

export async function getTrustPointsBalance(
  db: SupabaseClient,
  userId: string
): Promise<number> {
  const { data } = await db
    .from('trust_points')
    .select('points')
    .eq('user_id', userId);

  return (data || []).reduce((sum, row) => sum + row.points, 0);
}

export async function getRecentPointActions(
  db: SupabaseClient,
  userId: string,
  limit: number = 20
): Promise<Array<{ action: string; points: number; note: string; created_at: string }>> {
  const { data } = await db
    .from('trust_points')
    .select('action, points, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getUnlockedMilestones(
  db: SupabaseClient,
  userId: string
): Promise<Array<{ milestone: string; unlocked_at: string }>> {
  const { data } = await db
    .from('milestones')
    .select('milestone, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  return data || [];
}
