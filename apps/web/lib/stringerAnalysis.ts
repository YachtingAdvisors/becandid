// ============================================================
// Stringer Pattern Analysis Engine
//
// Analyzes user behavioral data through the lens of Jay Stringer's
// family-of-origin dynamics model from "Unwanted".
//
// Six dynamics:
//   1. Rigidity — strict, rule-bound household
//   2. Enmeshment — over-involved, boundary-less parenting
//   3. Triangulation — caught between parents' conflicts
//   4. Dismissiveness — emotional neglect, minimizing feelings
//   5. Abdication — absent or checked-out parent
//   6. Incongruence — saying one thing, doing another
// ============================================================

import { createServiceClient } from '@/lib/supabase';

export type StringerTheme = 'rigidity' | 'enmeshment' | 'triangulation' | 'dismissiveness' | 'abdication' | 'incongruence';

export const STRINGER_THEME_LABELS: Record<StringerTheme, string> = {
  rigidity: 'Rigidity',
  enmeshment: 'Enmeshment',
  triangulation: 'Triangulation',
  dismissiveness: 'Dismissiveness',
  abdication: 'Abdication',
  incongruence: 'Incongruence',
};

export const STRINGER_THEME_DESCRIPTIONS: Record<StringerTheme, string> = {
  rigidity: 'Patterns suggesting a response to strict, rule-bound environments — shame, anxiety, and perfectionism as triggers.',
  enmeshment: 'Patterns suggesting boundary confusion — boredom, over-structure, and acting out when feeling suffocated.',
  triangulation: 'Patterns suggesting unresolved relational conflict — anger, conflict, and escapism as coping.',
  dismissiveness: 'Patterns suggesting emotional neglect — loneliness, rejection, and seeking connection through substitutes.',
  abdication: 'Patterns suggesting absent caregiving — exhaustion, stress, and self-soothing through distraction.',
  incongruence: 'Patterns suggesting exposure to hypocrisy — late-night behavior, hidden patterns, and compartmentalization.',
};

// Map journal tags to Stringer themes with weights
const TAG_THEME_MAP: Record<string, { theme: StringerTheme; weight: number }[]> = {
  shame: [{ theme: 'rigidity', weight: 0.9 }, { theme: 'incongruence', weight: 0.4 }],
  anxiety: [{ theme: 'rigidity', weight: 0.8 }, { theme: 'triangulation', weight: 0.3 }],
  loneliness: [{ theme: 'dismissiveness', weight: 0.9 }, { theme: 'abdication', weight: 0.4 }],
  rejection: [{ theme: 'dismissiveness', weight: 0.9 }, { theme: 'enmeshment', weight: 0.3 }],
  conflict: [{ theme: 'triangulation', weight: 0.9 }, { theme: 'rigidity', weight: 0.3 }],
  anger: [{ theme: 'triangulation', weight: 0.8 }, { theme: 'incongruence', weight: 0.4 }],
  exhaustion: [{ theme: 'abdication', weight: 0.8 }, { theme: 'enmeshment', weight: 0.3 }],
  stress: [{ theme: 'abdication', weight: 0.7 }, { theme: 'rigidity', weight: 0.4 }],
  boredom: [{ theme: 'enmeshment', weight: 0.8 }, { theme: 'abdication', weight: 0.4 }],
  'late-night': [{ theme: 'incongruence', weight: 0.7 }, { theme: 'abdication', weight: 0.3 }],
  work: [{ theme: 'rigidity', weight: 0.5 }, { theme: 'abdication', weight: 0.3 }],
  weekend: [{ theme: 'enmeshment', weight: 0.4 }, { theme: 'abdication', weight: 0.3 }],
  travel: [{ theme: 'abdication', weight: 0.5 }],
  celebration: [{ theme: 'incongruence', weight: 0.5 }],
  morning: [{ theme: 'rigidity', weight: 0.3 }],
};

