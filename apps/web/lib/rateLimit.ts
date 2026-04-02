// ============================================================
// Be Candid — Rate Limiter
// Sliding window counters for per-user and per-IP rate limiting.
// In-memory for single instance — swap for Upstash Redis in prod.
// ============================================================

const STORE = new Map<string, { count: number; resetAt: number }>();
const MAX_ENTRIES = 10000;

// Clean stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of STORE) {
    if (now > val.resetAt) STORE.delete(key);
  }

  // Evict oldest entries if map still exceeds limit
  if (STORE.size > MAX_ENTRIES) {
    const sorted = [...STORE.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toRemove = sorted.slice(0, STORE.size - MAX_ENTRIES);
    for (const [key] of toRemove) {
      STORE.delete(key);
    }
  }
}, 300_000);

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

function createLimiter(config: RateLimitConfig) {
  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = STORE.get(key);

      if (!entry || now > entry.resetAt) {
        STORE.set(key, { count: 1, resetAt: now + config.windowMs });
        return true;
      }

      if (entry.count >= config.max) return false;
      entry.count++;
      return true;
    },

    remaining(key: string): number {
      const entry = STORE.get(key);
      if (!entry || Date.now() > entry.resetAt) return config.max;
      return Math.max(0, config.max - entry.count);
    },
  };
}

// ─── Pre-configured limiters ──────────────────────────────────

// Per-user: event reporting (30/min — mobile may fire quickly)
export const eventLimiter = createLimiter({ windowMs: 60_000, max: 30 });

// Per-user: AI guide generation (20/hour — Claude API is expensive)
export const aiGuideLimiter = createLimiter({ windowMs: 3_600_000, max: 20 });

// Per-user: auth attempts (10/15min)
export const authLimiter = createLimiter({ windowMs: 900_000, max: 10 });

// Per-user: conversations/check-in confirmations (30/hour)
export const actionLimiter = createLimiter({ windowMs: 3_600_000, max: 30 });

// Per-user: account export/delete (3/hour)
export const accountLimiter = createLimiter({ windowMs: 3_600_000, max: 3 });

// Per-IP: global (used in middleware — 120/min)
export const ipRateLimit = createLimiter({ windowMs: 60_000, max: 120 });

// ─── Helpers ──────────────────────────────────────────────────

export function rateLimitResponse(retryAfterSeconds = 60) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}

/**
 * Check rate limit and return 429 response if exceeded.
 * Usage: const blocked = checkUserRate(eventLimiter, userId); if (blocked) return blocked;
 */
export function checkUserRate(
  limiter: ReturnType<typeof createLimiter>,
  userId: string
): Response | null {
  if (!limiter.check(userId)) return rateLimitResponse();
  return null;
}
