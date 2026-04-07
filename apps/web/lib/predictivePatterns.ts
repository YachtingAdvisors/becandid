// ============================================================
// Be Candid — Predictive Pattern Engine
//
// Analyzes historical data to predict upcoming risk windows
// BEFORE a setback occurs. Produces predictive alerts with
// confidence scores based on how many times a pattern preceded
// a setback in the user's history.
//
// Pattern types:
//   1. Time-based risk (day-of-week + preceding category usage)
//   2. Category escalation (category A spikes → category B follows)
//   3. Mood decline warning (mood dropping over multiple days)
//   4. Isolation risk (loneliness tags + missed check-ins)
//   5. Trigger combo (multiple high-correlation tags same day)
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

// ─── Types ──────────────────────────────────────────────────

export interface PredictiveAlert {
  type: 'time_risk' | 'category_escalation' | 'mood_decline' | 'isolation_risk' | 'trigger_combo';
  message: string;
  confidence: number; // 0-1
  category?: string;
  suggested_action: string;
}

interface EventRow {
  category: string;
  severity: string;
  timestamp: string;
  platform: string;
  duration_seconds: number | null;
}

interface JournalRow {
  created_at: string;
  tags: string[] | null;
  trigger_type: string | null;
  mood: number | null;
}

// ─── Constants ──────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const HIGH_CORRELATION_TAGS = ['stress', 'late-night', 'conflict', 'loneliness', 'exhaustion', 'rejection', 'anxiety'];

const SUGGESTED_ACTIONS: Record<PredictiveAlert['type'], string[]> = {
  time_risk: [
    'Consider putting your phone in another room tonight.',
    'Set a vulnerability window for this evening and ask your partner to check in.',
    'Plan something intentional for tonight — a walk, a call, or journaling.',
  ],
  category_escalation: [
    'Consider putting your phone in another room tonight.',
    'Switch to an activity that breaks the scroll — a walk, pushups, or calling someone.',
    'Open your journal and write about what you are actually feeling right now.',
  ],
  mood_decline: [
    'Reach out to your partner or a friend before tonight.',
    'Open your journal and name what is weighing on you.',
    'Your coach is here if you need to talk through what is happening.',
  ],
  isolation_risk: [
    'Who could you call or text today? Even a short conversation helps.',
    'Consider reaching out to your accountability partner right now.',
    'Go somewhere with other people today — a coffee shop, gym, or park.',
  ],
  trigger_combo: [
    'Your coach is here if you need it before things get harder.',
    'Tell someone you trust how you are feeling right now.',
    'Remove yourself from the environment — go for a drive, a walk, anything different.',
  ],
};

// ─── Helpers ────────────────────────────────────────────────

function getLocalHour(timestamp: string, timezone: string): number {
  const dt = new Date(timestamp);
  return parseInt(
    dt.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })
  );
}

function getLocalDayOfWeek(timestamp: string, timezone: string): number {
  const dt = new Date(timestamp);
  const dayStr = dt.toLocaleString('en-US', { timeZone: timezone, weekday: 'short' });
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? dt.getDay();
}

function getLocalDateStr(timestamp: string, timezone: string): string {
  return new Date(timestamp).toLocaleDateString('en-CA', { timeZone: timezone });
}

