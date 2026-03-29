-- ============================================================
-- Be Candid — Migration 001: Base Tables
--
-- Creates the foundational tables that all feature migrations
-- (005-017) depend on. Must run BEFORE any other migration.
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE public.users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  name                  TEXT NOT NULL,
  phone                 TEXT,
  goals                 TEXT[] NOT NULL DEFAULT '{}',
  partner_id            UUID,                           -- FK added after partners table exists
  relationship_type     TEXT NOT NULL DEFAULT 'friend'
                          CHECK (relationship_type IN ('friend', 'spouse', 'mentor', 'family', 'coach')),
  monitoring_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  streak_mode           TEXT NOT NULL DEFAULT 'no_failures'
                          CHECK (streak_mode IN ('no_failures', 'conversation_required')),
  timezone              TEXT NOT NULL DEFAULT 'America/New_York',
  solo_mode             BOOLEAN NOT NULL DEFAULT FALSE,
  nudge_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  check_in_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  check_in_hour         SMALLINT NOT NULL DEFAULT 21
                          CHECK (check_in_hour BETWEEN 0 AND 23),
  check_in_frequency    TEXT NOT NULL DEFAULT 'daily'
                          CHECK (check_in_frequency IN (
                            'daily', 'every_2_days', 'every_3_days', 'weekly', 'every_2_weeks'
                          )),
  -- Billing / Stripe
  plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'pro', 'team')),
  subscription_plan     TEXT NOT NULL DEFAULT 'free'
                          CHECK (subscription_plan IN ('free', 'pro', 'therapy')),
  subscription_status   TEXT NOT NULL DEFAULT 'active'
                          CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  trial_ends_at         TIMESTAMPTZ,
  plan_expires_at       TIMESTAMPTZ,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  -- Notification preferences
  notification_prefs    JSONB NOT NULL DEFAULT '{
    "alert_email": true,
    "alert_sms": true,
    "alert_push": true,
    "checkin_email": true,
    "checkin_sms": false,
    "digest_email": true,
    "nudge_email": false,
    "encouragement_email": true
  }'::jsonb,
  -- Data retention
  event_retention_days  SMALLINT NOT NULL DEFAULT 90
                          CHECK (event_retention_days BETWEEN 30 AND 365),
  -- Activity tracking
  last_active_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. EVENTS
-- ============================================================
CREATE TABLE public.events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category          TEXT NOT NULL
                      CHECK (category IN (
                        'pornography', 'sexting',
                        'social_media', 'binge_watching', 'impulse_shopping',
                        'alcohol_drugs', 'vaping_tobacco',
                        'eating_disorder', 'body_checking',
                        'gambling', 'sports_betting', 'day_trading',
                        'dating_apps',
                        'gaming',
                        'rage_content',
                        'custom'
                      )),
  severity          TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  platform          TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web', 'extension')),
  app_name          TEXT,
  url_hash          TEXT,
  duration_seconds  INTEGER,
  acknowledged      BOOLEAN NOT NULL DEFAULT FALSE,
  metadata          TEXT,                -- Encrypted JSON blob
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user      ON public.events(user_id, timestamp DESC);
CREATE INDEX idx_events_category  ON public.events(user_id, category);

-- ============================================================
-- 3. ALERTS
-- ============================================================
CREATE TABLE public.alerts (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id                  UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category                  TEXT,
  severity                  TEXT,
  user_guide                TEXT,           -- Encrypted JSON
  partner_guide             TEXT,           -- Encrypted JSON
  ai_guide_user             TEXT,           -- Decrypted/plain guide for user
  ai_guide_partner          TEXT,           -- Decrypted/plain guide for partner
  guide_encryption_version  SMALLINT NOT NULL DEFAULT 0,
  email_sent                BOOLEAN NOT NULL DEFAULT FALSE,
  sms_sent                  BOOLEAN NOT NULL DEFAULT FALSE,
  partner_notified          BOOLEAN NOT NULL DEFAULT FALSE,
  partner_viewed_at         TIMESTAMPTZ,
  partner_responded_at      TIMESTAMPTZ,
  sent_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user     ON public.alerts(user_id, sent_at DESC);
CREATE INDEX idx_alerts_event    ON public.alerts(event_id);

-- ============================================================
-- 4. PARTNERS
-- ============================================================
CREATE TABLE public.partners (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  partner_email           TEXT NOT NULL,
  partner_name            TEXT NOT NULL,
  partner_phone           TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'active', 'accepted', 'declined')),
  invite_token            TEXT NOT NULL UNIQUE,
  relationship            TEXT DEFAULT 'friend'
                            CHECK (relationship IN ('friend', 'spouse', 'mentor', 'family', 'coach')),
  mutual                  BOOLEAN NOT NULL DEFAULT FALSE,
  -- Fatigue tracking
  alerts_this_week        INTEGER NOT NULL DEFAULT 0,
  avg_response_hours      REAL,
  last_engagement_at      TIMESTAMPTZ,
  fatigue_warning_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  -- Multi-partner support
  assigned_categories     TEXT[] DEFAULT '{}',
  priority                SMALLINT NOT NULL DEFAULT 1
                            CHECK (priority BETWEEN 1 AND 3),
  -- Relationship levels
  relationship_xp         INTEGER NOT NULL DEFAULT 0,
  relationship_level      SMALLINT NOT NULL DEFAULT 1,
  level_title             TEXT NOT NULL DEFAULT 'New Connection',
  xp_streak_days          SMALLINT NOT NULL DEFAULT 0,
  longest_xp_streak       SMALLINT NOT NULL DEFAULT 0,
  -- Spouse experience
  spouse_journal_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  spouse_impact_frequency TEXT NOT NULL DEFAULT 'weekly'
                            CHECK (spouse_impact_frequency IN ('daily', 'every_3_days', 'weekly', 'after_alerts')),
  spouse_contender_level  SMALLINT NOT NULL DEFAULT 0,
  spouse_trust_trend      TEXT NOT NULL DEFAULT 'unknown'
                            CHECK (spouse_trust_trend IN ('unknown', 'declining', 'stable', 'rebuilding')),
  invited_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_user         ON public.partners(user_id, status);
