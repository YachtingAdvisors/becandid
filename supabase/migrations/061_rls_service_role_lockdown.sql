-- ============================================================
-- Migration 061: Critical RLS Lockdown
--
-- Problem: Many "Service *" RLS policies use USING (TRUE) /
-- WITH CHECK (TRUE) with no role guard. This means ANY
-- authenticated user can bypass row-level restrictions and
-- mutate any row in those tables. The intent was to allow
-- only the Supabase service_role key (used by Edge Functions
-- and server-side calls), but the policies are missing the
-- auth.role() = 'service_role' check.
--
-- Additionally, three tables were created without enabling
-- RLS at all: crisis_keywords, indexing_submissions, seo_content.
--
-- Fix: DROP each permissive policy and re-CREATE it with an
-- explicit service_role guard. Enable RLS on unprotected tables.
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. FIX POLICIES FROM 001_base_tables.sql
-- ────────────────────────────────────────────────────────────

-- users
DROP POLICY IF EXISTS "Service manages users" ON public.users;
CREATE POLICY "Service manages users" ON public.users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- events
DROP POLICY IF EXISTS "Service inserts events" ON public.events;
CREATE POLICY "Service inserts events" ON public.events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service deletes events" ON public.events;
CREATE POLICY "Service deletes events" ON public.events FOR DELETE
  USING (auth.role() = 'service_role');

-- alerts
DROP POLICY IF EXISTS "Service inserts alerts" ON public.alerts;
CREATE POLICY "Service inserts alerts" ON public.alerts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service updates alerts" ON public.alerts;
CREATE POLICY "Service updates alerts" ON public.alerts FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service deletes alerts" ON public.alerts;
CREATE POLICY "Service deletes alerts" ON public.alerts FOR DELETE
  USING (auth.role() = 'service_role');

-- partners
DROP POLICY IF EXISTS "Service inserts partners" ON public.partners;
CREATE POLICY "Service inserts partners" ON public.partners FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service updates partners" ON public.partners;
CREATE POLICY "Service updates partners" ON public.partners FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service deletes partners" ON public.partners;
CREATE POLICY "Service deletes partners" ON public.partners FOR DELETE
  USING (auth.role() = 'service_role');

-- conversations
DROP POLICY IF EXISTS "Service manages conversations" ON public.conversations;
CREATE POLICY "Service manages conversations" ON public.conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- check_ins
DROP POLICY IF EXISTS "Service inserts check-ins" ON public.check_ins;
CREATE POLICY "Service inserts check-ins" ON public.check_ins FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- push_tokens
DROP POLICY IF EXISTS "Service manages push tokens" ON public.push_tokens;
CREATE POLICY "Service manages push tokens" ON public.push_tokens FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 2. FIX POLICIES FROM 005_trust_points.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service inserts focus segments" ON public.focus_segments;
CREATE POLICY "Service inserts focus segments" ON public.focus_segments FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service updates focus segments" ON public.focus_segments;
CREATE POLICY "Service updates focus segments" ON public.focus_segments FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service inserts trust points" ON public.trust_points;
CREATE POLICY "Service inserts trust points" ON public.trust_points FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service inserts milestones" ON public.milestones;
CREATE POLICY "Service inserts milestones" ON public.milestones FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 3. FIX POLICIES FROM 009_vuln_windows_encouragements.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Partners insert encouragements" ON public.encouragements;
CREATE POLICY "Partners insert encouragements" ON public.encouragements FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 4. FIX POLICIES FROM 010_audit_log.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service inserts audit log" ON public.audit_log;
CREATE POLICY "Service inserts audit log" ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 5. FIX POLICIES FROM 011_improvements.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service inserts sessions" ON public.user_sessions;
CREATE POLICY "Service inserts sessions" ON public.user_sessions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service updates sessions" ON public.user_sessions;
CREATE POLICY "Service updates sessions" ON public.user_sessions FOR UPDATE
  USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 6. FIX POLICIES FROM 020_content_filtering.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service inserts filter log" ON public.content_filter_log;
CREATE POLICY "Service inserts filter log" ON public.content_filter_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 7. FIX POLICIES FROM 021_teen_mode.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages guardians" ON public.guardians;
CREATE POLICY "Service manages guardians" ON public.guardians FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service manages screen time rules" ON public.screen_time_rules;
CREATE POLICY "Service manages screen time rules" ON public.screen_time_rules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service manages usage" ON public.screen_time_usage;
CREATE POLICY "Service manages usage" ON public.screen_time_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 8. FIX POLICIES FROM 026_fasting.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages fasts" ON public.fasts;
CREATE POLICY "Service manages fasts" ON public.fasts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 9. FIX POLICIES FROM 027_quote_favorites.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages favorites" ON public.quote_favorites;
CREATE POLICY "Service manages favorites" ON public.quote_favorites FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 10. FIX POLICIES FROM 028_referral_program.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages referrals" ON public.referrals;
CREATE POLICY "Service manages referrals" ON public.referrals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 11. FIX POLICIES FROM 031_category_time_limits.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages limits" ON public.category_time_limits;
CREATE POLICY "Service manages limits" ON public.category_time_limits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 12. FIX POLICIES FROM 032_site_lists.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages lists" ON public.site_lists;
CREATE POLICY "Service manages lists" ON public.site_lists FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 13. FIX POLICIES FROM 033_nudge_log.sql
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service manages nudges" ON public.nudge_log;
CREATE POLICY "Service manages nudges" ON public.nudge_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 14. ENABLE RLS ON UNPROTECTED TABLES
-- ────────────────────────────────────────────────────────────

-- crisis_keywords (from migration 014)
ALTER TABLE public.crisis_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages crisis_keywords" ON public.crisis_keywords FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- indexing_submissions (from migration 059)
ALTER TABLE public.indexing_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages indexing_submissions" ON public.indexing_submissions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- seo_content (from migration 060)
ALTER TABLE public.seo_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages seo_content" ON public.seo_content FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
