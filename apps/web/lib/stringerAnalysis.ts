// ============================================================
// Be Candid — Stringer Family Systems Analysis Engine
//
// Based on Jay Stringer's *Unwanted* research, this module
// analyzes a user's rival categories, journal entries, and
// behavioral patterns to predict likely family-of-origin
// dynamics with confidence percentages.
//
// Stringer's six family-of-origin dynamics:
//   1. Rigidity        — authoritarian, rule-bound household
//   2. Enmeshment      — boundary-less, over-involved family
//   3. Triangulation   — child pulled between warring parents
//   4. Dismissiveness  — emotionally unavailable, neglectful
//   5. Abdication      — parent abdicated role, child self-raised
//   6. Incongruence    — public vs. private family persona
//
// These dynamics correlate with parenting styles:
//   Rigidity         → Authoritarian parenting
//   Enmeshment       → Enmeshed / helicopter parenting
//   Dismissiveness   → Uninvolved / neglectful parenting
//   Abdication       → Permissive / absent parenting
//   Triangulation    → Conflict-driven / unstable parenting
//   Incongruence     → Performative / double-life parenting
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase';
import type { GoalCategory } from '@be-candid/shared';

// ─── Types ──────────────────────────────────────────────────

export type FamilyDynamic =
  | 'rigidity'
  | 'enmeshment'
  | 'triangulation'
  | 'dismissiveness'
  | 'abdication'
  | 'incongruence';

export type ParentingStyle =
  | 'authoritarian'
  | 'enmeshed'
  | 'uninvolved'
  | 'permissive'
  | 'conflict_driven'
  | 'performative';

export interface DynamicScore {
  dynamic: FamilyDynamic;
  label: string;
  description: string;
  confidence: number; // 0–100
  signals: string[];  // what contributed to this score
  parenting_style: ParentingStyle;
  parenting_label: string;
}

export interface FamilySystemsAnalysis {
  user_id: string;
  analyzed_at: string;
  rivals: GoalCategory[];
  dynamics: DynamicScore[];
  primary_dynamic: FamilyDynamic | null;
  primary_parenting_style: ParentingStyle | null;
  data_quality: 'insufficient' | 'low' | 'moderate' | 'strong';
  journal_count: number;
  event_count: number;
  summary: string;
}

// ─── Dynamic Metadata ───────────────────────────────────────

const DYNAMIC_META: Record<FamilyDynamic, { label: string; description: string; parenting_style: ParentingStyle; parenting_label: string }> = {
  rigidity: {
    label: 'Rigidity',
    description: 'A rule-bound, performance-driven household where emotions were seen as weakness. Children learn to suppress feelings and seek control.',
    parenting_style: 'authoritarian',
    parenting_label: 'Authoritarian',
  },
  enmeshment: {
    label: 'Enmeshment',
    description: 'An overly close family where boundaries were blurred. The child became responsible for a parent\'s emotional wellbeing.',
    parenting_style: 'enmeshed',
    parenting_label: 'Enmeshed / Helicopter',
  },
  triangulation: {
    label: 'Triangulation',
    description: 'The child was pulled between warring parents or used as a messenger, ally, or emotional proxy in adult conflicts.',
    parenting_style: 'conflict_driven',
    parenting_label: 'Conflict-Driven / Unstable',
  },
  dismissiveness: {
    label: 'Dismissiveness',
    description: 'Emotional needs were minimized, ignored, or met with "toughen up." The child learned their inner world didn\'t matter.',
    parenting_style: 'uninvolved',
    parenting_label: 'Uninvolved / Neglectful',
  },
  abdication: {
    label: 'Abdication',
    description: 'A parent was physically or emotionally absent. The child was parentified — forced to raise themselves or care for siblings.',
    parenting_style: 'permissive',
    parenting_label: 'Permissive / Absent',
  },
  incongruence: {
    label: 'Incongruence',
    description: 'The family had a public persona that didn\'t match private reality. "We look fine" was the unspoken rule. Secrets were normalized.',
    parenting_style: 'performative',
    parenting_label: 'Performative / Double-Life',
  },
};