CREATE INDEX idx_partners_partner_user ON public.partners(partner_user_id);
CREATE INDEX idx_partners_invite_token ON public.partners(invite_token);

-- ── Add FK from users.partner_id → partners.id ──────────────
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_partner
  FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;

-- ============================================================
-- 5. CONVERSATIONS
-- ============================================================
CREATE TABLE public.conversations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id      UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  outcome       TEXT CHECK (outcome IN ('positive', 'neutral', 'difficult')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user  ON public.conversations(user_id, completed_at DESC);
CREATE INDEX idx_conversations_alert ON public.conversations(alert_id);

-- ============================================================
-- 6. CHECK-INS
-- ============================================================
CREATE TABLE public.check_ins (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_user_id       UUID REFERENCES public.users(id),
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'partial', 'completed', 'expired')),
  -- User side
  user_confirmed_at     TIMESTAMPTZ,
  user_mood             TEXT CHECK (user_mood IN ('great', 'good', 'okay', 'struggling', 'crisis')),
  user_response         TEXT,
  -- Partner side
  partner_confirmed_at  TIMESTAMPTZ,
  partner_mood          TEXT CHECK (partner_mood IN ('confident', 'hopeful', 'concerned', 'worried')),
  partner_response      TEXT,
  -- Scheduling
  due_at                TIMESTAMPTZ,
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_check_ins_user    ON public.check_ins(user_id, status, due_at);
CREATE INDEX idx_check_ins_partner ON public.check_ins(partner_user_id, status);

-- ============================================================
-- 7. PUSH TOKENS
-- ============================================================
CREATE TABLE public.push_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

CREATE INDEX idx_push_tokens_user ON public.push_tokens(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens    ENABLE ROW LEVEL SECURITY;

-- ── USERS ─────────────────────────────────────────────────────
CREATE POLICY "Users read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service manages users"
  ON public.users FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── EVENTS ────────────────────────────────────────────────────
CREATE POLICY "Users read own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service inserts events"
  ON public.events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service deletes events"
  ON public.events FOR DELETE
  USING (TRUE);

-- ── ALERTS ────────────────────────────────────────────────────
CREATE POLICY "Users read own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Partners read alerts"
  ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.partner_user_id = auth.uid()
        AND partners.user_id = alerts.user_id
        AND partners.status IN ('active', 'accepted')
    )
  );

CREATE POLICY "Service inserts alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service updates alerts"
  ON public.alerts FOR UPDATE
  USING (TRUE);

CREATE POLICY "Service deletes alerts"
  ON public.alerts FOR DELETE
  USING (TRUE);

-- ── PARTNERS ──────────────────────────────────────────────────
CREATE POLICY "Users read own partnerships"
  ON public.partners FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

CREATE POLICY "Service inserts partners"
  ON public.partners FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service updates partners"
  ON public.partners FOR UPDATE
  USING (TRUE);

CREATE POLICY "Service deletes partners"
  ON public.partners FOR DELETE
  USING (TRUE);

-- ── CONVERSATIONS ─────────────────────────────────────────────
CREATE POLICY "Users read own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service manages conversations"
  ON public.conversations FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── CHECK-INS ─────────────────────────────────────────────────
CREATE POLICY "Users read own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

CREATE POLICY "Partners update check-ins"
  ON public.check_ins FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

CREATE POLICY "Service inserts check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (TRUE);

-- ── PUSH TOKENS ───────────────────────────────────────────────
CREATE POLICY "Users read own tokens"
  ON public.push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tokens"
  ON public.push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own tokens"
  ON public.push_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service manages push tokens"
  ON public.push_tokens FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
