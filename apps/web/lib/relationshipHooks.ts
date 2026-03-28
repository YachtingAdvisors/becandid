// ============================================================
// lib/relationshipHooks.ts
//
// Drop-in hooks for existing code. Each function awards
// relationship XP at a specific touchpoint.
//
// These are the ONLY lines you need to add to existing files.
// Each is a single async call that's non-fatal if it fails.
// ============================================================

import { awardRelationshipXP } from './relationshipEngine';

// ── Called from: alertPipeline.ts (after partner views alert) ──
export async function onPartnerViewedAlert(userId: string) {
  try {
    return await awardRelationshipXP(userId, 'partner', 'alert_viewed');
  } catch { return null; }
}

// ── Called from: alertPipeline.ts (partner responded <2hr) ────
export async function onPartnerFastResponse(userId: string, alertCreatedAt: string) {
  try {
    const hours = (Date.now() - new Date(alertCreatedAt).getTime()) / 3600000;
    if (hours <= 2) {
      return await awardRelationshipXP(userId, 'partner', 'fast_response', { response_hours: Math.round(hours * 10) / 10 });
    }
    return null;
  } catch { return null; }
}

// ── Called from: conversation/[alertId]/page.tsx (guide opened) ──
export async function onGuideOpened(userId: string, role: 'user' | 'partner') {
  try {
    return await awardRelationshipXP(userId, role, role === 'user' ? 'viewed_guide' : 'guide_opened');
  } catch { return null; }
}

// ── Called from: conversation-outcomes route (user rates) ──────
export async function onOutcomeRated(userId: string, role: 'user' | 'partner') {
  try {
    return await awardRelationshipXP(userId, role, role === 'user' ? 'rated_outcome' : 'partner_rated_outcome');
  } catch { return null; }
}

// ── Called from: conversation-outcomes route (both completed) ──
export async function onBothCompletedOutcome(userId: string) {
  try {
    const r1 = await awardRelationshipXP(userId, 'user', 'both_completed_outcome');
    const r2 = await awardRelationshipXP(userId, 'partner', 'both_completed_outcome');
    return { user: r1, partner: r2 };
  } catch { return null; }
}

// ── Called from: focus-segments cron (focused segment) ─────────
export async function onFocusedSegment(userId: string) {
  try {
    return await awardRelationshipXP(userId, 'user', 'focused_segment');
  } catch { return null; }
}

// ── Called from: check-in route (user responds) ───────────────
export async function onCheckinResponse(userId: string) {
  try {
    return await awardRelationshipXP(userId, 'user', 'checkin_response');
  } catch { return null; }
}

// ── Called from: check-in route (partner confirms) ────────────
export async function onCheckinConfirmed(userId: string) {
  try {
    return await awardRelationshipXP(userId, 'partner', 'checkin_confirmed');
  } catch { return null; }
}

// ── Called from: check-in route (both confirmed) ──────────────
export async function onBothConfirmedCheckin(userId: string) {
  try {
    const r1 = await awardRelationshipXP(userId, 'user', 'both_confirmed_checkin');
    const r2 = await awardRelationshipXP(userId, 'partner', 'both_confirmed_checkin');
    return { user: r1, partner: r2 };
  } catch { return null; }
}

// ── Called from: journal API (user saves entry) ───────────────
// BONUS: not required, but rewards journaling
export async function onJournalEntry(userId: string, allPromptsCompleted: boolean) {
  try {
    const result = await awardRelationshipXP(userId, 'user', 'journal_entry');

    // Extra bonus if all 3 Stringer prompts were filled
    if (allPromptsCompleted) {
      await awardRelationshipXP(userId, 'user', 'journal_all_prompts');
    }

    return result;
  } catch { return null; }
}

// ── Called from: journal-reminders cron (weekly check) ────────
// BONUS: 3+ journal days in a week
export async function onJournalWeeklyStreak(userId: string, daysThisWeek: number) {
  try {
    if (daysThisWeek >= 3) {
      return await awardRelationshipXP(userId, 'user', 'journal_weekly_streak', { days: daysThisWeek });
    }
    return null;
  } catch { return null; }
}

// ── Called from: encouragements route (partner sends love) ────
// BONUS: not required, but rewards reaching out
export async function onEncouragementSent(userId: string) {
  try {
    return await awardRelationshipXP(userId, 'partner', 'sent_encouragement');
  } catch { return null; }
}

// ── Called from: any route where someone reaches out first ────
// BONUS: reaching out proactively after a flag (before being asked)
export async function onReachedOutFirst(userId: string, role: 'user' | 'partner') {
  try {
    return await awardRelationshipXP(userId, role, 'reached_out_first');
  } catch { return null; }
}
