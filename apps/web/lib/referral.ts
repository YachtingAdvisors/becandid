// ============================================================
// Referral Program Utilities
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Generate a unique 8-character referral code (hex).
 * 4 billion combinations — more than enough for early-stage.
 */
export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Apply referral reward: extend both users' plan_expires_at by 30 days.
 * Returns true if reward was granted, false if already applied.
 */
export async function applyReferralReward(
  db: SupabaseClient,
  referrerId: string,
  referredId: string,
  code: string,
): Promise<boolean> {
  // Check if already rewarded
  const { data: existing } = await db
    .from('referrals')
    .select('id')
    .eq('referred_id', referredId)
    .maybeSingle();

  if (existing) return false;

  const now = new Date();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // Extend plan_expires_at for both users
  for (const userId of [referrerId, referredId]) {
    const { data: user } = await db
      .from('users')
      .select('plan_expires_at')
      .eq('id', userId)
      .single();

    const currentExpiry = user?.plan_expires_at ? new Date(user.plan_expires_at) : now;
    const base = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(base.getTime() + thirtyDaysMs);

    await db
      .from('users')
      .update({ plan_expires_at: newExpiry.toISOString() })
      .eq('id', userId);
  }

  // Record the referral
  await db.from('referrals').insert({
    referrer_id: referrerId,
    referred_id: referredId,
    referral_code: code,
    reward_granted: true,
    reward_days: 30,
  });

  return true;
}

/**
 * Get referral stats for a user's dashboard.
 */
export async function getReferralStats(db: SupabaseClient, userId: string) {
  const { data: user } = await db
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();

  const { data: referrals } = await db
    .from('referrals')
    .select('referred_id, reward_days, reward_granted, created_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  const referralList = referrals ?? [];

  // Get first names of referred users
  const referredIds = referralList.map(r => r.referred_id);
  let referredUsers: Array<{ name: string; date: string }> = [];

  if (referredIds.length > 0) {
    const { data: users } = await db
      .from('users')
      .select('id, name')
      .in('id', referredIds);

    referredUsers = referralList.map(r => {
      const u = users?.find((u: any) => u.id === r.referred_id);
      return {
        name: u?.name?.split(' ')[0] ?? 'Friend',
        date: r.created_at,
      };
    });
  }

  return {
    referralCode: user?.referral_code ?? null,
    referralCount: referralList.length,
    totalDaysEarned: referralList
      .filter(r => r.reward_granted)
      .reduce((sum, r) => sum + (r.reward_days ?? 0), 0),
    referredUsers,
  };
}
