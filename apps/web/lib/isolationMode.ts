// ============================================================
// lib/isolationMode.ts — Non-Scan Mode Detection
//
// Users who pick ONLY behavioral rivals (isolation, overworking,
// sleep_avoidance, procrastination, self_harm, emotional_affairs,
// custom) don't need screen monitoring — they need nudges,
// check-ins, and connection tools instead.
// ============================================================

/**
 * Behavioral categories that do not require screen scanning.
 * These rivals are addressed through check-ins, journaling, and nudges
 * rather than desktop/browser content monitoring.
 */
const NON_SCAN_CATEGORIES = [
  'isolation',
  'overworking',
  'emotional_affairs',
  'sleep_avoidance',
  'procrastination',
  'self_harm',
  'custom',
] as const;

/**
 * Returns true if ALL of the user's goals are non-scan categories.
 * These users don't need screen scanning — they need behavioral nudges.
 *
 * @deprecated Use `isNonScanUser` instead. This alias exists for backward compatibility.
 */
export function isIsolationOnlyUser(goals: string[]): boolean {
  return isNonScanUser(goals);
}

/**
 * Returns true if ALL of the user's goals are behavioral (non-scan) categories.
 * These users don't need the desktop app or browser extension.
 */
export function isNonScanUser(goals: string[]): boolean {
  return goals.length > 0 && goals.every(g => (NON_SCAN_CATEGORIES as readonly string[]).includes(g));
}

/**
 * Returns true if the user has 'isolation' among their goals
 * (regardless of other goals).
 */
export function hasIsolationGoal(goals: string[]): boolean {
  return goals.includes('isolation');
}