// ─── Rival → Dynamic Weight Matrix ─────────────────────────
// Each rival category maps to weighted signals for each dynamic.
// Weights are 0–3: 0 = no signal, 1 = weak, 2 = moderate, 3 = strong.
// Based on addiction research + Stringer's framework generalized
// beyond sexual behavior to all compulsive/addictive patterns.

const RIVAL_DYNAMIC_WEIGHTS: Record<GoalCategory, Partial<Record<FamilyDynamic, number>>> = {
  // Sexual content — Stringer's primary research domain
  pornography: {
    rigidity: 3, incongruence: 3, dismissiveness: 2, enmeshment: 2, abdication: 1, triangulation: 1,
  },
  sexting: {
    enmeshment: 3, dismissiveness: 2, triangulation: 2, incongruence: 1, abdication: 1,
  },

  // Compulsive consumption — escapism and numbing patterns
  social_media: {
    enmeshment: 2, dismissiveness: 2, triangulation: 1, incongruence: 1,
  },
  binge_watching: {
    dismissiveness: 3, abdication: 2, enmeshment: 1,
  },
  impulse_shopping: {
    enmeshment: 2, abdication: 2, dismissiveness: 2, incongruence: 1,
  },

  // Substances — self-medication and family modeling
  alcohol_drugs: {
    abdication: 3, dismissiveness: 2, incongruence: 2, triangulation: 2, enmeshment: 1,
  },
  vaping_tobacco: {
    abdication: 2, dismissiveness: 2, rigidity: 1,
  },

  // Body image — control and performance dynamics
  eating_disorder: {
    rigidity: 3, enmeshment: 3, incongruence: 2, dismissiveness: 1,
  },
  body_checking: {
    rigidity: 2, enmeshment: 2, incongruence: 1,
  },

  // Gambling & financial — risk-seeking and chaos-familiarity
  gambling: {
    abdication: 3, dismissiveness: 2, rigidity: 2, triangulation: 1, incongruence: 1,
  },
  sports_betting: {
    abdication: 2, dismissiveness: 2, rigidity: 1, triangulation: 1,
  },
  day_trading: {
    abdication: 2, rigidity: 2, dismissiveness: 1, incongruence: 1,
  },

  // Dating — attachment wounds
  dating_apps: {
    enmeshment: 3, dismissiveness: 3, triangulation: 2, abdication: 1,
  },

  // Gaming — escape and mastery-seeking
  gaming: {
    abdication: 3, dismissiveness: 2, rigidity: 2, enmeshment: 1,
  },

  // Rage — externalized anger from family conflict
  rage_content: {
    rigidity: 3, triangulation: 3, incongruence: 2, dismissiveness: 1,
  },

  // Isolation — withdrawal driven by dismissiveness and abdication
  isolation: {
    dismissiveness: 3, abdication: 3, incongruence: 2,
  },

  // Doomscrolling — anxiety-driven news consumption
  doomscrolling: {
    rigidity: 2, incongruence: 1,
  },

  // AI relationships — artificial intimacy replacing real connection
  ai_relationships: {
    dismissiveness: 3, enmeshment: 2, abdication: 2,
  },

  // Overworking — work as avoidance
  overworking: {
    rigidity: 3, incongruence: 2, abdication: 1,
  },

  // Emotional affairs — boundary violations
  emotional_affairs: {
    enmeshment: 3, triangulation: 3, incongruence: 2, dismissiveness: 1,
  },

  // Sleep avoidance — revenge bedtime procrastination
  sleep_avoidance: {
    abdication: 2, dismissiveness: 2, rigidity: 1,
  },

  // Gossip & drama — vicarious emotional engagement
  gossip_drama: {
    triangulation: 3, enmeshment: 2, incongruence: 1,
  },

  // Self-harm recovery — pain externalization
  self_harm: {
    dismissiveness: 3, abdication: 2, rigidity: 2, incongruence: 1,
  },

  // Procrastination — avoidance and task paralysis
  procrastination: {
    abdication: 3, dismissiveness: 2, rigidity: 1,
  },

  // Custom — no weighted signals (therapist notes drive analysis)
  custom: {},
};

