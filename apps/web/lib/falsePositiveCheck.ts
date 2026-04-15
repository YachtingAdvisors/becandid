// ============================================================
// lib/falsePositiveCheck.ts
//
// Checks if an incoming event matches a false_positive_rule
// for the given user. Used by both alertPipeline and
// contentFilter to suppress previously-contested flags.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

export interface FalsePositiveRule {
  id: string;
  user_id: string;
  match_type: 'app_name' | 'domain' | 'url_hash' | 'category_app';
  match_value: string;
  category: string | null;
}

// ── In-memory cache (TTL: 5 min) ───────────────────────────

const fpCache = new Map<string, { rules: FalsePositiveRule[]; fetchedAt: number }>();
const FP_CACHE_TTL = 5 * 60 * 1000;

async function getUserFPRules(
  db: SupabaseClient,
  userId: string,
): Promise<FalsePositiveRule[]> {
  const cached = fpCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < FP_CACHE_TTL) {
    return cached.rules;
  }

  const { data, error } = await db
    .from('false_positive_rules')
    .select('id, user_id, match_type, match_value, category')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch false positive rules:', error.message);
    return [];
  }

  const rules = (data || []) as FalsePositiveRule[];
  fpCache.set(userId, { rules, fetchedAt: Date.now() });
  return rules;
}

export function invalidateFPCache(userId: string) {
  fpCache.delete(userId);
}

// ── Main check function ─────────────────────────────────────

interface CheckParams {
  appName?: string | null;
  domain?: string | null;
  urlHash?: string | null;
  category?: string | null;
}

/**
 * Checks if any false_positive_rules match the given event params.
 * Returns the matching rule if found, null otherwise.
 */
export async function checkFalsePositiveRules(
  db: SupabaseClient,
  userId: string,
  params: CheckParams,
): Promise<FalsePositiveRule | null> {
  const rules = await getUserFPRules(db, userId);
  if (rules.length === 0) return null;

  const { appName, domain, urlHash, category } = params;

  for (const rule of rules) {
    // Category must match if the rule has one
    if (rule.category && category && rule.category !== category) continue;

    switch (rule.match_type) {
      case 'app_name':
        if (appName && appName.toLowerCase() === rule.match_value) {
          return rule;
        }
        break;

      case 'domain':
        if (domain && domain.toLowerCase() === rule.match_value) {
          return rule;
        }
        break;

      case 'url_hash':
        if (urlHash && urlHash === rule.match_value) {
          return rule;
        }
        break;

      case 'category_app':
        // Combined match: "category:app_name"
        if (appName && category) {
          const combined = `${category}:${appName.toLowerCase()}`;
          if (combined === rule.match_value) {
            return rule;
          }
        }
        break;
    }
  }

  return null;
}
