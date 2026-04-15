-- ============================================================
-- 066 — Shared Request Controls
--
-- Adds two backend primitives used by the web app:
-- 1. rate_limit_buckets: shared rate limiting across instances
-- 2. request_idempotency: replay-safe ingestion for retries
--
-- Both tables are service-role only. The application keeps
-- an in-memory fallback for local/dev environments where this
-- migration has not been applied yet.
-- ============================================================

BEGIN;

-- ── Shared rate limiting ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key  TEXT PRIMARY KEY,
  scope       TEXT NOT NULL,
  hits        INTEGER NOT NULL DEFAULT 0,
  reset_at    TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_scope_reset
  ON public.rate_limit_buckets(scope, reset_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service manages rate limit buckets" ON public.rate_limit_buckets;
CREATE POLICY "Service manages rate limit buckets"
  ON public.rate_limit_buckets FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket_key TEXT,
  p_scope TEXT,
  p_max_hits INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMPTZ,
  hits INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
BEGIN
  INSERT INTO public.rate_limit_buckets (bucket_key, scope, hits, reset_at, created_at, updated_at)
  VALUES (
    p_bucket_key,
    p_scope,
    1,
    v_now + make_interval(secs => p_window_seconds),
    v_now,
    v_now
  )
  ON CONFLICT (bucket_key) DO UPDATE SET
    scope = EXCLUDED.scope,
    hits = CASE
      WHEN public.rate_limit_buckets.reset_at <= v_now THEN 1
      ELSE public.rate_limit_buckets.hits + 1
    END,
    reset_at = CASE
      WHEN public.rate_limit_buckets.reset_at <= v_now
        THEN v_now + make_interval(secs => p_window_seconds)
      ELSE public.rate_limit_buckets.reset_at
    END,
    updated_at = v_now;

  RETURN QUERY
  SELECT
    (r.hits <= p_max_hits) AS allowed,
    GREATEST(p_max_hits - r.hits, 0) AS remaining,
    r.reset_at,
    r.hits
  FROM public.rate_limit_buckets r
  WHERE r.bucket_key = p_bucket_key;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

-- ── Request idempotency ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.request_idempotency (
  key              TEXT PRIMARY KEY,
  user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scope            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  response_status  INTEGER,
  response_body    JSONB,
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT request_idempotency_status_check
    CHECK (status IN ('pending', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_request_idempotency_scope_expires
  ON public.request_idempotency(scope, expires_at);

ALTER TABLE public.request_idempotency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service manages request idempotency" ON public.request_idempotency;
CREATE POLICY "Service manages request idempotency"
  ON public.request_idempotency FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.cleanup_request_controls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.request_idempotency WHERE expires_at <= now();
  DELETE FROM public.rate_limit_buckets WHERE reset_at <= now();
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_request_controls() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_request_controls() TO service_role;

-- ── Allow authenticated users to manage their own sessions ──
-- This lets routes use the cookie-scoped Supabase client for
-- self-session reads/writes instead of service role access.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_sessions'
      AND policyname = 'Users insert own sessions'
  ) THEN
    CREATE POLICY "Users insert own sessions"
      ON public.user_sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_sessions'
      AND policyname = 'Users update own sessions'
  ) THEN
    CREATE POLICY "Users update own sessions"
      ON public.user_sessions FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

COMMIT;
