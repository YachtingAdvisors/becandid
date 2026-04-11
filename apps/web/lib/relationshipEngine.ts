// ============================================================
// lib/relationshipEngine.ts
//
// The relationship level grows through natural use of the app.
// Nothing is required. Everything is rewarded.
//
// ── Base XP (earned through normal use) ─────────────────────
//
//   USER ACTIONS:
//     Focused day segment              +5 XP
//     Responded to check-in            +5 XP
//     Viewed conversation guide        +5 XP
//     Rated conversation outcome       +8 XP
//
//   PARTNER ACTIONS:
//     Viewed an alert                  +5 XP
//     Opened conversation guide        +5 XP
//     Confirmed check-in              +5 XP
//     Rated conversation outcome       +8 XP
//
//   SHARED (both earn):
//     Both completed outcome           +15 XP each
//     Check-in confirmed by both       +10 XP each
//
// ── Bonus XP (optional, encouraged but never required) ──────
//
//   USER BONUSES:
//     Wrote journal entry              +8 XP bonus
//     Filled all 3 Stringer prompts    +5 XP bonus (on top of +8)
//     Journaled 3+ days this week      +15 XP weekly bonus
//
//   PARTNER BONUSES:
//     Sent encouragement               +10 XP bonus
//     Responded to alert within 2hr    +5 XP bonus (speed bonus)
//
//   EITHER SIDE:
//     Reached out first after a flag   +8 XP bonus
//
// ── Streak multiplier ───────────────────────────────────────
//   Days where BOTH user and partner earned XP count as
//   streak days. Consecutive streak days add a multiplier:
//     3-day streak:  1.2x on all XP that day
//     7-day streak:  1.5x
//     14-day streak: 1.8x
//     30-day streak: 2.0x
//
// ── Level thresholds ────────────────────────────────────────
//   Level 1:  0 XP      "New Connection"
//   Level 2:  200 XP    "Getting Started"
//   Level 3:  500 XP    "Building Trust"
//   Level 4:  900 XP    "Growing Together"
//   Level 5:  1,500 XP  "Steady Ground"
//   Level 6:  2,500 XP  "Deep Roots"
//   Level 7:  3,500 XP  "Proven Bond"
//   Level 8:  5,000 XP  "Iron Sharpens Iron"
//   Level 9:  7,000 XP  "Unshakeable"
//   Level 10: 10,000 XP "Covenant"
//
// At ~30 base XP/day + bonuses, reaching Level 10 takes
// roughly 6-8 months of consistent engagement. Feels earned.
// ============================================================

import { createServiceClient } from './supabase';
import { sendPush } from './push/pushService';

// ── Types ───────────────────────────────────────────────────

export type XPReason =
  // Base user
  | 'focused_segment' | 'checkin_response' | 'viewed_guide' | 'rated_outcome'
  // Base partner
  | 'alert_viewed' | 'guide_opened' | 'checkin_confirmed' | 'partner_rated_outcome'
  // Shared
  | 'both_completed_outcome' | 'both_confirmed_checkin'
  // Bonus user
  | 'journal_entry' | 'journal_all_prompts' | 'journal_weekly_streak'
  // Bonus partner
  | 'sent_encouragement' | 'fast_response'
  // Bonus either
  | 'reached_out_first'
  // System
  | 'streak_bonus' | 'level_up_bonus';

interface XPConfig {
  amount: number;
  bonus: boolean;
  description: string;
}

const XP_TABLE: Record<XPReason, XPConfig> = {
  // Base user
  focused_segment:      { amount: 5,  bonus: false, description: 'Focused day segment' },
  checkin_response:     { amount: 5,  bonus: false, description: 'Responded to check-in' },
  viewed_guide:         { amount: 5,  bonus: false, description: 'Viewed conversation guide' },
  rated_outcome:        { amount: 8,  bonus: false, description: 'Rated conversation' },
  // Base partner
  alert_viewed:         { amount: 5,  bonus: false, description: 'Partner viewed alert' },
  guide_opened:         { amount: 5,  bonus: false, description: 'Partner opened guide' },
  checkin_confirmed:    { amount: 5,  bonus: false, description: 'Partner confirmed check-in' },
  partner_rated_outcome:{ amount: 8,  bonus: false, description: 'Partner rated conversation' },
  // Shared
  both_completed_outcome:{ amount: 15, bonus: false, description: 'Both completed conversation' },
  both_confirmed_checkin:{ amount: 10, bonus: false, description: 'Both confirmed check-in' },
  // Bonus user
  journal_entry:        { amount: 8,  bonus: true,  description: 'Wrote a journal entry' },
  journal_all_prompts:  { amount: 5,  bonus: true,  description: 'Filled all 3 Stringer prompts' },
  journal_weekly_streak:{ amount: 15, bonus: true,  description: 'Journaled 3+ days this week' },
  // Bonus partner
  sent_encouragement:   { amount: 10, bonus: true,  description: 'Partner sent encouragement' },
  fast_response:        { amount: 5,  bonus: true,  description: 'Partner responded within 2 hours' },
  // Bonus either
  reached_out_first:    { amount: 8,  bonus: true,  description: 'Reached out first after a flag' },
  // System
  streak_bonus:         { amount: 0,  bonus: true,  description: 'Streak multiplier bonus' },
  level_up_bonus:       { amount: 25, bonus: true,  description: 'Level up!' },
};

