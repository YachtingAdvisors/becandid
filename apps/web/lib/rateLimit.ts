// ============================================================
// Be Candid — Rate Limiter
// Distributed sliding-window rate limiting via Upstash Redis.
// Falls back to in-memory when UPSTASH_REDIS_REST_URL is not set
// (local dev / CI).
// ============================================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── Upstash Redis client (singleton) ────────────────────────

const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = useUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// ─── In-memory fallback (local dev / tests) ─────────────────

const STORE = new Map<string, { count: number; resetAt: number }>();
const MAX_ENTRIES = 10_000;

// Clean stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of STORE) {
      if (now > val.resetAt) STORE.delete(key);
    }
    if (STORE.size > MAX_ENTRIES) {
      const sorted = [...STORE.entries()].sort(
        (a, b) => a[1].resetAt - b[1].resetAt,
      );
      const toRemove = sorted.slice(0, STORE.size - MAX_ENTRIES);
      for (const [key] of toRemove) STORE.delete(key);
    }
  }, 300_000);
}

// ─── Limiter factory ─────────────────────────────────────────

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

function msToUpstashWindow(ms: number): `${number} s` | `${number} m` | `${number} h` {
  if (ms % 3_600_000 === 0) return `${ms / 3_600_000} h` as `${number} h`;
  if (ms % 60_000 === 0) return `${ms / 60_000} m` as `${number} m`;
  return `${Math.ceil(ms / 1000)} s` as `${number} s`;
}

function createLimiter(config: RateLimitConfig) {
  const prefix = `rl:${config.max}:${config.windowMs}`;

  // Upstash sliding-window limiter for this config bucket
  const upstashLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.max, msToUpstashWindow(config.windowMs)),
        prefix,
        analytics: false,
      })
    : undefined;

  return {
    /** Synchronous check against in-memory store (local dev / legacy). */
    check(key: string): boolean {
      const now = Date.now();
      const entry = STORE.get(`${prefix}:${key}`);

      if (!entry || now > entry.resetAt) {
        STORE.set(`${prefix}:${key}`, { count: 1, resetAt: now + config.windowMs });
        return true;
      }

      if (entry.count >= config.max) return false;
      entry.count++;
      return true;
    },

    /** Remaining calls in the current window (in-memory). */
    remaining(key: string): number {
      const entry = STORE.get(`${prefix}:${key}`);
      if (!entry || Date.now() > entry.resetAt) return config.max;
      return Math.max(0, config.max - entry.count);
    },

    /**
     * Async check against Upstash (falls back to in-memory).
     * Returns a 429 Response if limit exceeded, or null if allowed.
     */
    async consume(key: string): Promise<Response | null> {
      if (upstashLimiter) {
        try {
          const result = await upstashLimiter.limit(key);
          if (!result.success) {
            const retryAfter = Math.max(
              1,
              Math.ceil((result.reset - Date.now()) / 1000),
            );
            return rateLimitResponse(retryAfter);
          }
          return null;
        } catch {
          // Upstash unreachable — fall through to in-memory
        }
      }

      // In-memory fallback
      if (!this.check(key)) return rateLimitResponse();
      return null;
    },
  };
}

// ─── Pre-configured limiters ─────────────────────────────────

/** Per-user: event reporting (30/min — mobile may fire quickly) */
export const eventLimiter = createLimiter({ windowMs: 60_000, max: 30 });

/** Per-user: AI guide generation (20/hour — Claude API is expensive) */
export const aiGuideLimiter = createLimiter({ windowMs: 3_600_000, max: 20 });

/** Per-user: auth attempts (10/15min) */
export const authLimiter = createLimiter({ windowMs: 900_000, max: 10 });

/** Per-user: conversations/check-in confirmations (30/hour) */
export const actionLimiter = createLimiter({ windowMs: 3_600_000, max: 30 });

/** Per-user: account export/delete (3/hour) */
export const accountLimiter = createLimiter({ windowMs: 3_600_000, max: 3 });

/** Per-user: admin panel browsing (60/hour — admins switch tabs frequently) */
export const adminLimiter = createLimiter({ windowMs: 3_600_000, max: 60 });

/** Per-IP: global (used in middleware — 120/min) */
export const ipRateLimit = createLimiter({ windowMs: 60_000, max: 120 });

// ─── Helpers ─────────────────────────────────────────────────

export function rateLimitResponse(retryAfterSeconds = 60) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}

/**
 * Check rate limit and return 429 response if exceeded.
 *
 * In production (Upstash available) this performs an async distributed check.
 * In local dev it falls back to the synchronous in-memory store.
 *
 * Usage:
 *   const blocked = await checkUserRate(eventLimiter, userId);
 *   if (blocked) return blocked;
 */
export async function checkUserRate(
  limiter: ReturnType<typeof createLimiter>,
  userId: string,
): Promise<Response | null> {
  return limiter.consume(userId);
}
