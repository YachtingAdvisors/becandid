import { createServiceClient } from '@/lib/supabase';
import { rateLimitResponse } from '@/lib/rateLimit';

type RateLimitConfig = {
  scope: string;
  key: string;
  max: number;
  windowMs: number;
};

const FALLBACK_STORE = new Map<string, { hits: number; resetAt: number }>();

function consumeFallback({ scope, key, max, windowMs }: RateLimitConfig) {
  const bucketKey = `${scope}:${key}`;
  const now = Date.now();
  const existing = FALLBACK_STORE.get(bucketKey);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    FALLBACK_STORE.set(bucketKey, { hits: 1, resetAt });
    return { allowed: true, resetAt };
  }

  existing.hits += 1;
  return { allowed: existing.hits <= max, resetAt: existing.resetAt };
}

export async function checkDistributedRateLimit(config: RateLimitConfig): Promise<Response | null> {
  try {
    const db = createServiceClient();
    const { data, error } = await db.rpc('consume_rate_limit', {
      p_bucket_key: `${config.scope}:${config.key}`,
      p_scope: config.scope,
      p_max_hits: config.max,
      p_window_seconds: Math.ceil(config.windowMs / 1000),
    });

    if (!error && Array.isArray(data) && data[0]) {
      const result = data[0] as { allowed: boolean; reset_at?: string };
      if (result.allowed) return null;

      const retryAfterSeconds = result.reset_at
        ? Math.max(1, Math.ceil((new Date(result.reset_at).getTime() - Date.now()) / 1000))
        : Math.ceil(config.windowMs / 1000);

      return rateLimitResponse(retryAfterSeconds);
    }
  } catch {
    // Fall back to local memory below.
  }

  const fallback = consumeFallback(config);
  if (fallback.allowed) return null;

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((fallback.resetAt - Date.now()) / 1000),
  );
  return rateLimitResponse(retryAfterSeconds);
}
