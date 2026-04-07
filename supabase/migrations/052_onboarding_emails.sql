-- ============================================================
-- 052_onboarding_emails.sql
--
-- Adds tracking columns for onboarding email sequence and
-- churn prevention escalation. Expands nudge trigger types
-- to support the new email categories.
-- ============================================================

-- ─── Onboarding step tracker ────────────────────────────────
-- 0 = no emails sent yet
-- 1 = welcome (day 0), 2 = journal (day 2), 3 = partner (day 5),
-- 4 = coach (day 8), 5 = reflection (day 13)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_step SMALLINT NOT NULL DEFAULT 0;

-- ─── Churn prevention stage tracker ─────────────────────────
-- Tracks the last stage of churn prevention email sent (1, 2, or 3)
-- and when, so we never double-send or exceed 3 stages.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS churn_stage SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_churn_email_at TIMESTAMPTZ;

-- ─── Expand nudge trigger types ─────────────────────────────
ALTER TABLE public.nudges DROP CONSTRAINT IF EXISTS nudges_trigger_type_check;
ALTER TABLE public.nudges ADD CONSTRAINT nudges_trigger_type_check CHECK (
  trigger_type IN (
    'time_pattern',
    'frequency_spike',
    'vulnerability_window',
    'streak_at_risk',
    'check_in_missed',
    'reengagement',
    'onboarding',
    'churn_prevention'
  )
);

-- Index for onboarding cron queries (find users by signup age)
CREATE INDEX IF NOT EXISTS idx_users_onboarding
  ON public.users(created_at, onboarding_step)
  WHERE onboarding_step < 5;

-- Index for churn prevention queries (find inactive users)
CREATE INDEX IF NOT EXISTS idx_users_churn
  ON public.users(last_active_at, churn_stage)
  WHERE churn_stage < 3;