// ─── Journal Keyword Signals ────────────────────────────────
// Keywords found in tributaries/longing/roadmap/freewrite that
// signal specific family dynamics. Case-insensitive matching.

const KEYWORD_SIGNALS: Record<FamilyDynamic, string[]> = {
  rigidity: [
    'control', 'rules', 'strict', 'perfect', 'expectations', 'performance',
    'never good enough', 'disappointed', 'grades', 'obey', 'punished',
    'discipline', 'rigid', 'authoritarian', 'demanding', 'achievement',
    'failure', 'measure up', 'approval', 'standards',
  ],
  enmeshment: [
    'responsible for', 'their feelings', 'couldn\'t disappoint', 'too close',
    'guilt', 'owe them', 'smothering', 'no boundaries', 'codependent',
    'clingy', 'helicopter', 'overprotective', 'enmeshed', 'suffocating',
    'couldn\'t breathe', 'emotional caretaker', 'parentified', 'their burden',
    'fusion', 'merged',
  ],
  triangulation: [
    'caught in the middle', 'took sides', 'used against', 'messenger',
    'parents fought', 'divorce', 'custody', 'played off', 'manipulation',
    'ally', 'pawn', 'chosen one', 'scapegoat', 'golden child',
    'pick a side', 'loyalty', 'torn between', 'weaponized',
  ],
  dismissiveness: [
    'ignored', 'didn\'t care', 'wasn\'t there', 'invisible', 'toughen up',
    'suck it up', 'don\'t cry', 'man up', 'weak', 'overreacting',
    'not a big deal', 'get over it', 'dismissed', 'minimized',
    'neglected', 'unheard', 'unseen', 'alone', 'empty', 'numb',
  ],
  abdication: [
    'raised myself', 'had to grow up', 'no one to turn to', 'absent',
    'left alone', 'fend for myself', 'parent was gone', 'drinking',
    'abandoned', 'checked out', 'workaholic parent', 'never home',
    'took care of siblings', 'grew up fast', 'no guidance',
    'figured it out alone', 'self-reliant', 'couldn\'t depend on',
  ],
  incongruence: [
    'fake', 'public vs private', 'church', 'pretended', 'image',
    'reputation', 'secret', 'two-faced', 'double life', 'appearance',
    'what people think', 'behind closed doors', 'mask', 'facade',
    'performing', 'hiding', 'not what it seemed', 'family image',
    'looked perfect', 'dirty laundry',
  ],
};

// ─── Tag Signals ────────────────────────────────────────────
// Journal tags that contribute to dynamic scores.

const TAG_SIGNALS: Record<string, Partial<Record<FamilyDynamic, number>>> = {
  'late-night':  { abdication: 1, dismissiveness: 1 },
  'stress':      { rigidity: 1, enmeshment: 1 },
  'loneliness':  { dismissiveness: 2, abdication: 1 },
  'conflict':    { triangulation: 2, rigidity: 1 },
  'exhaustion':  { enmeshment: 1, abdication: 1 },
  'boredom':     { dismissiveness: 1, abdication: 1 },
  'rejection':   { dismissiveness: 2, enmeshment: 1 },
  'shame':       { rigidity: 2, incongruence: 2, enmeshment: 1 },
  'anger':       { triangulation: 1, rigidity: 1, dismissiveness: 1 },
  'anxiety':     { rigidity: 1, enmeshment: 1, incongruence: 1 },
  'travel':      {},
  'celebration': {},
  'weekend':     { abdication: 1 },
  'morning':     {},
  'work':        { rigidity: 1 },
};

// ─── Analysis Engine ────────────────────────────────────────

