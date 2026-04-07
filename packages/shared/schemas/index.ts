// ============================================================
// Be Candid — Shared Zod Schemas
// Single source of truth for validation across API routes
// ============================================================

import { z } from 'zod';

export const GoalCategorySchema = z.enum([
  'pornography', 'sexting',
  'social_media', 'binge_watching', 'impulse_shopping',
  'alcohol_drugs', 'vaping_tobacco',
  'eating_disorder', 'body_checking',
  'gambling', 'sports_betting', 'day_trading',
  'dating_apps',
  'gaming',
  'rage_content',
  'custom',
]);

export const SeveritySchema = z.enum(['low', 'medium', 'high']);
export const PlatformSchema = z.enum(['android', 'ios', 'web', 'extension']);
export const RelationshipTypeSchema = z.enum(['friend', 'spouse', 'mentor', 'family', 'coach']);
export const StreakModeSchema = z.enum(['no_failures', 'conversation_required']);
export const OutcomeSchema = z.enum(['positive', 'neutral', 'difficult']);

export const CreateEventSchema = z.object({
  category: GoalCategorySchema,
  severity: SeveritySchema,
  platform: PlatformSchema,
  app_name: z.string().optional(),
  duration_seconds: z.number().int().positive().optional(),
});

export const TrackedSubstanceSchema = z.enum([
  'alcohol', 'beer', 'wine', 'liquor',
  'marijuana', 'cannabis',
  'cocaine', 'opioids', 'heroin', 'fentanyl', 'methamphetamine',
  'prescription_drugs',
  'vaping', 'cigarettes', 'nicotine',
  'kratom', 'psychedelics', 'other',
]);

export const UpdateProfileSchema = z.object({
  name:                z.string().min(1).optional(),
  phone:               z.string().optional(),
  goals:               z.array(GoalCategorySchema).optional(),
  tracked_substances:  z.array(TrackedSubstanceSchema).optional(),
  monitoring_enabled:  z.boolean().optional(),
  nudge_enabled:       z.boolean().optional(),
  check_in_enabled:    z.boolean().optional(),
  check_in_hour:       z.number().int().min(0).max(23).optional(),
  check_in_frequency:  z.enum(['daily', 'every_2_days', 'every_3_days', 'weekly', 'every_2_weeks']).optional(),
  timezone:            z.string().optional(),
  streak_mode:         StreakModeSchema.optional(),
  relationship_type:   RelationshipTypeSchema.optional(),
  foundational_motivator: z.string().optional(),
});

export const OnboardingSchema = z.object({
  name: z.string().min(1),
  goals: z.array(GoalCategorySchema).min(1),
  partner_email: z.string().email(),
  partner_name: z.string().min(1),
  partner_phone: z.string().optional(),
  relationship_type: RelationshipTypeSchema,
  streak_mode: StreakModeSchema.optional(),
});
