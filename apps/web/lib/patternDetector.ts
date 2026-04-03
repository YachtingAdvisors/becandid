// ============================================================
// Be Candid — Pattern Detector
//
// Analyzes a user's event history to detect:
// 1. Time patterns (events clustering at specific hours/days)
// 2. Frequency spikes (more events than their baseline)
// 3. Streak-at-risk (long streak + entering vulnerability window)
// 4. Missed check-ins
//
// Produces nudge messages when patterns are detected.
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

interface DetectedPattern {
  trigger_type: 'time_pattern' | 'frequency_spike' | 'vulnerability_window' | 'streak_at_risk' | 'check_in_missed';
  category: string | null;
  severity: 'info' | 'warning' | 'urgent';
  message: string;
}

export async function detectPatterns(
  db: SupabaseClient,
  userId: string,
  timezone: string = 'America/New_York'
): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Fetch last 90 days of events
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: events } = await db
    .from('events')
    .select('category, severity, timestamp, platform')
    .eq('user_id', userId)
    .gte('timestamp', ninetyDaysAgo.toISOString())
    .order('timestamp', { ascending: false });

  if (!events || events.length < 3) return patterns;

  // ── 1. Time Pattern Detection ──────────────────────────────
  // Group events by hour-of-day to find clustering
  const hourCounts = new Array(24).fill(0);
  const dayOfWeekCounts = new Array(7).fill(0);

  for (const e of events) {
    const dt = new Date(e.timestamp);
    const localHour = parseInt(
      dt.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })
    );
    hourCounts[localHour]++;

    const dayOfWeek = new Date(e.timestamp).getDay(); // 0=Sun, 1=Mon, ...
    dayOfWeekCounts[dayOfWeek]++;
  }

  // Find peak hours (more than 2x average)
  const avgPerHour = events.length / 24;
  const peakHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > avgPerHour * 2 && h.count >= 3)
    .sort((a, b) => b.count - a.count);

  if (peakHours.length > 0) {
    const peak = peakHours[0];
    const timeLabel = peak.hour === 0 ? '12 AM'
      : peak.hour < 12 ? `${peak.hour} AM`
      : peak.hour === 12 ? '12 PM'
      : `${peak.hour - 12} PM`;

    patterns.push({
      trigger_type: 'time_pattern',
      category: null,
      severity: 'info',
      message: `We've noticed ${peak.count} of your flags cluster around ${timeLabel}. Consider setting a vulnerability window for this time to get proactive support.`,
    });
  }

  // ── 2. Frequency Spike Detection ───────────────────────────
  // Compare last 7 days vs previous 30-day baseline
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEvents = events.filter(e => new Date(e.timestamp) > sevenDaysAgo);
  const baselineEvents = events.filter(
    e => new Date(e.timestamp) > thirtyDaysAgo && new Date(e.timestamp) <= sevenDaysAgo
  );

  const recentRate = recentEvents.length / 7;
  const baselineRate = baselineEvents.length / 23; // 30 - 7 days

  if (baselineRate > 0 && recentRate > baselineRate * 1.8 && recentEvents.length >= 3) {
    // Find which category spiked most
    const catCounts: Record<string, number> = {};
    for (const e of recentEvents) {
      catCounts[e.category] = (catCounts[e.category] || 0) + 1;
    }
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    const catLabel = GOAL_LABELS[topCat[0] as GoalCategory] ?? topCat[0];

    patterns.push({
      trigger_type: 'frequency_spike',
      category: topCat[0],
      severity: 'warning',
      message: `Your ${catLabel} flags are up ${Math.round((recentRate / baselineRate - 1) * 100)}% compared to your usual baseline. Something may be different this week — it might help to talk about it.`,
    });
  }

  // ── 3. Streak At Risk ─────────────────────────────────────
  // If user has a 7+ day streak, warn them during high-risk times
  const { data: segments } = await db
    .from('focus_segments')
    .select('date, segment, status')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(60);

  if (segments) {
    const byDate = new Map<string, { morning?: string; evening?: string }>();
    for (const s of segments) {
      if (!byDate.has(s.date)) byDate.set(s.date, {});
      byDate.get(s.date)![s.segment as 'morning' | 'evening'] = s.status;
    }

    let streakDays = 0;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
    const cursor = new Date(today);
    while (true) {
      const dateStr = cursor.toLocaleDateString('en-CA');
      const day = byDate.get(dateStr);
      if (!day || day.morning !== 'focused' || day.evening !== 'focused') break;
      streakDays++;
      cursor.setDate(cursor.getDate() - 1);
    }

    if (streakDays >= 7 && peakHours.length > 0) {
      patterns.push({
        trigger_type: 'streak_at_risk',
        category: null,
        severity: 'warning',
        message: `You're on a ${streakDays}-day focus streak — incredible! Your data shows higher risk around ${peakHours[0].hour > 12 ? (peakHours[0].hour - 12) + ' PM' : peakHours[0].hour + ' AM'}. Stay sharp tonight.`,
      });
    }
  }

  // ── 4. Missed Check-ins ────────────────────────────────────
  const { data: recentCheckIns } = await db
    .from('check_ins')
    .select('status')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(5);

  if (recentCheckIns) {
    const consecutiveMissed = recentCheckIns
      .filter(ci => ci.status === 'expired').length;

    if (consecutiveMissed >= 2) {
      patterns.push({
        trigger_type: 'check_in_missed',
        category: null,
        severity: consecutiveMissed >= 3 ? 'urgent' : 'warning',
        message: `You've missed ${consecutiveMissed} check-ins in a row. Your partner is counting on hearing from you. A quick check-in takes 30 seconds.`,
      });
    }
  }

  return patterns;
}

/**
 * Run pattern detection and insert any new nudges.
 * Called by the patterns cron job.
 */
export async function runPatternDetection(
  db: SupabaseClient,
  userId: string,
  timezone: string
): Promise<DetectedPattern[]> {
  const patterns = await detectPatterns(db, userId, timezone);

  if (patterns.length === 0) return [];

  // Check for recently sent nudges (don't repeat within 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentNudges } = await db
    .from('nudges')
    .select('trigger_type, category')
    .eq('user_id', userId)
    .gte('sent_at', oneDayAgo);

  const recentSet = new Set(
    (recentNudges ?? []).map(n => `${n.trigger_type}:${n.category ?? ''}`)
  );

  // Filter out duplicates
  const newPatterns = patterns.filter(
    p => !recentSet.has(`${p.trigger_type}:${p.category ?? ''}`)
  );

  if (newPatterns.length === 0) return [];

  // Insert nudges
  await db.from('nudges').insert(
    newPatterns.map(p => ({
      user_id: userId,
      category: p.category,
      trigger_type: p.trigger_type,
      message: p.message,
      severity: p.severity,
    }))
  );

  return newPatterns;
}