export const LEVELS = [
  { level: 1,  xp: 0,     title: 'New Connection',       emoji: '🌱' },
  { level: 2,  xp: 200,   title: 'Getting Started',      emoji: '🤝' },
  { level: 3,  xp: 500,   title: 'Building Trust',       emoji: '🧱' },
  { level: 4,  xp: 900,   title: 'Growing Together',     emoji: '🌿' },
  { level: 5,  xp: 1500,  title: 'Steady Ground',        emoji: '⚓' },
  { level: 6,  xp: 2500,  title: 'Deep Roots',           emoji: '🌳' },
  { level: 7,  xp: 3500,  title: 'Proven Bond',          emoji: '🔗' },
  { level: 8,  xp: 5000,  title: 'Iron Sharpens Iron',   emoji: '⚔️' },
  { level: 9,  xp: 7000,  title: 'Unshakeable',          emoji: '🏔️' },
  { level: 10, xp: 10000, title: 'Covenant',             emoji: '💎' },
];

// ── Core XP award function ──────────────────────────────────

export async function awardRelationshipXP(
  userId: string,
  earnedBy: 'user' | 'partner',
  reason: XPReason,
  metadata?: Record<string, any>
): Promise<{
  awarded: number;
  newXP: number;
  newLevel: number;
  newTitle: string;
  leveledUp: boolean;
  streakMultiplier: number;
} | null> {
  const db = createServiceClient();

  // Find the active partner relationship (safe with 0 or many partners)
  const { data: partner } = await db.from('partners')
    .select('id, relationship_xp, relationship_level, xp_streak_days, user_id, partner_user_id')
    .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!partner) return null;

  const config = XP_TABLE[reason];
  if (!config) return null;

  // Calculate streak multiplier
  const streakMultiplier = getStreakMultiplier(partner.xp_streak_days || 0);
  const baseAmount = config.amount;
  const finalAmount = Math.round(baseAmount * streakMultiplier);

  // Award via RPC
  const { data: result } = await db.rpc('award_relationship_xp', {
    p_partner_id: partner.id,
    p_earned_by: earnedBy,
    p_amount: finalAmount,
    p_reason: reason,
    p_bonus: config.bonus,
    p_metadata: metadata || {},
  });

  const row = result?.[0];
  if (!row) return null;

  // If leveled up, send celebration push to both
  if (row.leveled_up) {
    await celebrateLevelUp(db, partner, row.new_level, row.new_title);

    // Bonus XP for leveling up
    await db.rpc('award_relationship_xp', {
      p_partner_id: partner.id,
      p_earned_by: earnedBy,
      p_amount: 25,
      p_reason: 'level_up_bonus',
      p_bonus: true,
      p_metadata: { reached_level: row.new_level },
    });
  }

  return {
    awarded: finalAmount,
    newXP: row.new_xp,
    newLevel: row.new_level,
    newTitle: row.new_title,
    leveledUp: row.leveled_up,
    streakMultiplier,
  };
}

// ── Streak tracking ─────────────────────────────────────────
// Called daily by the focus-segments cron.
// A "streak day" = both user and partner earned at least 1 XP.

