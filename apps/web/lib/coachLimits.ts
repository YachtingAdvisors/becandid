// ============================================================
// lib/coachLimits.ts — Coach Session Limits by Plan
//
// Enforces monthly session caps for the Conversation Coach
// based on the user's subscription plan.
//
// A "session" is counted as a distinct calendar day (UTC)
// on which the user sent at least one coach message.
// We approximate this by counting distinct days with coach
// API audit log entries.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

const COACH_LIMITS: Record<string, { sessions_per_month: number; messages_per_session: number }> = {
  free:    { sessions_per_month: 3,  messages_per_session: 15 },
  pro:     { sessions_per_month: -1, messages_per_session: 30 },
  therapy: { sessions_per_month: -1, messages_per_session: 50 },
};

export interface CoachLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: string;
}

export async function checkCoachLimit(
  db: SupabaseClient,
  userId: string,
): Promise<CoachLimitResult> {
  // BETA: unlimited for everyone
  const BETA_MODE = true;
  if (BETA_MODE) return { allowed: true, remaining: -1, limit: -1, plan: 'beta' };

  // Get user plan + grandfathered status
  const { data: user } = await db
    .from('users')
    .select('subscription_plan, grandfathered')
    .eq('id', userId)
    .single();

  // Grandfathered users get unlimited access
  if (user?.grandfathered) {
    return { allowed: true, remaining: -1, limit: -1, plan: 'grandfathered' };
  }

  const plan = user?.subscription_plan || 'free';
  const limits = COACH_LIMITS[plan] || COACH_LIMITS.free;

  // Unlimited plans bypass counting
  if (limits.sessions_per_month === -1) {
    return { allowed: true, remaining: -1, limit: -1, plan };
  }

  // Count distinct days the user used the coach this month
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data: auditRows } = await db
    .from('audit_log')
    .select('created_at')
    .eq('user_id', userId)
    .eq('action', 'coach_session')
    .gte('created_at', monthStart.toISOString());

  const distinctDays = new Set(
    (auditRows ?? []).map((row: { created_at: string }) =>
      new Date(row.created_at).toISOString().slice(0, 10)
    )
  );

  const used = distinctDays.size;
  const remaining = Math.max(0, limits.sessions_per_month - used);

  return {
    allowed: used < limits.sessions_per_month,
    remaining,
    limit: limits.sessions_per_month,
    plan,
  };
}

export function getMessagesPerSession(plan: string): number {
  return (COACH_LIMITS[plan] || COACH_LIMITS.free).messages_per_session;
}