// Map event categories to themes
const CATEGORY_THEME_MAP: Record<string, { theme: StringerTheme; weight: number }[]> = {
  pornography: [{ theme: 'dismissiveness', weight: 0.6 }, { theme: 'incongruence', weight: 0.5 }],
  sexting: [{ theme: 'dismissiveness', weight: 0.7 }, { theme: 'enmeshment', weight: 0.4 }],
  dating_apps: [{ theme: 'dismissiveness', weight: 0.8 }, { theme: 'abdication', weight: 0.3 }],
  gambling: [{ theme: 'abdication', weight: 0.6 }, { theme: 'triangulation', weight: 0.4 }],
  sports_betting: [{ theme: 'abdication', weight: 0.5 }, { theme: 'triangulation', weight: 0.4 }],
  alcohol_drugs: [{ theme: 'abdication', weight: 0.7 }, { theme: 'dismissiveness', weight: 0.4 }],
  binge_watching: [{ theme: 'abdication', weight: 0.6 }, { theme: 'enmeshment', weight: 0.3 }],
  social_media: [{ theme: 'enmeshment', weight: 0.5 }, { theme: 'dismissiveness', weight: 0.4 }],
  impulse_shopping: [{ theme: 'enmeshment', weight: 0.5 }, { theme: 'abdication', weight: 0.4 }],
  gaming: [{ theme: 'abdication', weight: 0.6 }, { theme: 'enmeshment', weight: 0.4 }],
  rage_content: [{ theme: 'triangulation', weight: 0.8 }, { theme: 'incongruence', weight: 0.3 }],
};

export interface StringerThemeResult {
  theme: StringerTheme;
  label: string;
  description: string;
  confidence: number; // 0-1
  evidence: string[]; // human-readable evidence strings
  frequency: number; // raw count of supporting data points
}

export interface PredictiveMetric {
  label: string;
  direction: 'improving' | 'declining' | 'stable';
  current: number;
  previous: number;
  unit: string;
  insight: string;
}

export interface SessionTopic {
  title: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  stringer_theme: StringerTheme | null;
  data_points: string[];
}

export interface FamilySystemsConnection {
  dynamic: StringerTheme;
  behavioral_pattern: string;
  unmet_need: string;
  suggested_exploration: string;
  confidence: number;
}

export interface PatternAnalysis {
  top_domains: { domain: string; category: string; count: number; last_visit: string }[];
  category_breakdown: { category: string; count: number; percentage: number }[];
  time_patterns: { hour: number; count: number }[];
  day_patterns: { day: number; count: number }[];
  stringer_themes: StringerThemeResult[];
  weekly_trend: { week: string; event_count: number; journal_count: number; avg_mood: number | null }[];
  trigger_tag_frequency: { tag: string; count: number }[];
  // Predictive metrics — inpatient-level insights
  predictive_metrics: PredictiveMetric[];
  // Family systems connections based on Stringer model
  family_systems: FamilySystemsConnection[];
  // Suggested conversation topics for upcoming sessions
  session_topics: SessionTopic[];
}

