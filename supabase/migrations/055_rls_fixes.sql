-- ============================================================
-- 055_rls_fixes.sql — Fix missing RLS on coaching_content
--
-- coaching_content (046) was created without ENABLE ROW LEVEL
-- SECURITY. This table holds pre-generated coaching responses
-- and should be service-role only for writes, with an optional
-- authenticated SELECT so the app can read without elevated
-- privileges.
-- ============================================================

-- Enable RLS (currently missing)
ALTER TABLE public.coaching_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read coaching content
-- (the app needs to query this table for coach responses)
CREATE POLICY "Authenticated users can read coaching content"
  ON public.coaching_content
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE policies — only service role can modify