export async function analyzeFamilySystems(
  db: SupabaseClient,
  userId: string,
): Promise<FamilySystemsAnalysis> {
  // Fetch user goals (rivals)
  const { data: userRow } = await db.from('users')
    .select('goals')
    .eq('id', userId)
    .single();

  const rivals: GoalCategory[] = userRow?.goals ?? [];

  // Fetch journal entries (last 6 months, up to 100)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: journals } = await db.from('stringer_journal')
    .select('tributaries, longing, roadmap, freewrite, tags, mood, trigger_type')
    .eq('user_id', userId)
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch event count for data quality assessment
  const { count: eventCount } = await db.from('events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Fetch any existing therapist notes to boost signals
  const { data: therapistNotes } = await db.from('family_systems_notes')
    .select('dynamic, confirmed')
    .eq('user_id', userId);

  const journalEntries = journals ?? [];
  const totalEvents = eventCount ?? 0;

  // ── Score accumulation ────────────────────────────────────
  const scores: Record<FamilyDynamic, { raw: number; signals: string[] }> = {
    rigidity:       { raw: 0, signals: [] },
    enmeshment:     { raw: 0, signals: [] },
    triangulation:  { raw: 0, signals: [] },
    dismissiveness: { raw: 0, signals: [] },
    abdication:     { raw: 0, signals: [] },
    incongruence:   { raw: 0, signals: [] },
  };

  // 1. Rival-based scoring (baseline from category selection)
  for (const rival of rivals) {
    const weights = RIVAL_DYNAMIC_WEIGHTS[rival];
    if (!weights) continue;
    for (const [dynamic, weight] of Object.entries(weights)) {
      const d = dynamic as FamilyDynamic;
      scores[d].raw += weight as number;
      if ((weight as number) >= 2) {
        const { GOAL_LABELS } = await import('@be-candid/shared');
        scores[d].signals.push(`${GOAL_LABELS[rival]} rival (research correlation)`);
      }
    }
  }

  // 2. Journal keyword analysis
  for (const entry of journalEntries) {
    const allText = [entry.tributaries, entry.longing, entry.roadmap, entry.freewrite]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!allText) continue;

    for (const [dynamic, keywords] of Object.entries(KEYWORD_SIGNALS)) {
      const d = dynamic as FamilyDynamic;
      for (const keyword of keywords) {
        if (allText.includes(keyword.toLowerCase())) {
          scores[d].raw += 2;
          // Only add unique signals
          const signal = `Journal keyword: "${keyword}"`;
          if (!scores[d].signals.includes(signal)) {
            scores[d].signals.push(signal);
          }
        }
      }
    }

    // 3. Tag-based scoring
    const tags: string[] = entry.tags ?? [];
    for (const tag of tags) {
      const tagWeights = TAG_SIGNALS[tag];
      if (!tagWeights) continue;
      for (const [dynamic, weight] of Object.entries(tagWeights)) {
        const d = dynamic as FamilyDynamic;
        scores[d].raw += weight as number;
      }
    }

    // 4. Trigger type signals
    if (entry.trigger_type === 'relapse') {
      // Relapse-triggered entries carry more weight for certain dynamics
      scores.incongruence.raw += 1; // pattern of hiding/shame
      scores.rigidity.raw += 1;     // shame-driven cycle
    }
  }

  // 5. Mood pattern signals
  const moods = journalEntries.filter(e => e.mood != null).map(e => e.mood as number);
  if (moods.length >= 5) {
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    if (avgMood <= 2.0) {
      scores.dismissiveness.raw += 2;
      scores.dismissiveness.signals.push('Consistently low mood (avg ≤ 2)');
    }
    // High mood variance suggests emotional instability → triangulation/enmeshment
    const variance = moods.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moods.length;
    if (variance > 1.5) {
      scores.triangulation.raw += 1;
      scores.enmeshment.raw += 1;
      scores.triangulation.signals.push('High mood variance (emotional instability)');
    }
  }

  // 6. Therapist confirmation boost
  if (therapistNotes) {
    for (const note of therapistNotes) {
      const d = note.dynamic as FamilyDynamic;
      if (d && scores[d] && note.confirmed) {
        scores[d].raw += 5; // therapist confirmation is a strong signal
        scores[d].signals.push('Confirmed by therapist');
      }
    }
  }

  // ── Normalize to 0–100 confidence ─────────────────────────
  const maxRaw = Math.max(...Object.values(scores).map(s => s.raw), 1);

  // Data quality assessment
  const dataQuality: FamilySystemsAnalysis['data_quality'] =
    journalEntries.length < 3 ? 'insufficient' :
    journalEntries.length < 10 ? 'low' :
    journalEntries.length < 25 ? 'moderate' : 'strong';

  // Scale factor based on data quality (cap confidence when data is thin)
  const qualityCap =
    dataQuality === 'insufficient' ? 30 :
    dataQuality === 'low' ? 55 :
    dataQuality === 'moderate' ? 80 : 95;

  const dynamics: DynamicScore[] = (Object.keys(scores) as FamilyDynamic[]).map(dynamic => {
    const { raw, signals } = scores[dynamic];
    const meta = DYNAMIC_META[dynamic];
    // Normalize: scale relative to max, then cap by data quality
    const normalized = maxRaw > 0 ? Math.round((raw / maxRaw) * qualityCap) : 0;
    // Floor at 0, ceiling at qualityCap
    const confidence = Math.min(Math.max(normalized, 0), qualityCap);

    return {
      dynamic,
      label: meta.label,
      description: meta.description,
      confidence,
      signals: signals.slice(0, 8), // cap at 8 most relevant signals
      parenting_style: meta.parenting_style,
      parenting_label: meta.parenting_label,
    };
  }).sort((a, b) => b.confidence - a.confidence);

  const primary = dynamics[0]?.confidence > 0 ? dynamics[0] : null;

  // Generate summary
  const summary = generateSummary(rivals, dynamics, dataQuality);

  return {
    user_id: userId,
    analyzed_at: new Date().toISOString(),
    rivals,
    dynamics,
    primary_dynamic: primary?.dynamic ?? null,
    primary_parenting_style: primary?.parenting_style ?? null,
    data_quality: dataQuality,
    journal_count: journalEntries.length,
    event_count: totalEvents,
    summary,
  };
}

