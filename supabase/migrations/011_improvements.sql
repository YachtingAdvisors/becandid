-- ============================================================
-- Be Candid — Migration 011
-- Mutual accountability, notification preferences,
-- subscription billing, session tracking
-- ============================================================

-- ─── MUTUAL ACCOUNTABILITY ───────────────────────────────────
-- Allow partnerships to be bidirectional
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS mutual BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.partners.mutual IS
  'When true, both users monitor each other via a single partnership.
   user_id monitors partner_user_id AND partner_user_id monitors user_id.';

-- ─── NOTIFICATION PREFERENCES ────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{
    "alert_email": true,
    "alert_sms": true,
    "alert_push": true,
    "checkin_email": true,
    "checkin_sms": false,
    "digest_email": true,
    "nudge_email": false,
    "encouragement_email": true
  }'::jsonb;

-- ─── SUBSCRIPTION / BILLING ─────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'team')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- ─── SESSION TRACKING ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address  TEXT NOT NULL,
  user_agent  TEXT,
  city        TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id, last_seen DESC);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service inserts sessions"
  ON public.user_sessions FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service updates sessions"
  ON public.user_sessions FOR UPDATE USING (TRUE);

-- ─── LAST ACTIVE TRACKING ────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ─── MAKE IP MANDATORY IN AUDIT LOG ─────────────────────────
-- (ip_address was already TEXT, just update the comment)
COMMENT ON COLUMN public.audit_log.ip_address IS
  'IP address of the request. Should always be captured on write operations.';

-- ─── EXPAND NUDGE TRIGGER TYPES ─────────────────────────────
ALTER TABLE public.nudges DROP CONSTRAINT IF EXISTS nudges_trigger_type_check;
ALTER TABLE public.nudges ADD CONSTRAINT nudges_trigger_type_check CHECK (
  trigger_type IN (
    'time_pattern',
    'frequency_spike',
    'vulnerability_window',
    'streak_at_risk',
    'check_in_missed',
    'reengagement'
  )
);
