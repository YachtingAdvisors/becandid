// ============================================================
// Be Candid — Coaching Library Types
//
// Shared type definitions for all coaching library partitions.
// Each library file (library-sexual-substances.ts, etc.) should
// import CoachingEntry from this module.
// ============================================================

export interface CoachingEntry {
  /** GoalCategory key or 'general' or 'crisis' */
  category: string;
  /** Emotional/situational tags for matching (e.g. 'loneliness', 'late_night') */
  tags: string[];
  /** Which coaching phase this content targets */
  phase: 'tributaries' | 'longing' | 'roadmap' | 'opening' | 'affirmation';
  /** The main coaching response content */
  content: string;
  /** A follow-up question to keep the conversation going */
  followUp: string;
}
