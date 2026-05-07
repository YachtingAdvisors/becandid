// ============================================================
// lib/modelRouter.ts — Centralized Model Selection
//
// Routes API calls to the cheapest capable model per task
// complexity. Haiku handles simple/moderate tasks at ~12x
// less cost than Sonnet. Complex/critical tasks stay on Sonnet.
// ============================================================

export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'critical';

/**
 * Select the cheapest capable model for the given task complexity.
 *
 * simple   → Haiku ($0.25/$1.25 per 1M tokens)
 * moderate → Haiku (still very capable for structured output)
 * complex  → Sonnet ($3/$15 per 1M tokens)
 * critical → Sonnet (clinical quality, nuanced output)
 */
export function getModel(complexity: TaskComplexity): string {
  switch (complexity) {
    case 'simple':
      return 'claude-haiku-4-5-20251001';
    case 'moderate':
      return 'claude-haiku-4-5-20251001';
    case 'complex':
      return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    case 'critical':
      return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  }
}

/**
 * Suggested max_tokens cap per complexity tier.
 * Keeps output (and cost) proportional to task needs.
 */
export function getMaxTokens(complexity: TaskComplexity): number {
  switch (complexity) {
    case 'simple':
      return 200;
    case 'moderate':
      return 500;
    case 'complex':
      return 1000;
    case 'critical':
      return 2000;
  }
}
