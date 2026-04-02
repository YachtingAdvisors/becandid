// ============================================================
// lib/stripe/config.ts
//
// Central Stripe configuration. Products, prices, plan limits,
// and feature gates. Update the STRIPE_* IDs after creating
// products in the Stripe Dashboard.
// ============================================================

export const STRIPE_CONFIG = {
  // Create these in Stripe Dashboard → Products
  // Then paste the IDs here
  products: {
    pro: process.env.STRIPE_PRODUCT_PRO || 'prod_REPLACE_ME',
    therapy: process.env.STRIPE_PRODUCT_THERAPY || 'prod_REPLACE_ME',
  },
  prices: {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_REPLACE_ME',
    pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_REPLACE_ME',
    therapy_monthly: process.env.STRIPE_PRICE_THERAPY_MONTHLY || 'price_REPLACE_ME',
    therapy_annual: process.env.STRIPE_PRICE_THERAPY_ANNUAL || 'price_REPLACE_ME',
  },
  trialDays: 14,
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
    maxPartners: 1,
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
    maxPartners: 5,
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