export async function analyzePatterns(userId: string): Promise<PatternAnalysis> {
  const db = createServiceClient();

  // Fetch data in parallel
  const [eventsRes, journalRes, focusRes] = await Promise.all([
    db.from('events')
      .select('category, severity, app_name, timestamp, platform')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5000),
    db.from('stringer_journal')
      .select('tags, mood, tributaries, longing, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500),
    db.from('focus_segments')
      .select('date, status, segment')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(180),
  ]);

  const events = eventsRes?.data ?? [];
  const journals = journalRes?.data ?? [];
  const focus = focusRes?.data ?? [];

  // 1. Top domains
  const domainMap = new Map<string, { domain: string; category: string; count: number; last_visit: string }>();
  for (const e of events) {
    const domain = e.app_name?.toLowerCase().trim();
    if (!domain) continue;
    const existing = domainMap.get(domain);
    if (existing) {
      existing.count++;
    } else {
      domainMap.set(domain, { domain, category: e.category, count: 1, last_visit: e.timestamp });
    }
  }
  const top_domains = Array.from(domainMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 2. Category breakdown
  const catCount = new Map<string, number>();
  for (const e of events) {
    catCount.set(e.category, (catCount.get(e.category) ?? 0) + 1);
  }
  const totalEvents = events.length || 1;
  const category_breakdown = Array.from(catCount.entries())
    .map(([category, count]) => ({ category, count, percentage: Math.round((count / totalEvents) * 100) }))
    .sort((a, b) => b.count - a.count);

  // 3. Time patterns (hour of day)
  const hourCount = new Array(24).fill(0);
  for (const e of events) {
    const hour = new Date(e.timestamp).getHours();
    hourCount[hour]++;
  }
  const time_patterns = hourCount.map((count, hour) => ({ hour, count }));

  // 4. Day patterns
  const dayCount = new Array(7).fill(0);
  for (const e of events) {
    const day = new Date(e.timestamp).getDay();
    dayCount[day]++;
  }
  const day_patterns = dayCount.map((count, day) => ({ day, count }));

  // 5. Stringer theme analysis
  const themeScores = new Map<StringerTheme, { total: number; count: number; evidence: string[] }>();
  for (const theme of Object.keys(STRINGER_THEME_LABELS) as StringerTheme[]) {
    themeScores.set(theme, { total: 0, count: 0, evidence: [] });
  }

  // Analyze journal tags
  for (const j of journals) {
    const tags: string[] = j.tags ?? [];
    for (const tag of tags) {
      const mappings = TAG_THEME_MAP[tag];
      if (!mappings) continue;
      for (const { theme, weight } of mappings) {
        const s = themeScores.get(theme)!;
        s.total += weight;
        s.count++;
        if (s.evidence.length < 5) {
          s.evidence.push(`Journal tag "${tag}" on ${new Date(j.created_at).toLocaleDateString()}`);
        }
      }
    }
  }

  // Analyze event categories
  for (const e of events) {
    const mappings = CATEGORY_THEME_MAP[e.category];
    if (!mappings) continue;
    for (const { theme, weight } of mappings) {
      const s = themeScores.get(theme)!;
      s.total += weight;
      s.count++;
      if (s.evidence.length < 8) {
        const domain = e.app_name ?? e.category;
        s.evidence.push(`${e.category} activity (${domain}) on ${new Date(e.timestamp).toLocaleDateString()}`);
      }
    }
  }

  // Calculate confidence scores (normalized 0-1)
  const maxScore = Math.max(...Array.from(themeScores.values()).map(s => s.total), 1);
  const stringer_themes: StringerThemeResult[] = (Object.keys(STRINGER_THEME_LABELS) as StringerTheme[])
    .map(theme => {
      const s = themeScores.get(theme)!;
      return {
        theme,
        label: STRINGER_THEME_LABELS[theme],
        description: STRINGER_THEME_DESCRIPTIONS[theme],
        confidence: Math.min(s.total / maxScore, 1),
        evidence: s.evidence.slice(0, 8),
        frequency: s.count,
      };
    })
    .filter(t => t.frequency > 0)
    .sort((a, b) => b.confidence - a.confidence);

  // 6. Weekly trend (last 12 weeks)
  const weekMap = new Map<string, { event_count: number; journal_count: number; moods: number[] }>();
  const getWeekKey = (d: Date) => {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    return start.toISOString().split('T')[0];
  };
  for (const e of events) {
    const wk = getWeekKey(new Date(e.timestamp));
    const w = weekMap.get(wk) ?? { event_count: 0, journal_count: 0, moods: [] };
    w.event_count++;
    weekMap.set(wk, w);
  }
  for (const j of journals) {
    const wk = getWeekKey(new Date(j.created_at));
    const w = weekMap.get(wk) ?? { event_count: 0, journal_count: 0, moods: [] };
    w.journal_count++;
    if (j.mood) w.moods.push(j.mood);
    weekMap.set(wk, w);
  }
  const weekly_trend = Array.from(weekMap.entries())
    .map(([week, w]) => ({
      week,
      event_count: w.event_count,
      journal_count: w.journal_count,
      avg_mood: w.moods.length > 0 ? Math.round((w.moods.reduce((a, b) => a + b, 0) / w.moods.length) * 10) / 10 : null,
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12);

  // 7. Trigger tag frequency
  const tagCount = new Map<string, number>();
  for (const j of journals) {
    for (const tag of (j.tags ?? [])) {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    }
  }
  const trigger_tag_frequency = Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // ── 8. Predictive Metrics ──────────────────────────────────
  const predictive_metrics: PredictiveMetric[] = [];

  // Compare last 2 weeks vs prior 2 weeks
  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(e => now - new Date(e.timestamp).getTime() < twoWeeksMs);
  const priorEvents = events.filter(e => {
    const age = now - new Date(e.timestamp).getTime();
    return age >= twoWeeksMs && age < twoWeeksMs * 2;
  });

  const recentCount = recentEvents.length;
  const priorCount = priorEvents.length || 1;
  const eventDirection = recentCount < priorCount * 0.8 ? 'improving' : recentCount > priorCount * 1.2 ? 'declining' : 'stable';
  predictive_metrics.push({
    label: 'Event Frequency',
    direction: eventDirection,
    current: recentCount,
    previous: priorCount,
    unit: 'events/2wk',
    insight: eventDirection === 'improving'
      ? `Flags decreased ${Math.round((1 - recentCount / priorCount) * 100)}% — sustained progress.`
      : eventDirection === 'declining'
        ? `Flags increased ${Math.round((recentCount / priorCount - 1) * 100)}% — explore what changed.`
        : 'Flag frequency is stable over the past month.',
  });

  // Mood trajectory
  const recentJournals = journals.filter(j => now - new Date(j.created_at).getTime() < twoWeeksMs);
  const priorJournals = journals.filter(j => {
    const age = now - new Date(j.created_at).getTime();
    return age >= twoWeeksMs && age < twoWeeksMs * 2;
  });
  const avgMood = (js: typeof journals) => {
    const moods = js.filter(j => j.mood).map(j => j.mood!);
    return moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
  };
  const recentMood = avgMood(recentJournals);
  const priorMood = avgMood(priorJournals) || recentMood;
  const moodDir = recentMood > priorMood + 0.3 ? 'improving' : recentMood < priorMood - 0.3 ? 'declining' : 'stable';
  if (recentMood > 0) {
    predictive_metrics.push({
      label: 'Mood Trajectory',
      direction: moodDir,
      current: Math.round(recentMood * 10) / 10,
      previous: Math.round(priorMood * 10) / 10,
      unit: '/5',
      insight: moodDir === 'improving'
        ? 'Emotional state is trending upward — the work is landing.'
        : moodDir === 'declining'
          ? 'Mood is dipping — may indicate unprocessed stress or relational strain.'
          : 'Mood is holding steady.',
    });
  }

  // Journal engagement
  const recentJCount = recentJournals.length;
  const priorJCount = priorJournals.length || 1;
  const jDir = recentJCount > priorJCount * 1.2 ? 'improving' : recentJCount < priorJCount * 0.8 ? 'declining' : 'stable';
  predictive_metrics.push({
    label: 'Journal Engagement',
    direction: jDir,
    current: recentJCount,
    previous: priorJCount,
    unit: 'entries/2wk',
    insight: jDir === 'declining'
      ? 'Journaling dropped off — avoidance or disengagement may be emerging.'
      : jDir === 'improving'
        ? 'Increased reflection — client is actively processing.'
        : 'Consistent journaling cadence.',
  });

  // Relapse risk prediction (based on pattern convergence)
  const highRiskHours = time_patterns.filter(t => t.count > (totalEvents / 24) * 2).map(t => t.hour);
  const riskFactors: string[] = [];
  if (eventDirection === 'declining') riskFactors.push('increasing event frequency');
  if (moodDir === 'declining') riskFactors.push('declining mood');
  if (jDir === 'declining') riskFactors.push('reduced journaling');
  if (highRiskHours.length > 0) riskFactors.push(`high-risk hours: ${highRiskHours.map(h => `${h}:00`).join(', ')}`);

  const riskLevel = riskFactors.length >= 3 ? 'declining' : riskFactors.length >= 1 ? 'stable' : 'improving';
  predictive_metrics.push({
    label: 'Relapse Risk',
    direction: riskLevel,
    current: riskFactors.length,
    previous: 0,
    unit: 'risk factors',
    insight: riskFactors.length === 0
      ? 'No converging risk factors detected — protective behaviors are working.'
      : `${riskFactors.length} converging risk factor${riskFactors.length > 1 ? 's' : ''}: ${riskFactors.join('; ')}.`,
  });

  // ── 9. Family Systems Connections ─────────────────────────
  const FAMILY_SYSTEMS_MAP: Record<StringerTheme, { behavioral_pattern: string; unmet_need: string; suggested_exploration: string }> = {
    rigidity: {
      behavioral_pattern: 'Acting out as rebellion against internalized rules — the body seeks what the mind forbids.',
      unmet_need: 'Permission to be imperfect. Grace without conditions.',
      suggested_exploration: 'Explore family rules around failure, sexuality, and emotional expression. What happened when rules were broken?',
    },
    enmeshment: {
      behavioral_pattern: 'Seeking novelty and escape from over-structured or suffocating environments.',
      unmet_need: 'Autonomy and healthy boundaries. Space to be a separate self.',
      suggested_exploration: 'Map the family boundary system. Where was the client allowed to say no? Who defined their identity?',
    },
    triangulation: {
      behavioral_pattern: 'Using behavior to self-medicate conflict-related distress or to create distance from relational pain.',
      unmet_need: 'Safety in relationships. A model of healthy conflict resolution.',
      suggested_exploration: 'Explore the parents\' relationship. Was the client a mediator, messenger, or confidant? How did they learn to handle disagreement?',
    },
    dismissiveness: {
      behavioral_pattern: 'Seeking digital intimacy as a substitute for the emotional connection that was unavailable growing up.',
      unmet_need: 'To be seen, known, and emotionally held without having to perform.',
      suggested_exploration: 'Ask about emotional availability in childhood. Who noticed when they were hurting? What happened when they cried?',
    },
    abdication: {
      behavioral_pattern: 'Self-soothing through stimulation because no one modeled regulation or provided co-regulation.',
      unmet_need: 'A dependable presence. Someone who stays and shows up consistently.',
      suggested_exploration: 'Explore who was (or wasn\'t) home. What did "being parented" look like day-to-day? Who taught them to self-regulate?',
    },
    incongruence: {
      behavioral_pattern: 'Compartmentalization — living a double life mirrors the double life modeled in the family.',
      unmet_need: 'Integrity and wholeness. A life where the public and private self are the same person.',
      suggested_exploration: 'Explore family secrets and contradictions. What was said vs. what was done? Were there hidden behaviors in the home?',
    },
  };

  const family_systems: FamilySystemsConnection[] = stringer_themes
    .filter(t => t.confidence > 0.2)
    .map(t => ({
      dynamic: t.theme,
      ...FAMILY_SYSTEMS_MAP[t.theme],
      confidence: t.confidence,
    }));

  // ── 10. Session Topic Suggestions ─────────────────────────
  const session_topics: SessionTopic[] = [];

  // Topic from top Stringer theme
  if (stringer_themes.length > 0) {
    const top = stringer_themes[0];
    session_topics.push({
      title: `Explore ${top.label} patterns`,
      rationale: `${top.label} is the strongest theme in the data (${Math.round(top.confidence * 100)}% confidence). ${top.description}`,
      priority: 'high',
      stringer_theme: top.theme,
      data_points: top.evidence.slice(0, 3),
    });
  }

  // Topic from mood trajectory
  if (moodDir === 'declining') {
    session_topics.push({
      title: 'Address declining emotional state',
      rationale: `Average mood dropped from ${Math.round(priorMood * 10) / 10} to ${Math.round(recentMood * 10) / 10} over the past two weeks. Explore what\'s shifting.`,
      priority: 'high',
      stringer_theme: null,
      data_points: [
        `Recent mood: ${Math.round(recentMood * 10) / 10}/5`,
        `Prior mood: ${Math.round(priorMood * 10) / 10}/5`,
        `Journal entries this period: ${recentJCount}`,
      ],
    });
  }

  // Topic from top trigger tags
  const topTags = trigger_tag_frequency.slice(0, 3);
  if (topTags.length > 0) {
    session_topics.push({
      title: `Unpack recurring triggers: ${topTags.map(t => t.tag).join(', ')}`,
      rationale: `These tags appear most frequently in journal entries, suggesting persistent emotional themes worth exploring.`,
      priority: topTags[0].count >= 5 ? 'high' : 'medium',
      stringer_theme: TAG_THEME_MAP[topTags[0].tag]?.[0]?.theme ?? null,
      data_points: topTags.map(t => `"${t.tag}" — ${t.count} entries`),
    });
  }

  // Topic from time patterns (vulnerability windows)
  if (highRiskHours.length > 0) {
    const peakHour = time_patterns.reduce((a, b) => b.count > a.count ? b : a);
    session_topics.push({
      title: 'Build a safety plan for high-risk hours',
      rationale: `${Math.round((peakHour.count / totalEvents) * 100)}% of events cluster around ${peakHour.hour}:00. Proactive planning can disrupt the pattern.`,
      priority: 'medium',
      stringer_theme: null,
      data_points: highRiskHours.map(h => `${h}:00 — ${time_patterns[h].count} events`),
    });
  }

  // Topic from category patterns
  if (category_breakdown.length > 0 && category_breakdown[0].percentage > 40) {
    const topCat = category_breakdown[0];
    session_topics.push({
      title: `Explore the role of ${topCat.category.replace(/_/g, ' ')} in the client's story`,
      rationale: `${topCat.category.replace(/_/g, ' ')} accounts for ${topCat.percentage}% of all flagged activity. What need is it serving?`,
      priority: 'medium',
      stringer_theme: CATEGORY_THEME_MAP[topCat.category]?.[0]?.theme ?? null,
      data_points: [`${topCat.count} events`, `${topCat.percentage}% of all activity`],
    });
  }

  // Topic from journaling gaps
  if (jDir === 'declining') {
    session_topics.push({
      title: 'Address journaling avoidance',
      rationale: 'Reflection dropped significantly. Avoidance of self-examination often precedes escalation.',
      priority: 'medium',
      stringer_theme: null,
      data_points: [`Recent: ${recentJCount} entries`, `Prior: ${priorJCount} entries`],
    });
  }

  return {
    top_domains,
    category_breakdown,
    time_patterns,
    day_patterns,
    stringer_themes,
    weekly_trend,
    trigger_tag_frequency,
    predictive_metrics,
    family_systems,
    session_topics,
  };
}
