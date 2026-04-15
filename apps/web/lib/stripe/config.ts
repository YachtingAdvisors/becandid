// ============================================================
// lib/stripe/config.ts
//
// Central Stripe configuration. Products, prices, plan limits,
// and feature gates. Update the STRIPE_* IDs after creating
// products in the Stripe Dashboard.
// ============================================================

function requireEnv(name: string, prefix: string): string {
  const value = process.env[name];
  if (!value) {
    // Don't throw at build time — the value is only needed at request time.
    // Covers: local dev, beta mode, Next.js production build phase, and CI.
    const isBuildTime =
      process.env.NEXT_PUBLIC_BETA_MODE === 'true' ||
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.CI === 'true';
    if (isBuildTime) {
      console.warn(`[Stripe] Missing env var ${name} — billing features disabled until configured.`);
      return `${prefix}_NOT_CONFIGURED`;
    }
    throw new Error(`Missing required environment variable: ${name}. Set it in .env.local or your hosting provider.`);
  }
  return value;
}

export const STRIPE_CONFIG = {
  // Create these in Stripe Dashboard → Products
  // Then set the corresponding env vars
  products: {
    pro: requireEnv('STRIPE_PRODUCT_PRO', 'prod'),
    therapy: requireEnv('STRIPE_PRODUCT_THERAPY', 'prod'),
  },
  prices: {
    pro_monthly: requireEnv('STRIPE_PRICE_PRO_MONTHLY', 'price'),
    pro_annual: requireEnv('STRIPE_PRICE_PRO_ANNUAL', 'price'),
    therapy_monthly: requireEnv('STRIPE_PRICE_THERAPY_MONTHLY', 'price'),
    therapy_annual: requireEnv('STRIPE_PRICE_THERAPY_ANNUAL', 'price'),
  },
  trialDays: 21,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;

// ── Plan limits ─────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'therapy';

export interface PlanLimits {
  aiGuidesPerMonth: number;
  maxPartners: number;
  journalReminders: boolean;
  weeklyReflection: boolean;
  vulnerabilityWindows: boolean;
  patternDetection: boolean;
  conversationOutcomes: boolean;
  therapistPortal: boolean;
  dataRetentionDays: number;
  dataExportJson: boolean;
  spouseExperience: boolean;
  relationshipLevels: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    aiGuidesPerMonth: 3,
    maxPartners: 2,
    journalReminders: false,
    weeklyReflection: false,
    vulnerabilityWindows: false,
    patternDetection: false,
    conversationOutcomes: false,
    therapistPortal: false,
    dataRetentionDays: 90,
    dataExportJson: false,
    spouseExperience: false,
    relationshipLevels: true, // Free — keeps them engaged
  },
  pro: {
    aiGuidesPerMonth: Infinity,
    maxPartners: 5,
    journalReminders: true,
    weeklyReflection: true,
    vulnerabilityWindows: true,
    patternDetection: true,
    conversationOutcomes: true,
    therapistPortal: false,
    dataRetentionDays: 365,
    dataExportJson: true,
    spouseExperience: true,
    relationshipLevels: true,
  },
  therapy: {
    aiGuidesPerMonth: Infinity,
    maxPartners: Number.MAX_SAFE_INTEGER,
    journalReminders: true,
    weeklyReflection: true,
    vulnerabilityWindows: true,
    patternDetection: true,
    conversationOutcomes: true,
    therapistPortal: true,
    dataRetentionDays: 365,
    dataExportJson: true,
    spouseExperience: true,
    relationshipLevels: true,
  },
};

// ── Map Stripe price to plan ────────────────────────────────

export function priceIdToPlan(priceId: string): PlanId {
  const { prices } = STRIPE_CONFIG;
  if (priceId === prices.pro_monthly || priceId === prices.pro_annual) return 'pro';
  if (priceId === prices.therapy_monthly || priceId === prices.therapy_annual) return 'therapy';
  return 'free';
}

// ── Feature gate helper ─────────────────────────────────────
// Usage: const limits = getPlanLimits(user.subscription_plan);
//        if (!limits.therapistPortal) return 403;

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const p = (plan || 'free') as PlanId;
  return PLAN_LIMITS[p] || PLAN_LIMITS.free;
}
