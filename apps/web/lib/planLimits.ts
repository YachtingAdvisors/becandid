// ============================================================
// Be Candid — Plan Limits
// Central source of truth for what each plan allows.
// Import and check before gated operations.
// ============================================================

import { SupabaseClient } from '@supabase/supabase-js';

export type Plan = 'free' | 'pro' | 'team';

export interface PlanLimits {
  aiGuidesPerMonth: number;       // -1 = unlimited
  regenerationsPerMonth: number;
  maxPartners: number;
  vulnerabilityWindows: number;
  patternDetection: boolean;
  contextualPrompts: boolean;     // Claude-generated check-in prompts
  weeklyDigest: boolean;
}

const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    aiGuidesPerMonth: 3,
    regenerationsPerMonth: 3,
    maxPartners: 1,
    vulnerabilityWindows: 3,
    patternDetection: false,
    contextualPrompts: false,
    weeklyDigest: true,
  },
  pro: {
    aiGuidesPerMonth: -1,
    regenerationsPerMonth: -1,
    maxPartners: 5,
    vulnerabilityWindows: 10,
    patternDetection: true,
    contextualPrompts: true,
    weeklyDigest: true,
  },
  team: {
    aiGuidesPerMonth: -1,
    regenerationsPerMonth: -1,
    maxPartners: 10,
    vulnerabilityWindows: 20,
    patternDetection: true,
    contextualPrompts: true,
    weeklyDigest: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return LIMITS[plan] ?? LIMITS.free;
}

/**
 * Get the user's effective plan, accounting for expiration.
 */
export async function getUserPlan(db: SupabaseClient, userId: string): Promise<Plan> {
  const { data } = await db
    .from('users')
    .select('plan, plan_expires_at')
    .eq('id', userId)
    .single();

  if (!data) return 'free';

  const plan = (data.plan ?? 'free') as Plan;
  if (plan === 'free') return 'free';

  // Check expiration
  if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) {
    return 'free';
  }

  return plan;
}

/**
 * Check a specific monthly limit against usage count.
 * Returns { allowed, remaining, limit }.
 */
export async function checkMonthlyLimit(
  db: SupabaseClient,
  userId: string,
  table: string,
  column: string,
  limitField: keyof PlanLimits
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const plan = await getUserPlan(db, userId);
  const limits = getPlanLimits(plan);
  const limit = limits[limitField] as number;

  if (limit === -1) return { allowed: true, remaining: -1, limit: -1 };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await db
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte(column, monthStart.toISOString());

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);

  return { allowed: used < limit, remaining, limit };
}
