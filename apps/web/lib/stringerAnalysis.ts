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
