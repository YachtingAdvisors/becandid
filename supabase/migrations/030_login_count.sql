-- ============================================================
-- 030 — Add login_count for walkthrough display control
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;
