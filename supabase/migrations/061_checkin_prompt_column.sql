-- ============================================================
-- Be Candid — Migration 061: Add prompt column to check_ins
--
-- The check-in creation flow generates a contextual prompt via
-- AI (see lib/checkInPrompts.ts) and stores it so the UI can
-- display it. The column was referenced in the API route and
-- the CheckInCard component but was never added to the table,
-- causing every INSERT to fail with "Failed to create check-in".
-- ============================================================

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS prompt TEXT;

COMMENT ON COLUMN public.check_ins.prompt IS
  'AI-generated contextual check-in message shown to the user.';
