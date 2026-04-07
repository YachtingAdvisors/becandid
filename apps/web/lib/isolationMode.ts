// ============================================================
// lib/isolationMode.ts — Isolation Mode Detection
//
// Users who pick ONLY isolation (and/or custom) as rivals
// don't need screen monitoring — they need connection nudges.
// ============================================================

/**
 * Returns true if the user's ONLY rivals are isolation (and/or custom).
 * These users don't need screen scanning — they need connection nudges.
 */
export function isIsolationOnlyUser(goals: string[]): boolean {
  const nonScanCategories = ['isolation', 'custom'];
  return goals.length > 0 && goals.every(g => nonScanCategories.includes(g));
}

/**
 * Returns true if the user has 'isolation' among their goals
 * (regardless of other goals).
 */
export function hasIsolationGoal(goals: string[]): boolean {
  return goals.includes('isolation');
}
