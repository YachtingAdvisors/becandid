export const ADMIN_SUBSCRIPTION_PLANS = ['free', 'pro', 'therapy'] as const;
export const ADMIN_SUBSCRIPTION_STATUSES = ['active', 'past_due', 'canceled', 'trialing'] as const;
export const ADMIN_AUDIENCES = ['all', 'pro', 'therapy', 'free', 'trialing'] as const;

export type AdminSubscriptionPlan = typeof ADMIN_SUBSCRIPTION_PLANS[number];
export type AdminSubscriptionStatus = typeof ADMIN_SUBSCRIPTION_STATUSES[number];
export type AdminAudience = typeof ADMIN_AUDIENCES[number];

type AdminUserUpdate = {
  subscription_plan?: AdminSubscriptionPlan;
  subscription_status?: AdminSubscriptionStatus;
  trial_ends_at?: string | null;
  monitoring_enabled?: boolean;
};

const PLAN_SET = new Set<string>(ADMIN_SUBSCRIPTION_PLANS);
const STATUS_SET = new Set<string>(ADMIN_SUBSCRIPTION_STATUSES);
const AUDIENCE_SET = new Set<string>(ADMIN_AUDIENCES);

export function isAdminAudience(value: string): value is AdminAudience {
  return AUDIENCE_SET.has(value);
}

export function getAudienceQueryConfig(audience: AdminAudience) {
  switch (audience) {
    case 'trialing':
      return { status: 'trialing' as const };
    case 'free':
      return { includeNullPlan: true as const };
    case 'pro':
    case 'therapy':
      return { plan: audience };
    default:
      return {};
  }
}

export function normalizeAdminUserUpdate(input: Record<string, unknown>) {
  const update: AdminUserUpdate = {};

  if ('subscription_plan' in input) {
    const plan = input.subscription_plan;
    if (typeof plan !== 'string' || !PLAN_SET.has(plan)) {
      return { error: 'Invalid subscription_plan' as const };
    }
    update.subscription_plan = plan as AdminSubscriptionPlan;
  }

  const hadExplicitStatus = 'subscription_status' in input;
  if (hadExplicitStatus) {
    const status = input.subscription_status;
    if (typeof status !== 'string' || !STATUS_SET.has(status)) {
      return { error: 'Invalid subscription_status' as const };
    }
    update.subscription_status = status as AdminSubscriptionStatus;
  }

  if ('trial_ends_at' in input) {
    const trialEndsAt = input.trial_ends_at;
    if (trialEndsAt == null || trialEndsAt === '') {
      update.trial_ends_at = null;
    } else if (typeof trialEndsAt === 'string') {
      const parsed = new Date(trialEndsAt);
      if (Number.isNaN(parsed.getTime())) {
        return { error: 'Invalid trial_ends_at' as const };
      }
      update.trial_ends_at = parsed.toISOString();
    } else {
      return { error: 'Invalid trial_ends_at' as const };
    }
  }

  if ('monitoring_enabled' in input) {
    const monitoringEnabled = input.monitoring_enabled;
    if (typeof monitoringEnabled !== 'boolean') {
      return { error: 'Invalid monitoring_enabled' as const };
    }
    update.monitoring_enabled = monitoringEnabled;
  }

  if (update.subscription_plan && !hadExplicitStatus) {
    update.subscription_status = 'active';
  }

  if (update.subscription_status && update.subscription_status !== 'trialing' && !('trial_ends_at' in input)) {
    update.trial_ends_at = null;
  }

  return { update };
}

export function readAuditMetadata(log: { metadata?: unknown; details?: unknown }) {
  const raw = log.metadata ?? log.details;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') {
    return raw as Record<string, unknown>;
  }
  return {};
}