// ─── Summary Generator ──────────────────────────────────────

function generateSummary(
  rivals: GoalCategory[],
  dynamics: DynamicScore[],
  dataQuality: FamilySystemsAnalysis['data_quality'],
): string {
  if (dataQuality === 'insufficient') {
    return 'Not enough journal data to generate a family systems analysis. Encourage the client to continue journaling — the Stringer prompts (Tributaries, Longing, Roadmap) are designed to surface family-of-origin patterns over time.';
  }

  const top = dynamics.filter(d => d.confidence >= 20);
  if (top.length === 0) {
    return 'No strong family-of-origin signals detected yet. As the client journals more, patterns may emerge.';
  }

  const primary = top[0];
  const secondary = top.length > 1 ? top[1] : null;

  let text = `Based on ${rivals.length} rival${rivals.length !== 1 ? 's' : ''} and journal analysis, `;
  text += `the strongest signal is **${primary.label}** (${primary.confidence}% confidence), `;
  text += `suggesting a likely **${primary.parenting_label}** parenting environment. `;
  text += primary.description + ' ';

  if (secondary && secondary.confidence >= 30) {
    text += `A secondary pattern of **${secondary.label}** (${secondary.confidence}%) is also present, `;
    text += `which often co-occurs with ${primary.label} in clinical settings.`;
  }

  if (dataQuality === 'low') {
    text += ' Note: confidence is limited by low journal volume. These signals will sharpen with continued journaling.';
  }

  return text;
}

// ─── Exported Constants (for therapist UI) ──────────────────

export const ALL_DYNAMICS: FamilyDynamic[] = [
  'rigidity', 'enmeshment', 'triangulation',
  'dismissiveness', 'abdication', 'incongruence',
];

export const DYNAMIC_LABELS: Record<FamilyDynamic, string> = {
  rigidity: 'Rigidity',
  enmeshment: 'Enmeshment',
  triangulation: 'Triangulation',
  dismissiveness: 'Dismissiveness',
  abdication: 'Abdication',
  incongruence: 'Incongruence',
};

export const PARENTING_STYLE_LABELS: Record<ParentingStyle, string> = {
  authoritarian: 'Authoritarian',
  enmeshed: 'Enmeshed / Helicopter',
  uninvolved: 'Uninvolved / Neglectful',
  permissive: 'Permissive / Absent',
  conflict_driven: 'Conflict-Driven / Unstable',
  performative: 'Performative / Double-Life',
};

// ─── Pattern Analysis Engine (from main) ────────────────────
// Lighter-weight analysis used by the therapist portal patterns view.

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