export async function updateRelationshipStreaks() {
  const db = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const { data: partners } = await db.from('partners')
    .select('id, xp_streak_days, longest_xp_streak')
    .eq('status', 'accepted');

  if (!partners) return;

  for (const p of partners) {
    // Check if both sides earned XP yesterday
    const { data: yesterdayXP } = await db.from('relationship_xp')
      .select('earned_by')
      .eq('partner_id', p.id)
      .gte('created_at', yesterday + 'T00:00:00Z')
      .lt('created_at', today + 'T00:00:00Z');

    if (!yesterdayXP) continue;

    const sides = new Set(yesterdayXP.map((x: any) => x.earned_by));
    const bothActive = sides.has('user') && sides.has('partner');

    const newStreak = bothActive ? (p.xp_streak_days || 0) + 1 : 0;
    const longest = Math.max(newStreak, p.longest_xp_streak || 0);

    await db.from('partners').update({
      xp_streak_days: newStreak,
      longest_xp_streak: longest,
    }).eq('id', p.id);

    // Award streak milestone bonuses
    if (bothActive && [3, 7, 14, 30, 60, 90].includes(newStreak)) {
      const bonusAmount = newStreak >= 30 ? 50 : newStreak >= 14 ? 30 : newStreak >= 7 ? 20 : 10;
      await db.rpc('award_relationship_xp', {
        p_partner_id: p.id,
        p_earned_by: 'user',
        p_amount: bonusAmount,
        p_reason: 'streak_bonus',
        p_bonus: true,
        p_metadata: { streak_days: newStreak },
      });
    }
  }
}

function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.8;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.2;
  return 1.0;
}

// ── Level-up celebration ────────────────────────────────────

async function celebrateLevelUp(db: any, partner: any, newLevel: number, newTitle: string) {
  const levelInfo = LEVELS.find((l) => l.level === newLevel);
  if (!levelInfo) return;

  const body = `Your relationship reached Level ${newLevel}: ${levelInfo.emoji} ${newTitle}`;

  // Push to both user and partner
  for (const uid of [partner.user_id, partner.partner_user_id]) {
    if (!uid) continue;
    const { data: tokens } = await db.from('push_tokens').select('token, platform').eq('user_id', uid);
    if (tokens?.length) {
      await Promise.allSettled(
        tokens.map((t: any) => sendPush(t.token, t.platform, {
          title: `${levelInfo.emoji} Level Up!`,
          body,
          data: { type: 'level_up', level: String(newLevel), url: '/dashboard' },
        }))
      );
    }
  }
}

// ── Get relationship status ─────────────────────────────────

export async function getRelationshipStatus(userId: string) {
  const db = createServiceClient();

  const { data: partner } = await db.from('partners')
    .select('id, relationship_xp, relationship_level, level_title, xp_streak_days, longest_xp_streak, partner_name, user_id, partner_user_id')
    .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!partner) return null;

  const currentLevel = LEVELS.find((l) => l.level === partner.relationship_level) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === partner.relationship_level + 1);

  // XP contribution breakdown (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: recentXP } = await db.from('relationship_xp')
    .select('earned_by, amount, bonus, reason, created_at')
    .eq('partner_id', partner.id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false });

  const userXP = (recentXP || []).filter((x: any) => x.earned_by === 'user').reduce((s: number, x: any) => s + x.amount, 0);
  const partnerXP = (recentXP || []).filter((x: any) => x.earned_by === 'partner').reduce((s: number, x: any) => s + x.amount, 0);
  const bonusXP = (recentXP || []).filter((x: any) => x.bonus).reduce((s: number, x: any) => s + x.amount, 0);

  // Recent activity feed (last 10 XP events)
  const recentActivity = (recentXP || []).slice(0, 10).map((x: any) => ({
    earned_by: x.earned_by,
    amount: x.amount,
    reason: x.reason,
    bonus: x.bonus,
    description: XP_TABLE[x.reason as XPReason]?.description || x.reason,
    created_at: x.created_at,
  }));

  const isUser = partner.user_id === userId;

  return {
    partnerId: partner.id,
    partnerName: partner.partner_name,
    totalXP: partner.relationship_xp || 0,
    level: partner.relationship_level || 1,
    levelTitle: partner.level_title || 'New Connection',
    levelEmoji: currentLevel.emoji,
    xpForCurrentLevel: currentLevel.xp,
    xpForNextLevel: nextLevel?.xp || null,
    progressToNext: nextLevel
      ? Math.round(((partner.relationship_xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100)
      : 100,
    streak: partner.xp_streak_days || 0,
    longestStreak: partner.longest_xp_streak || 0,
    streakMultiplier: getStreakMultiplier(partner.xp_streak_days || 0),
    contribution: {
      user: userXP,
      partner: partnerXP,
      bonus: bonusXP,
      balance: userXP + partnerXP > 0
        ? Math.round((Math.min(userXP, partnerXP) / Math.max(userXP, partnerXP)) * 100)
        : 0, // 100% = perfectly balanced
    },
    recentActivity,
    isUser,
    allLevels: LEVELS,
  };
}