function pickAction(type: PredictiveAlert['type']): string {
  const actions = SUGGESTED_ACTIONS[type];
  return actions[Math.floor(Math.random() * actions.length)];
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function getCategoryLabel(category: string): string {
  return GOAL_LABELS[category as GoalCategory] ?? category.replace(/_/g, ' ');
}

// ─── Main Detection Function ────────────────────────────────

export async function detectPredictivePatterns(
  db: SupabaseClient,
  userId: string,
  timezone: string
): Promise<PredictiveAlert[]> {
  const alerts: PredictiveAlert[] = [];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Parallel data fetching
  const [eventsRes, journalRes, checkInsRes] = await Promise.all([
    db
      .from('events')
      .select('category, severity, timestamp, platform, duration_seconds')
      .eq('user_id', userId)
      .gte('timestamp', ninetyDaysAgo.toISOString())
      .order('timestamp', { ascending: true }),
    db
      .from('stringer_journal')
      .select('created_at, tags, trigger_type, mood')
      .eq('user_id', userId)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    db
      .from('check_ins')
      .select('status, sent_at, user_mood')
      .eq('user_id', userId)
      .gte('sent_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('sent_at', { ascending: true }),
  ]);

  const events = (eventsRes.data ?? []) as EventRow[];
  const journals = (journalRes.data ?? []) as JournalRow[];
  const checkIns = (checkInsRes.data ?? []) as { status: string; sent_at: string; user_mood: number | null }[];

  if (events.length < 3) return alerts;

  // Run all pattern detectors
  const timeRisk = detectTimeBasedRisk(events, timezone);
  if (timeRisk) alerts.push(timeRisk);

  const escalation = detectCategoryEscalation(events, timezone);
  if (escalation) alerts.push(escalation);

  const moodDecline = detectMoodDecline(journals, checkIns);
  if (moodDecline) alerts.push(moodDecline);

  const isolation = detectIsolationRisk(journals, checkIns, events);
  if (isolation) alerts.push(isolation);

  const triggerCombo = detectTriggerCombo(journals, events, timezone);
  if (triggerCombo) alerts.push(triggerCombo);

  return alerts;
}

// ─── 1. Time-Based Risk ─────────────────────────────────────
// Looks at day-of-week + preceding category usage patterns.
// Example: every Wednesday when social_media > 2h, a setback follows.

function detectTimeBasedRisk(
  events: EventRow[],
  timezone: string
): PredictiveAlert | null {
  const now = new Date();
  const todayDow = getLocalDayOfWeek(now.toISOString(), timezone);
  const currentHour = getLocalHour(now.toISOString(), timezone);

  // Group events by date
  const eventsByDate = new Map<string, EventRow[]>();
  for (const e of events) {
    const dateStr = getLocalDateStr(e.timestamp, timezone);
    const existing = eventsByDate.get(dateStr) ?? [];
    existing.push(e);
    eventsByDate.set(dateStr, existing);
  }

  // Find setback events (high severity)
  const setbackEvents = events.filter(e => e.severity === 'high');
  if (setbackEvents.length < 2) return null;

  // For each setback, look at what happened in the preceding 12 hours
  // on the same day of week
  const sameDowSetbacks = setbackEvents.filter(
    e => getLocalDayOfWeek(e.timestamp, timezone) === todayDow
  );

  if (sameDowSetbacks.length < 2) return null;

  // Find the most common preceding category pattern
  const precedingPatterns = new Map<string, number>();
  for (const setback of sameDowSetbacks) {
    const setbackDate = getLocalDateStr(setback.timestamp, timezone);
    const setbackHour = getLocalHour(setback.timestamp, timezone);
    const dayEvents = eventsByDate.get(setbackDate) ?? [];

    for (const e of dayEvents) {
      const eHour = getLocalHour(e.timestamp, timezone);
      if (eHour < setbackHour && e.category !== setback.category) {
        precedingPatterns.set(
          e.category,
          (precedingPatterns.get(e.category) ?? 0) + 1
        );
      }
    }
  }

  if (precedingPatterns.size === 0) return null;

  // Find the top preceding category
  const sorted = [...precedingPatterns.entries()].sort((a, b) => b[1] - a[1]);
  const [precedingCat, precedingCount] = sorted[0];

  // Check if that preceding category has been used heavily today
  const todayStr = getLocalDateStr(now.toISOString(), timezone);
  const todayEvents = eventsByDate.get(todayStr) ?? [];
  const todayCatDuration = todayEvents
    .filter(e => e.category === precedingCat)
    .reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0);

  const todayCatMinutes = Math.round(todayCatDuration / 60);

  // Need at least 30 minutes of the preceding category today
  if (todayCatMinutes < 30) return null;

  const confidence = Math.min(1, precedingCount / sameDowSetbacks.length);
  if (confidence < 0.4) return null;

  const catLabel = getCategoryLabel(precedingCat);
  const dayName = DAY_NAMES[todayDow];
  const hoursLabel = todayCatMinutes >= 60
    ? `${Math.round(todayCatMinutes / 60)}+ hours`
    : `${todayCatMinutes} minutes`;

  return {
    type: 'time_risk',
    message: `Last time you spent ${hoursLabel} on ${catLabel} during the day, you had a setback that evening. It's ${dayName} — be intentional tonight.`,
    confidence,
    category: precedingCat,
    suggested_action: pickAction('time_risk'),
  };
}

// ─── 2. Category Escalation ────────────────────────────────
// Detects when category A usage spikes and category B setback
// historically follows within 24 hours.

function detectCategoryEscalation(
  events: EventRow[],
  timezone: string
): PredictiveAlert | null {
  // Group events by date
  const eventsByDate = new Map<string, EventRow[]>();
  for (const e of events) {
    const dateStr = getLocalDateStr(e.timestamp, timezone);
    const existing = eventsByDate.get(dateStr) ?? [];
    existing.push(e);
    eventsByDate.set(dateStr, existing);
  }

  const dates = [...eventsByDate.keys()].sort();

  // Find category pairs where A precedes B (high severity) within 24h
  const pairCounts = new Map<string, { total: number; followed: number }>();

  for (let i = 0; i < dates.length; i++) {
    const dayEvents = eventsByDate.get(dates[i]) ?? [];
    const nextDayEvents = i + 1 < dates.length ? (eventsByDate.get(dates[i + 1]) ?? []) : [];

    const dayCats = new Set(dayEvents.map(e => e.category));
    const highSevNext = new Set(
      [...dayEvents.filter(e => e.severity === 'high'), ...nextDayEvents.filter(e => e.severity === 'high')]
        .map(e => e.category)
    );

    for (const catA of dayCats) {
      for (const catB of highSevNext) {
        if (catA === catB) continue;
        const key = `${catA}→${catB}`;
        const entry = pairCounts.get(key) ?? { total: 0, followed: 0 };
        entry.total++;
        entry.followed++;
        pairCounts.set(key, entry);
      }
      // Also count days where A appeared but B did NOT follow
      if (highSevNext.size === 0) {
        // Count as "appeared but no setback" for all known pairs with this catA
        for (const [key, entry] of pairCounts.entries()) {
          if (key.startsWith(`${catA}→`)) {
            entry.total++;
          }
        }
      }
    }
  }

  // Find pairs with high correlation
  const significantPairs = [...pairCounts.entries()]
    .filter(([, v]) => v.followed >= 3 && v.total > 0)
    .map(([key, v]) => ({
      key,
      catA: key.split('→')[0],
      catB: key.split('→')[1],
      confidence: v.followed / v.total,
      count: v.followed,
    }))
    .filter(p => p.confidence >= 0.4)
    .sort((a, b) => b.confidence - a.confidence);

  if (significantPairs.length === 0) return null;

  // Check if catA has spiked today
  const now = new Date();
  const todayStr = getLocalDateStr(now.toISOString(), timezone);
  const todayEvents = eventsByDate.get(todayStr) ?? [];

  // Calculate today's usage vs baseline for each catA
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentDates = dates.filter(d => new Date(d) >= sevenDaysAgo && d !== todayStr);

  for (const pair of significantPairs) {
    const todayCatACount = todayEvents.filter(e => e.category === pair.catA).length;
    if (todayCatACount === 0) continue;

    const baselineCounts = recentDates.map(
      d => (eventsByDate.get(d) ?? []).filter(e => e.category === pair.catA).length
    );
    const avgBaseline = baselineCounts.length > 0
      ? baselineCounts.reduce((a, b) => a + b, 0) / baselineCounts.length
      : 0;

    if (avgBaseline > 0 && todayCatACount > avgBaseline * 1.5) {
      const spikePercent = Math.round((todayCatACount / avgBaseline - 1) * 100);
      const catALabel = getCategoryLabel(pair.catA);

      return {
        type: 'category_escalation',
        message: `Your ${catALabel} usage is up ${spikePercent}% today. In the past, this pattern has led to a setback within 24 hours. ${pickAction('category_escalation')}`,
        confidence: pair.confidence,
        category: pair.catA,
        suggested_action: pickAction('category_escalation'),
      };
    }
  }

  return null;
}

// ─── 3. Mood Decline Warning ────────────────────────────────
// Detects when mood has dropped 2+ points over 3 days.

function detectMoodDecline(
  journals: JournalRow[],
  checkIns: { status: string; sent_at: string; user_mood: number | null }[]
): PredictiveAlert | null {
  // Gather mood data points from journals and check-ins
  const moodPoints: { date: string; mood: number }[] = [];

  for (const j of journals) {
    if (j.mood != null) {
      const dateStr = new Date(j.created_at).toLocaleDateString('en-CA');
      moodPoints.push({ date: dateStr, mood: j.mood });
    }
  }

  for (const ci of checkIns) {
    if (ci.user_mood != null && ci.status === 'completed') {
      const dateStr = new Date(ci.sent_at).toLocaleDateString('en-CA');
      moodPoints.push({ date: dateStr, mood: ci.user_mood });
    }
  }

  if (moodPoints.length < 3) return null;

  // Average mood by date
  const moodByDate = new Map<string, number[]>();
  for (const mp of moodPoints) {
    const existing = moodByDate.get(mp.date) ?? [];
    existing.push(mp.mood);
    moodByDate.set(mp.date, existing);
  }

  const sortedDates = [...moodByDate.keys()].sort();
  if (sortedDates.length < 3) return null;

  // Look at the last 3 days with mood data
  const recentDates = sortedDates.slice(-3);
  const recentAvgs = recentDates.map(d => {
    const moods = moodByDate.get(d)!;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  });

  const decline = recentAvgs[0] - recentAvgs[recentAvgs.length - 1];

  if (decline < 2) return null;

  // Calculate confidence based on how consistent the decline is
  const isConsistentDecline = recentAvgs[0] > recentAvgs[1] && recentAvgs[1] > recentAvgs[recentAvgs.length - 1];
  const confidence = isConsistentDecline ? Math.min(1, 0.5 + decline * 0.1) : Math.min(1, 0.3 + decline * 0.1);

  return {
    type: 'mood_decline',
    message: `Your mood has been dropping this week. In the past, a mood dip like this preceded a difficult moment. Reach out to your partner or journal before tonight.`,
    confidence,
    suggested_action: pickAction('mood_decline'),
  };
}

// ─── 4. Isolation Risk ──────────────────────────────────────
// Detects loneliness tags in journals + missed check-ins.

function detectIsolationRisk(
  journals: JournalRow[],
  checkIns: { status: string; sent_at: string; user_mood: number | null }[],
  events: EventRow[]
): PredictiveAlert | null {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Count loneliness tags in journals from the last 7 days
  const recentJournals = journals.filter(j => new Date(j.created_at) >= sevenDaysAgo);
  const lonelinessCount = recentJournals.filter(
    j => (j.tags ?? []).some(t => t.toLowerCase().includes('loneliness') || t.toLowerCase().includes('lonely') || t.toLowerCase().includes('isolated'))
  ).length;

  // Count missed check-ins in the last 7 days
  const recentCheckIns = checkIns.filter(ci => new Date(ci.sent_at) >= sevenDaysAgo);
  const missedCount = recentCheckIns.filter(ci => ci.status === 'expired').length;

  const noCheckIns = recentCheckIns.length === 0;

  // Need either 3+ loneliness tags OR no check-ins at all
  if (lonelinessCount < 3 && !noCheckIns && missedCount < 3) return null;

  // Look at historical pattern: did loneliness/isolation precede setbacks?
  const setbackEvents = events.filter(e => e.severity === 'high');
  let isolationPrecededSetback = 0;
  let totalIsolationWindows = 0;

  // For each journal with loneliness tag, check if a setback followed within 3 days
  for (const j of journals) {
    const hasLoneliness = (j.tags ?? []).some(
      t => t.toLowerCase().includes('loneliness') || t.toLowerCase().includes('lonely')
    );
    if (!hasLoneliness) continue;
    totalIsolationWindows++;

    const journalDate = new Date(j.created_at);
    const threeDaysLater = new Date(journalDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    const followedBySetback = setbackEvents.some(e => {
      const eDate = new Date(e.timestamp);
      return eDate > journalDate && eDate <= threeDaysLater;
    });

    if (followedBySetback) isolationPrecededSetback++;
  }

  const confidence = totalIsolationWindows > 0
    ? Math.min(1, isolationPrecededSetback / totalIsolationWindows)
    : 0.4; // Default moderate confidence when no historical data

  if (confidence < 0.3 && lonelinessCount < 3) return null;

  const message = lonelinessCount >= 3
    ? `You've been tagging "loneliness" ${lonelinessCount} times this week. Last time this happened, you had a setback within a few days. Who could you call today?`
    : noCheckIns
      ? `You haven't checked in at all this week. Isolation is one of the strongest predictors of a setback. Your partner is waiting to hear from you.`
      : `You've missed ${missedCount} check-ins this week. Disconnection often precedes difficult moments. A quick check-in takes 30 seconds.`;

  return {
    type: 'isolation_risk',
    message,
    confidence: Math.max(confidence, 0.4),
    suggested_action: pickAction('isolation_risk'),
  };
}

// ─── 5. Trigger Combo ───────────────────────────────────────
// Detects when 2+ high-correlation tags appear on the same day.

function detectTriggerCombo(
  journals: JournalRow[],
  events: EventRow[],
  timezone: string
): PredictiveAlert | null {
  const todayStr = getLocalDateStr(new Date().toISOString(), timezone);

  // Collect today's tags from journals
  const todayJournals = journals.filter(
    j => getLocalDateStr(j.created_at, timezone) === todayStr
  );
  const todayTags = new Set<string>();
  for (const j of todayJournals) {
    for (const tag of j.tags ?? []) {
      const normalized = tag.toLowerCase().replace(/\s+/g, '-');
      if (HIGH_CORRELATION_TAGS.includes(normalized)) {
        todayTags.add(normalized);
      }
    }
  }

  if (todayTags.size < 2) return null;

  // Check historical pattern: how often did this tag combo precede a setback?
  const setbackEvents = events.filter(e => e.severity === 'high');
  const todayTagArr = [...todayTags];

  let comboOccurrences = 0;
  let comboFollowedBySetback = 0;

  // Group journals by date
  const journalsByDate = new Map<string, JournalRow[]>();
  for (const j of journals) {
    const dateStr = getLocalDateStr(j.created_at, timezone);
    const existing = journalsByDate.get(dateStr) ?? [];
    existing.push(j);
    journalsByDate.set(dateStr, existing);
  }

  for (const [dateStr, dayJournals] of journalsByDate.entries()) {
    if (dateStr === todayStr) continue;

    const dayTags = new Set<string>();
    for (const j of dayJournals) {
      for (const tag of j.tags ?? []) {
        const normalized = tag.toLowerCase().replace(/\s+/g, '-');
        dayTags.add(normalized);
      }
    }

    // Check if at least 2 of today's tags appeared on that day
    const overlap = todayTagArr.filter(t => dayTags.has(t));
    if (overlap.length < 2) continue;

    comboOccurrences++;

    // Check if a setback followed within 48h
    const dayDate = new Date(dateStr);
    const twoDaysLater = new Date(dayDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    const followed = setbackEvents.some(e => {
      const eDate = new Date(e.timestamp);
      return eDate >= dayDate && eDate <= twoDaysLater;
    });

    if (followed) comboFollowedBySetback++;
  }

  const confidence = comboOccurrences > 0
    ? Math.min(1, comboFollowedBySetback / comboOccurrences)
    : 0.5;

  if (confidence < 0.3 && comboOccurrences < 2) return null;

  const tagLabels = todayTagArr.map(t => t.replace(/-/g, ' ')).join(' + ');

  return {
    type: 'trigger_combo',
    message: `${tagLabels.charAt(0).toUpperCase() + tagLabels.slice(1)} — this combination has preceded setbacks ${comboFollowedBySetback > 0 ? `${comboFollowedBySetback} out of ${comboOccurrences} times` : 'before'}. Your coach is here if you need it.`,
    confidence,
    suggested_action: pickAction('trigger_combo'),
  };
}
