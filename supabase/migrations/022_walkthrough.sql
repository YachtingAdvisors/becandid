-- ─── First-Time Dashboard Walkthrough ──────────────────────────
-- Adds columns to track walkthrough state for new users.
-- walkthrough_dismissed_at: NULL = show walkthrough, non-NULL = hidden
-- walkthrough_progress: JSONB tracking which steps are completed

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS walkthrough_dismissed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS walkthrough_progress JSONB DEFAULT '{}'::jsonb;

-- Backfill: existing users should NOT see the walkthrough
UPDATE public.users
  SET walkthrough_dismissed_at = NOW()
  WHERE walkthrough_dismissed_at IS NULL;
