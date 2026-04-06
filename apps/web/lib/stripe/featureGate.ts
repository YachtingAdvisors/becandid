// ============================================================
// lib/stripe/featureGate.ts
//
// Server-side feature gating. Call from API routes and
// server components to check if the user's plan allows
// the requested feature.
//
// Usage in API routes:
//   const gate = await checkFeatureGate(userId, 'therapistPortal');
//   if (!gate.allowed) return NextResponse.json(
//     { error: gate.reason, upgrade_to: gate.requiredPlan },
//     { status: 403 }
//   );
//
// Usage for AI guide rate limiting:
//   const gate = await checkAIGuideLimit(userId);
//   if (!gate.allowed) return NextResponse.json(
//     { error: gate.reason, used: gate.used, limit: gate.limit },
//     { status: 429 }
//   );
// ============================================================

import { createServiceClient } from '@/lib/supabase';
import { getPlanLimits, PlanId, PlanLimits } from './config';

type FeatureKey = keyof Omit<PlanLimits, 'aiGuidesPerMonth' | 'maxPartners' | 'dataRetentionDays'>;

interface GateResult {
  allowed: boolean;
  plan: PlanId;
  reason?: string;
  requiredPlan?: PlanId;
}

export async function checkFeatureGate(userId: string, feature: FeatureKey): Promise<GateResult> {
  const db = createServiceClient();
  const { data: user } = await db.from('users')
    .select('subscription_plan, subscription_status, grandfathered')
    .eq('id', userId)
    .single();

  // Grandfathered users get full access to everything
  if (user?.grandfathered) {
    return { allowed: true, plan: 'therapy' as PlanId };
  }

  const plan = (user?.subscription_plan || 'free') as PlanId;
  const status = user?.subscription_status || 'active';

  // Past due users keep access for grace period
  if (status === 'canceled') {
    return { allowed: false, plan: 'free', reason: 'Subscription canceled', requiredPlan: 'pro' };
  }

  const limits = getPlanLimits(plan);
  const allowed = limits[feature] as boolean;

  if (!allowed) {
    // Find which plan unlocks this feature
    const requiredPlan: PlanId = feature === 'therapistPortal' ? 'therapy' : 'pro';
    return {
      allowed: false,
      plan,
      reason: `${feature} requires the ${requiredPlan} plan`,
      requiredPlan,
    };
  }

  return { allowed: true, plan };
}

// ── AI guide rate limiter ───────────────────────────────────

export async function checkAIGuideLimit(userId: string): Promise<GateResult & { used?: number; limit?: number }> {
  const db = createServiceClient();
  const { data: user } = await db.from('users')
    .select('subscription_plan, grandfathered')
    .eq('id', userId)
    .single();

  // Grandfathered users get unlimited
  if (user?.grandfathered) {
    return { allowed: true, plan: 'therapy' as PlanId };
  }

  const plan = (user?.subscription_plan || 'free') as PlanId;
  const limits = getPlanLimits(plan);

  if (limits.aiGuidesPerMonth === Infinity) {
    return { allowed: true, plan };
  }

  // Count guides this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await db.from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())
    .not('user_guide', 'is', null);

  const used = count ?? 0;

  if (used >= limits.aiGuidesPerMonth) {
    return {
      allowed: false,
      plan,
      reason: `You've used ${used}/${limits.aiGuidesPerMonth} AI guides this month. Upgrade to Pro for unlimited.`,
      requiredPlan: 'pro',
      used,
      limit: limits.aiGuidesPerMonth,
    };
  }

  return { allowed: true, plan, used, limit: limits.aiGuidesPerMonth };
}

// ── Partner limit checker ───────────────────────────────────

export async function checkPartnerLimit(userId: string): Promise<GateResult & { count?: number; limit?: number }> {
  const db = createServiceClient();
  const { data: user } = await db.from('users')
    .select('subscription_plan, grandfathered')
    .eq('id', userId)
    .single();

  // Grandfathered users get unlimited partners
  if (user?.grandfathered) {
    return { allowed: true, plan: 'therapy' as PlanId };
  }

  const plan = (user?.subscription_plan || 'free') as PlanId;
  const limits = getPlanLimits(plan);

  const { count } = await db.from('partners')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['accepted', 'pending']);

  const partnerCount = count ?? 0;

  if (partnerCount >= limits.maxPartners) {
    return {
      allowed: false,
      plan,
      reason: plan === 'pro'
        ? `Pro plan allows ${limits.maxPartners} partners. Upgrade to Therapy for unlimited.`
        : `Free plan allows ${limits.maxPartners} partner. Upgrade to Pro for up to 5.`,
      requiredPlan: plan === 'pro' ? 'therapy' : 'pro',
      count: partnerCount,
      limit: limits.maxPartners,
    };
  }

  return { allowed: true, plan, count: partnerCount, limit: limits.maxPartners };
}
