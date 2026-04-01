-- ============================================================
-- 031 — Category time limits & event contest system
-- ============================================================

-- ── Per-category daily time limits ──────────────────────────
CREATE TABLE IF NOT EXISTS public.category_time_limits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category                TEXT NOT NULL,
  daily_limit_minutes     INTEGER NOT NULL DEFAULT 60,
  warning_minutes         INTEGER NOT NULL DEFAULT 5,
  sequential_limit_minutes INTEGER,
  enabled                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_category_time_limits_user ON public.category_time_limits(user_id);

ALTER TABLE public.category_time_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own limits"
  ON public.category_time_limits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service manages limits"
  ON public.category_time_limits FOR ALL
  USING (true) WITH CHECK (true);

-- ── Contest columns on events ───────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS contested BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contest_reason TEXT,
  ADD COLUMN IF NOT EXISTS contest_reviewed BOOLEAN NOT NULL DEFAULT FALSE;
