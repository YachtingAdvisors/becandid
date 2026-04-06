// ============================================================
// Be Candid — Coaching Content Lookup
//
// Fast in-memory lookup for pre-written coaching content.
// Scores candidates by category + tag + phase match quality,
// and picks randomly among top scorers (seeded by date +
// category so the same user gets variety across days but
// consistency within a single day).
//
// Also exports crisis keyword detection — this MUST override
// all other matching and trigger the Sonnet escalation path.
// ============================================================

import { FULL_COACHING_LIBRARY } from './coaching/index';
import type { CoachingEntry } from './coaching/index';

// ─── Types ──────────────────────────────────────────────────

export type CoachingPhase = 'tributaries' | 'longing' | 'roadmap' | 'opening' | 'affirmation';

export interface CoachingMatch {
  content: string;
  followUp: string;
  score: number;
  source: string; // category+tag+phase for debugging
}

export interface CoachingLookupParams {
  category: string;
  tags: string[];
  phase: CoachingPhase;
  mood?: number;
  sessionMessageCount?: number;
}

// ─── Crisis Detection ───────────────────────────────────────

const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(?:e|al)\b/i,
  /\bkill\s+my\s*self\b/i,
  /\bself[- ]?harm\b/i,
  /\bcutting\b/i,
  /\bend\s+it\s+all\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\brather\s+(?:be\s+)?dead\b/i,
  /\bdon'?t\s+want\s+to\s+(?:be\s+)?(?:alive|here|exist)\b/i,
  /\bhurt\s+my\s*self\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\boverdose\b/i,
  /\bjump\s+off\b/i,
  /\bnot\s+worth\s+living\b/i,
  /\bwish\s+i\s+(?:was|were)\s+dead\b/i,
  /\blife\s+(?:is|isn'?t)\s+worth\b/i,
  /\bplanning\s+(?:to\s+)?(?:end|kill|hurt)\b/i,
];

/**
 * Detect crisis language in a user message.
 * Returns true if any crisis pattern matches.
 * This must ALWAYS trigger Sonnet escalation + crisis resources.
 */
export function detectCrisisKeywords(message: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(message));
}

// ─── Deterministic Seeded Random ────────────────────────────

/**
 * Simple hash-based PRNG seeded by a string.
 * Produces a float in [0, 1). Not cryptographic —
 * just enough to provide day-level variety.
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Convert to [0, 1)
  return Math.abs(hash % 10_000) / 10_000;
}

// ─── Scoring ────────────────────────────────────────────────

function scoreEntry(
  entry: CoachingEntry,
  params: CoachingLookupParams,
): number {
  const { category, tags, phase } = params;

  // Crisis content always wins when crisis is detected
  if (entry.category === 'crisis') {
    return 200;
  }

  const categoryMatch = entry.category === category;
  const phaseMatch = entry.phase === phase;
  const tagOverlap = entry.tags.some((t) => tags.includes(t));
  const isGeneral = entry.category === 'general';

  // Tier 1: Exact category + exact tag + exact phase
  if (categoryMatch && tagOverlap && phaseMatch) {
    return 100;
  }

  // Tier 2: Exact category + phase (no tag match)
  if (categoryMatch && phaseMatch) {
    return 60;
  }

  // Tier 3: Tag match + phase (general or mismatched category)
  if (tagOverlap && phaseMatch) {
    return 40;
  }

  // Tier 4: General content for phase
  if (isGeneral && phaseMatch) {
    return 20;
  }

  // No useful match
  return 0;
}

// ─── Main Lookup ────────────────────────────────────────────

/**
 * Find the best matching coaching content for the given params.
 *
 * Scoring:
 *   100 — exact category + tag + phase
 *    60 — exact category + phase (no tag match)
 *    40 — tag match + phase (general category)
 *    20 — general content for phase
 *   200 — crisis content (always wins when crisis detected)
 *
 * Among equal-scoring matches, picks randomly using a seed
 * derived from the current date + category, so the user gets
 * variety across days but consistency within a day.
 */
export function findCoachingContent(
  params: CoachingLookupParams,
): CoachingMatch | null {
  const scored: Array<{ entry: CoachingEntry; score: number }> = [];

  for (const entry of FULL_COACHING_LIBRARY) {
    const score = scoreEntry(entry, params);
    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  if (scored.length === 0) {
    return null;
  }

  // Find the highest score
  const maxScore = Math.max(...scored.map((s) => s.score));

  // Filter to only top-scoring entries
  const topMatches = scored.filter((s) => s.score === maxScore);

  // Pick randomly among top matches, seeded by date + category
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = `${today}:${params.category}:${params.phase}`;
  const index = Math.floor(seededRandom(seed) * topMatches.length);
  const winner = topMatches[index];

  return {
    content: winner.entry.content,
    followUp: winner.entry.followUp,
    score: winner.score,
    source: `${winner.entry.category}+${winner.entry.tags.join(',')}+${winner.entry.phase}`,
  };
}
