// ============================================================
// lib/featureFlags.ts
//
// Simple feature flag lookup with 60-second in-memory cache.
// Usage:
//   const enabled = await isFeatureEnabled(db, 'coach_enabled');
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function isFeatureEnabled(
  db: SupabaseClient,
  key: string,
): Promise<boolean> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const { data, error } = await db
    .from('feature_flags')
    .select('enabled')
    .eq('key', key)
    .single();

  if (error || !data) {
    // Default to disabled if flag not found
    return false;
  }

  const enabled = data.enabled === true;
  cache.set(key, { value: enabled, expiresAt: now + CACHE_TTL_MS });

  return enabled;
}

/**
 * Invalidate a cached flag (e.g. after admin toggle).
 */
export function invalidateFlag(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cached flags.
 */
export function clearFlagCache(): void {
  cache.clear();
}
