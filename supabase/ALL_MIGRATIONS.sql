-- ============================================================
-- BE CANDID — ALL MIGRATIONS (001-055)
-- Run this entire script in Supabase SQL Editor
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ══════════════════════════════════════════════════════════
-- 001_base_tables.sql
-- ══════════════════════════════════════════════════════════
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


-- ══════════════════════════════════════════════════════════
-- 005_trust_points.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Trust Points & Focus Segments
-- Migration 005
-- ============================================================

-- ─── FOCUS SEGMENTS ───────────────────────────────────────────
-- Each day is split into two segments: morning and evening.
-- A segment is "focused" if no flagged events occurred during it,
-- and "distracted" if one or more flags were triggered.
--
-- Morning: 5:00 AM – 4:59 PM (local time)
-- Evening: 5:00 PM – 4:59 AM (local time)
--
-- Rows are upserted by the nightly cron or on event trigger.
CREATE TABLE public.focus_segments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  segment     TEXT NOT NULL CHECK (segment IN ('morning', 'evening')),
  status      TEXT NOT NULL DEFAULT 'focused' CHECK (status IN ('focused', 'distracted')),
  flag_count  INTEGER NOT NULL DEFAULT 0,
  categories  TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, segment)
);

CREATE INDEX idx_focus_segments_user_date ON public.focus_segments(user_id, date);
CREATE INDEX idx_focus_segments_status ON public.focus_segments(user_id, status, date);

-- ─── TRUST POINTS LEDGER ──────────────────────────────────────
CREATE TABLE public.trust_points (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points        INTEGER NOT NULL,
  action        TEXT NOT NULL CHECK (
                  action IN (
                    'focused_morning',
                    'focused_evening',
                    'focused_full_day',
                    'check_in_completed',
                    'conversation_done',
                    'conversation_positive',
                    'milestone_reached',
                    'partner_encouraged',
                    'streak_bonus_7',
                    'streak_bonus_30',
                    'streak_bonus_90',
                    'manual_adjustment'
                  )),
  category      TEXT,
  reference_id  UUID,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_points_user ON public.trust_points(user_id);
CREATE INDEX idx_trust_points_user_date ON public.trust_points(user_id, created_at);

-- ─── MILESTONES ───────────────────────────────────────────────
CREATE TABLE public.milestones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  milestone   TEXT NOT NULL CHECK (
                milestone IN (
                  'focused_segments_10',  'focused_segments_25',
                  'focused_segments_50',  'focused_segments_100',
                  'full_days_7',   'full_days_14',  'full_days_30',
                  'full_days_60',  'full_days_90',
                  'points_100',    'points_500',    'points_1000',
                  'points_5000',
                  'conversations_5','conversations_10','conversations_25',
                  'streak_7',      'streak_30',     'streak_90'
                )),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, milestone)
);

-- ─── ADD TIMEZONE TO USERS ────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York';

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.focus_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own focus segments"
  ON public.focus_segments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own trust points"
  ON public.trust_points FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own milestones"
  ON public.milestones FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners view focus segments"
  ON public.focus_segments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.partner_user_id = auth.uid()
        AND partners.user_id = focus_segments.user_id
        AND partners.status = 'active'
    )
  );

CREATE POLICY "Service inserts focus segments"
  ON public.focus_segments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Service updates focus segments"
  ON public.focus_segments FOR UPDATE USING (TRUE);
CREATE POLICY "Service inserts trust points"
  ON public.trust_points FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Service inserts milestones"
  ON public.milestones FOR INSERT WITH CHECK (TRUE);


-- ══════════════════════════════════════════════════════════
-- 006_expanded_categories.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Migration 006: Expanded Goal Categories
-- Adds new rival categories for eating disorders, substances,
-- body image, dating, financial, and rage content.
-- ============================================================

-- Drop the old CHECK constraint on events.category
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_category_check;

-- Add expanded CHECK constraint
ALTER TABLE public.events ADD CONSTRAINT events_category_check CHECK (
  category IN (
    -- Sexual content
    'pornography', 'sexting',
    -- Compulsive consumption
    'social_media', 'binge_watching', 'impulse_shopping',
    -- Substances & recovery
    'alcohol_drugs', 'vaping_tobacco',
    -- Body image & eating disorders
    'eating_disorder', 'body_checking',
    -- Gambling & financial
    'gambling', 'sports_betting', 'day_trading',
    -- Dating
    'dating_apps',
    -- Gaming
    'gaming',
    -- Rage & outrage
    'rage_content',
    -- Other
    'custom'
  )
);

-- Note: The users.goals column is TEXT[] (no CHECK constraint),
-- so it automatically supports the new values. Validation
-- happens at the application layer via the shared types.


-- ══════════════════════════════════════════════════════════
-- 007_merge_doomscrolling.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Migration 007: Merge doomscrolling → social_media
-- For any users who had 'doomscrolling' in their goals array,
-- replace it with 'social_media' (deduplicating if both exist).
-- ============================================================

-- Replace doomscrolling with social_media in goals arrays
UPDATE public.users
SET goals = array_remove(goals, 'doomscrolling')
WHERE 'doomscrolling' = ANY(goals)
  AND 'social_media' = ANY(goals);

-- For users who had doomscrolling but NOT social_media
UPDATE public.users
SET goals = array_replace(goals, 'doomscrolling', 'social_media')
WHERE 'doomscrolling' = ANY(goals);

-- Migrate any existing events with category 'doomscrolling'
UPDATE public.events
SET category = 'social_media'
WHERE category = 'doomscrolling';

-- Migrate focus segments that tracked doomscrolling
UPDATE public.focus_segments
SET categories = array_remove(categories, 'doomscrolling')
WHERE 'doomscrolling' = ANY(categories)
  AND 'social_media' = ANY(categories);

UPDATE public.focus_segments
SET categories = array_replace(categories, 'doomscrolling', 'social_media')
WHERE 'doomscrolling' = ANY(categories);


-- ══════════════════════════════════════════════════════════
-- 008_checkin_dual_confirm.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Migration 008: Check-in Frequency & Dual Confirmation
--
-- Check-ins now require BOTH the monitored user AND the partner
-- to confirm for the check-in to count as completed.
-- Frequency is configurable from daily to every 2 weeks.
-- ============================================================

-- ─── Add frequency to users ──────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS check_in_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (check_in_frequency IN (
      'daily',
      'every_2_days',
      'every_3_days',
      'weekly',
      'every_2_weeks'
    ));

COMMENT ON COLUMN public.users.check_in_frequency IS
  'How often check-ins are scheduled.
   daily = every day, every_2_days = every 2 days, etc.';

-- ─── Update check_ins table for dual confirmation ────────────

-- User side (already exists from original schema, but ensure columns)
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS user_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_mood TEXT CHECK (
    user_mood IN ('great', 'good', 'okay', 'struggling', 'crisis')
  ),
  ADD COLUMN IF NOT EXISTS user_response TEXT;

-- Partner side (new)
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS partner_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_mood TEXT CHECK (
    partner_mood IN ('confident', 'hopeful', 'concerned', 'worried')
  ),
  ADD COLUMN IF NOT EXISTS partner_response TEXT,
  ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES public.users(id);

-- Status: pending → user_confirmed → partner_confirmed → completed
-- (or partner confirms first, then user)
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'partial', 'completed', 'expired')
  );

-- Due date — when this check-in expires
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

-- Index for finding pending check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_status
  ON public.check_ins(user_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_check_ins_partner
  ON public.check_ins(partner_user_id, status);

-- ─── RLS for partner access to check-ins ─────────────────────
CREATE POLICY "Partners can view and respond to check-ins"
  ON public.check_ins FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = partner_user_id
  );

CREATE POLICY "Partners can update check-ins"
  ON public.check_ins FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = partner_user_id
  );


-- ══════════════════════════════════════════════════════════
-- 009_vuln_windows_encouragements.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Migration 009: Vulnerability Windows & Encouragements
-- ============================================================

-- ─── VULNERABILITY WINDOWS ───────────────────────────────────
-- Users pre-schedule times they know they're vulnerable.
-- During these windows, the app shifts to heightened mode:
-- more frequent check-ins, partner notification, mood prompt.
CREATE TABLE public.vulnerability_windows (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,                    -- e.g. "Late night alone", "Business travel"
  day_of_week INTEGER[] NOT NULL DEFAULT '{}',  -- 0=Sun..6=Sat, empty = every day
  start_hour  INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour    INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  notify_partner BOOLEAN NOT NULL DEFAULT TRUE, -- alert partner when window starts
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vuln_windows_user ON public.vulnerability_windows(user_id, enabled);

-- ─── ENCOURAGEMENTS ──────────────────────────────────────────
-- Messages sent from partner to monitored user
CREATE TABLE public.encouragements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.users(id),
  to_user_id   UUID NOT NULL REFERENCES public.users(id),
  emoji       TEXT NOT NULL DEFAULT '💪',
  message     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_encouragements_to ON public.encouragements(to_user_id, read_at);

-- ─── NUDGES TABLE (if not exists) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.nudges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category      TEXT,
  trigger_type  TEXT NOT NULL CHECK (
    trigger_type IN (
      'time_pattern',      -- detected usage at a recurring time
      'frequency_spike',   -- more events than usual
      'vulnerability_window', -- entering a pre-scheduled risky time
      'streak_at_risk',    -- long streak about to be tested
      'check_in_missed'    -- missed a check-in
    )
  ),
  message       TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'urgent')),
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged  BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nudges_user ON public.nudges(user_id, acknowledged);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.vulnerability_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own windows"
  ON public.vulnerability_windows FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see encouragements to them"
  ON public.encouragements FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Partners insert encouragements"
  ON public.encouragements FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users see own nudges"
  ON public.nudges FOR ALL USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 010_audit_log.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Migration 010: Audit Log
-- Immutable log of security-relevant actions.
-- ============================================================

CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by user and time
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action, created_at DESC);

-- RLS: users can only read their own audit entries
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own audit log"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (no user-side writes)
CREATE POLICY "Service inserts audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (TRUE);

-- Nobody can update or delete audit entries (immutable)
-- No UPDATE or DELETE policies = blocked by RLS


-- ══════════════════════════════════════════════════════════
-- 011_improvements.sql
-- ══════════════════════════════════════════════════════════
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


-- ══════════════════════════════════════════════════════════
-- 012_stringer_journal.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 011: Stringer Journal + Reminder Preferences
--
-- The journal is the reflective core of Be Candid.
-- Entries can be:
--   1. Triggered by a relapse (alert_id links to the event)
--   2. Written on a user-set reminder schedule
--   3. Created manually anytime
--
-- Reminder preferences let users choose how often they're
-- nudged to journal and what time of day they prefer.
-- ============================================================

-- ── Journal entries ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stringer_journal (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Content (all optional, but at least one required)
  freewrite     TEXT,
  tributaries   TEXT,   -- "What preceded this moment?"
  longing       TEXT,   -- "What did you actually need?"
  roadmap       TEXT,   -- "What is this revealing?"

  -- Context
  alert_id      UUID REFERENCES alerts(id) ON DELETE SET NULL,
  trigger_type  TEXT DEFAULT 'manual' CHECK (trigger_type IN ('relapse', 'reminder', 'manual')),
  mood          SMALLINT CHECK (mood BETWEEN 1 AND 5),
  tags          TEXT[] DEFAULT '{}',

  -- The specific prompt shown in the notification (if reminder-triggered)
  prompt_shown  TEXT,

  CONSTRAINT has_content CHECK (
    freewrite IS NOT NULL OR tributaries IS NOT NULL OR
    longing IS NOT NULL OR roadmap IS NOT NULL
  )
);

CREATE INDEX idx_sj_user_date ON stringer_journal(user_id, created_at DESC);
CREATE INDEX idx_sj_alert ON stringer_journal(alert_id) WHERE alert_id IS NOT NULL;
CREATE INDEX idx_sj_tags ON stringer_journal USING GIN (tags);
CREATE INDEX idx_sj_trigger ON stringer_journal(user_id, trigger_type);

-- ── Journal reminder preferences ────────────────────────────
CREATE TABLE IF NOT EXISTS journal_preferences (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reminder_enabled    BOOLEAN DEFAULT true,
  frequency           TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'every_2_days', 'every_3_days', 'weekly')),
  preferred_hour      SMALLINT DEFAULT 20 CHECK (preferred_hour BETWEEN 0 AND 23),  -- 8 PM default
  timezone            TEXT DEFAULT 'America/New_York',
  after_relapse       BOOLEAN DEFAULT true,    -- Auto-prompt journal after relapse
  relapse_delay_min   SMALLINT DEFAULT 30,     -- Wait N minutes before prompting (let dust settle)
  last_reminder_at    TIMESTAMPTZ,
  last_relapse_prompt TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE stringer_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own journal" ON stringer_journal
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journal" ON stringer_journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journal" ON stringer_journal
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own journal" ON stringer_journal
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own prefs" ON journal_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own prefs" ON journal_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs" ON journal_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ── Trust points RPC (if not already present) ───────────────
CREATE OR REPLACE FUNCTION award_trust_points(
  p_user_id UUID, p_points INT, p_reason TEXT, p_reference_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO trust_points (user_id, points, reason, reference_id)
  VALUES (p_user_id, p_points, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ══════════════════════════════════════════════════════════
-- 013_security_hardening.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 013: Security Hardening
--
-- 1. user_sessions — track active devices, enforce limits
-- 2. data_retention — automatic purge of old events (privacy)
-- 3. encryption_version — track which rows are encrypted
-- 4. Indexes for session security queries
-- ============================================================

-- ── Active sessions (upgrade from 011) ──────────────────────
-- Migration 011 created user_sessions with last_seen.
-- Add missing columns from the security-hardened schema.
ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS device_hash TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

-- Backfill last_active_at from last_seen if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'user_sessions' AND column_name = 'last_seen') THEN
    UPDATE public.user_sessions SET last_active_at = last_seen WHERE last_active_at IS NULL;
  END IF;
END $$;

-- Create index using whichever column exists
DROP INDEX IF EXISTS idx_sessions_user;
CREATE INDEX idx_sessions_user ON public.user_sessions(user_id, last_active_at DESC);

-- Auto-expire sessions after 30 days of inactivity
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE last_active_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS for sessions (add delete policy if missing) ─────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own sessions') THEN
    CREATE POLICY "Users delete own sessions" ON public.user_sessions
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── Data retention ──────────────────────────────────────────
-- Add retention_days to user preferences.
-- Users can choose how long raw events are kept.
-- Journal entries are never auto-deleted (they're reflective work).

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  event_retention_days SMALLINT DEFAULT 90 CHECK (event_retention_days BETWEEN 30 AND 365);

-- Purge function — call from a weekly cron
CREATE OR REPLACE FUNCTION purge_expired_events()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH expired AS (
    DELETE FROM events e
    USING users u
    WHERE e.user_id = u.id
      AND e.created_at < now() - (u.event_retention_days || ' days')::interval
    RETURNING e.id
  )
  SELECT count(*) INTO deleted_count FROM expired;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Encryption version tracking ─────────────────────────────
-- Allows us to know which rows need migration if we rotate keys.

ALTER TABLE stringer_journal ADD COLUMN IF NOT EXISTS
  encryption_version SMALLINT DEFAULT 0;
  -- 0 = plaintext (pre-encryption or dev)
  -- 1 = AES-256-GCM with ENCRYPTION_MASTER_KEY v1

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  guide_encryption_version SMALLINT DEFAULT 0;

-- ── Login attempt tracking ──────────────────────────────────
-- For brute-force detection beyond rate limiting.

CREATE TABLE IF NOT EXISTS login_attempts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  ip_address  TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);

-- Auto-purge login attempts older than 7 days
CREATE OR REPLACE FUNCTION cleanup_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- No RLS on login_attempts — service client only
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- No SELECT policies = no user access (correct — this is internal)


-- ══════════════════════════════════════════════════════════
-- 014_solo_fatigue_crisis.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 014: Solo Mode + Partner Fatigue
--
-- 1. Solo mode — users can use the app without a partner.
--    AI conversation guides become self-reflection guides.
--    Alerts go to the user only. Check-ins become self-check-ins.
--
-- 2. Partner fatigue tracking — monitors partner response time
--    and engagement drop-off to prevent burnout.
--
-- 3. Crisis keywords table — flagged phrases in journal entries
--    that should trigger resource display (not alert the partner).
-- ============================================================

-- ── Solo mode flag ──────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  solo_mode BOOLEAN DEFAULT false;

-- When solo_mode = true:
--   - Alert pipeline skips partner notification
--   - AI guide is "self-reflection" variant (no partner guide)
--   - Check-ins become self-only (no dual confirmation)
--   - Dashboard hides partner-related UI
--   - User can still invite a partner later (flips solo_mode off)

-- ── Partner fatigue tracking ────────────────────────────────
ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  avg_response_hours REAL;  -- Rolling average response time

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  alerts_this_week INTEGER DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  last_engagement_at TIMESTAMPTZ;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  fatigue_warning_sent BOOLEAN DEFAULT false;

-- Track individual alert response times
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  partner_viewed_at TIMESTAMPTZ;

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  partner_responded_at TIMESTAMPTZ;

-- ── Offline event queue (for mobile sync) ───────────────────
CREATE TABLE IF NOT EXISTS event_queue (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload       JSONB NOT NULL,         -- Full event data
  queued_at     TIMESTAMPTZ NOT NULL,   -- When the event was captured offline
  synced_at     TIMESTAMPTZ,            -- When it was successfully synced
  sync_attempts INTEGER DEFAULT 0,
  last_error    TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed'))
);

CREATE INDEX idx_event_queue_user ON event_queue(user_id, status);

ALTER TABLE event_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own queue" ON event_queue
  FOR ALL USING (auth.uid() = user_id);

-- ── Crisis resource keywords ────────────────────────────────
-- These are checked against journal freewrite text.
-- If matched, the app shows crisis resources — NOT partner alerts.
-- This is about user safety, not surveillance.

CREATE TABLE IF NOT EXISTS crisis_keywords (
  id        SERIAL PRIMARY KEY,
  phrase    TEXT NOT NULL UNIQUE,
  severity  TEXT DEFAULT 'show_resources' CHECK (severity IN ('show_resources', 'urgent')),
  resource  TEXT  -- Which resource to display
);

INSERT INTO crisis_keywords (phrase, severity, resource) VALUES
  ('want to die', 'urgent', '988_suicide_lifeline'),
  ('kill myself', 'urgent', '988_suicide_lifeline'),
  ('end my life', 'urgent', '988_suicide_lifeline'),
  ('suicidal', 'urgent', '988_suicide_lifeline'),
  ('self harm', 'show_resources', 'crisis_text_line'),
  ('self-harm', 'show_resources', 'crisis_text_line'),
  ('cutting myself', 'show_resources', 'crisis_text_line'),
  ('hurting myself', 'show_resources', 'crisis_text_line'),
  ('no reason to live', 'urgent', '988_suicide_lifeline'),
  ('better off dead', 'urgent', '988_suicide_lifeline'),
  ('worthless', 'show_resources', 'general_crisis'),
  ('hopeless', 'show_resources', 'general_crisis')
ON CONFLICT (phrase) DO NOTHING;


-- ══════════════════════════════════════════════════════════
-- 015_outcomes_therapist_multi.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 015: Conversation Outcomes, Therapist Portal,
--                Multi-Partner, Subscriptions
-- ============================================================

-- ── Conversation outcomes ───────────────────────────────────
-- Both user and partner rate how the conversation went.
-- This closes the loop on alerts and builds a growth narrative.

CREATE TABLE IF NOT EXISTS conversation_outcomes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id          UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- User's self-assessment
  user_rating       SMALLINT CHECK (user_rating BETWEEN 1 AND 5),
  user_felt         TEXT CHECK (user_felt IN ('heard', 'defensive', 'relieved', 'ashamed', 'hopeful', 'angry', 'grateful', 'numb')),
  user_notes        TEXT,
  user_completed_at TIMESTAMPTZ,

  -- Partner's assessment
  partner_rating       SMALLINT CHECK (partner_rating BETWEEN 1 AND 5),
  partner_felt         TEXT CHECK (partner_felt IN ('helpful', 'frustrated', 'connected', 'worried', 'hopeful', 'overwhelmed', 'grateful', 'unsure')),
  partner_notes        TEXT,
  partner_completed_at TIMESTAMPTZ,

  -- AI-generated reflection after both complete
  ai_reflection     TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE (alert_id)
);

CREATE INDEX idx_outcomes_user ON conversation_outcomes(user_id, created_at DESC);

ALTER TABLE conversation_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own outcomes" ON conversation_outcomes
  FOR ALL USING (auth.uid() = user_id);

-- ── Therapist connections ───────────────────────────────────
-- Users can grant a therapist read-only access to their:
--   - Journal entries (decrypted)
--   - Mood timeline
--   - Focus streaks
--   - Conversation outcome history
-- Therapists NEVER see: raw events, URLs, partner info, push content

CREATE TABLE IF NOT EXISTS therapist_connections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_email TEXT NOT NULL,
  therapist_name  TEXT,
  invite_token    TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),

  -- Granular consent — user picks what the therapist can see
  can_see_journal    BOOLEAN DEFAULT true,
  can_see_moods      BOOLEAN DEFAULT true,
  can_see_streaks    BOOLEAN DEFAULT true,
  can_see_outcomes   BOOLEAN DEFAULT true,
  can_see_patterns   BOOLEAN DEFAULT false,  -- Off by default (more sensitive)

  therapist_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_at        TIMESTAMPTZ,
  revoked_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_therapist_user ON therapist_connections(user_id, status);
CREATE INDEX idx_therapist_token ON therapist_connections(invite_token) WHERE status = 'pending';

ALTER TABLE therapist_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON therapist_connections
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Therapists read accepted connections" ON therapist_connections
  FOR SELECT USING (auth.uid() = therapist_user_id AND status = 'accepted');

-- ── Multi-partner support ───────────────────────────────────
-- Remove the implicit single-partner assumption.
-- Users can now have up to 3 active partners.
-- Each partner can be assigned specific categories.

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  assigned_categories TEXT[] DEFAULT '{}';
  -- Empty = all categories (default, backward compatible)
  -- Populated = only alert for these categories

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  priority SMALLINT DEFAULT 1 CHECK (priority BETWEEN 1 AND 3);
  -- 1 = primary (gets all alerts)
  -- 2 = secondary (gets alerts only when primary is fatigued)
  -- 3 = backup (gets weekly digest only)

-- ── Subscription / billing ──────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  stripe_customer_id TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'therapy'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  trial_ends_at TIMESTAMPTZ;

-- ── Weekly AI reflection cache ──────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  reflection  TEXT NOT NULL,  -- Encrypted AI-generated narrative
  mood_avg    REAL,
  entry_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, week_start)
);

ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reflections" ON weekly_reflections
  FOR SELECT USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 016_relationship_levels.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 016: Relationship Level System
--
-- A shared relationship level between user and partner that
-- grows through natural interactions. Nothing is required —
-- the level reflects how actively both people are investing.
--
-- XP flows in from both sides:
--   USER earns XP for: focused days, journal entries, check-in
--     responses, conversation participation, sending encouragement
--   PARTNER earns XP for: viewing alerts, completing conversation
--     guides, confirming check-ins, sending encouragement
--   BOTH earn XP for: completing a conversation (both sides rated)
--
-- Bonus multipliers reward streaks and consistency, not perfection.
-- ============================================================

-- ── Relationship XP ledger ──────────────────────────────────
-- Every XP-earning action creates a row. The sum is the total XP.
-- We track who earned it (user or partner) for display balance.

CREATE TABLE IF NOT EXISTS relationship_xp (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id    UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  earned_by     TEXT NOT NULL CHECK (earned_by IN ('user', 'partner')),
  amount        INTEGER NOT NULL,
  reason        TEXT NOT NULL,
  bonus         BOOLEAN DEFAULT false,  -- true = optional action (journal, encouragement)
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rxp_partner ON relationship_xp(partner_id, created_at DESC);
CREATE INDEX idx_rxp_partner_sum ON relationship_xp(partner_id);

ALTER TABLE relationship_xp ENABLE ROW LEVEL SECURITY;

-- Both user and partner can see relationship XP
CREATE POLICY "Users see own relationship xp" ON relationship_xp
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- ── Relationship level cache ────────────────────────────────
-- Cached for fast reads. Updated by the XP award function.

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  relationship_xp     INTEGER DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  relationship_level   SMALLINT DEFAULT 1;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  level_title          TEXT DEFAULT 'New Connection';

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  xp_streak_days       SMALLINT DEFAULT 0;  -- Consecutive days both earned XP

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  longest_xp_streak    SMALLINT DEFAULT 0;

-- ── XP award function ───────────────────────────────────────

CREATE OR REPLACE FUNCTION award_relationship_xp(
  p_partner_id UUID,
  p_earned_by TEXT,
  p_amount INTEGER,
  p_reason TEXT,
  p_bonus BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(new_xp INTEGER, new_level SMALLINT, new_title TEXT, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_level SMALLINT;
  v_new_level SMALLINT;
  v_new_xp INTEGER;
  v_title TEXT;
BEGIN
  -- Get current level
  SELECT relationship_level INTO v_old_level FROM partners WHERE id = p_partner_id;

  -- Insert XP record
  INSERT INTO relationship_xp (partner_id, earned_by, amount, reason, bonus, metadata)
  VALUES (p_partner_id, p_earned_by, p_amount, p_reason, p_bonus, p_metadata);

  -- Calculate new total
  SELECT COALESCE(SUM(amount), 0) INTO v_new_xp
  FROM relationship_xp WHERE partner_id = p_partner_id;

  -- Calculate level from XP thresholds
  v_new_level := CASE
    WHEN v_new_xp >= 10000 THEN 10
    WHEN v_new_xp >= 7000 THEN 9
    WHEN v_new_xp >= 5000 THEN 8
    WHEN v_new_xp >= 3500 THEN 7
    WHEN v_new_xp >= 2500 THEN 6
    WHEN v_new_xp >= 1500 THEN 5
    WHEN v_new_xp >= 900 THEN 4
    WHEN v_new_xp >= 500 THEN 3
    WHEN v_new_xp >= 200 THEN 2
    ELSE 1
  END;

  v_title := CASE v_new_level
    WHEN 1 THEN 'New Connection'
    WHEN 2 THEN 'Getting Started'
    WHEN 3 THEN 'Building Trust'
    WHEN 4 THEN 'Growing Together'
    WHEN 5 THEN 'Steady Ground'
    WHEN 6 THEN 'Deep Roots'
    WHEN 7 THEN 'Proven Bond'
    WHEN 8 THEN 'Iron Sharpens Iron'
    WHEN 9 THEN 'Unshakeable'
    WHEN 10 THEN 'Covenant'
    ELSE 'New Connection'
  END;

  -- Update cache
  UPDATE partners SET
    relationship_xp = v_new_xp,
    relationship_level = v_new_level,
    level_title = v_title
  WHERE id = p_partner_id;

  RETURN QUERY SELECT v_new_xp, v_new_level, v_title, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ══════════════════════════════════════════════════════════
-- 017_spouse_experience.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 017: Spouse Experience
--
-- When the accountability partner is a spouse, the dynamic is
-- fundamentally different. The spouse isn't a neutral observer —
-- they're a co-sufferer. Every flag represents a breach of trust
-- in their most intimate relationship.
--
-- This migration adds:
--   1. Spouse journal — their own reflection space
--   2. Impact check-ins — how the spouse is feeling
--   3. Committed Contender milestones — honoring the spouse's choice to stay
--   4. Relational health tracking — shared view of the relationship's trajectory
-- ============================================================

-- ── Spouse journal ──────────────────────────────────────────
-- The spouse gets their own journal. Different prompts, different
-- purpose. Their entries are NEVER visible to the monitored user
-- unless the spouse explicitly shares a specific entry.

CREATE TABLE IF NOT EXISTS spouse_journal (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id    UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Content
  freewrite     TEXT,
  impact        TEXT,      -- "How is this affecting me right now?"
  needs         TEXT,      -- "What do I need — from myself, from them, from God?"
  boundaries    TEXT,      -- "What boundaries do I need to hold or set?"

  -- Context
  triggered_by_alert UUID REFERENCES alerts(id) ON DELETE SET NULL,
  mood          SMALLINT CHECK (mood BETWEEN 1 AND 5),
  tags          TEXT[] DEFAULT '{}',

  -- Sharing
  shared_with_partner BOOLEAN DEFAULT false,  -- Spouse chooses to share
  shared_at           TIMESTAMPTZ,

  CONSTRAINT spouse_has_content CHECK (
    freewrite IS NOT NULL OR impact IS NOT NULL OR
    needs IS NOT NULL OR boundaries IS NOT NULL
  )
);

CREATE INDEX idx_sj_spouse ON spouse_journal(spouse_user_id, created_at DESC);
CREATE INDEX idx_sj_partner ON spouse_journal(partner_id);

ALTER TABLE spouse_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse reads own journal" ON spouse_journal
  FOR SELECT USING (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse writes own journal" ON spouse_journal
  FOR INSERT WITH CHECK (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse updates own journal" ON spouse_journal
  FOR UPDATE USING (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse deletes own journal" ON spouse_journal
  FOR DELETE USING (auth.uid() = spouse_user_id);

-- Partner can ONLY see entries explicitly shared
CREATE POLICY "User sees shared spouse entries" ON spouse_journal
  FOR SELECT USING (
    shared_with_partner = true AND
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ── Spouse impact check-ins ─────────────────────────────────
-- Periodic emotional snapshots from the spouse. Tracks how
-- they're feeling over time. Used in the weekly digest and
-- shown to the user (with spouse's consent) to build empathy.

CREATE TABLE IF NOT EXISTS spouse_impact (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id      UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),

  -- Emotional state (multiple select)
  feelings        TEXT[] DEFAULT '{}',
  -- Options: hurt, angry, numb, anxious, hopeful, exhausted,
  --          betrayed, lonely, determined, loved, confused, healing

  -- Trust meter (1-10)
  trust_level     SMALLINT CHECK (trust_level BETWEEN 1 AND 10),

  -- Safety (does the spouse feel safe in the relationship?)
  feels_safe      BOOLEAN,

  -- Optional reflection
  reflection      TEXT,

  -- Consent: show to partner?
  visible_to_partner BOOLEAN DEFAULT false
);

CREATE INDEX idx_si_spouse ON spouse_impact(spouse_user_id, created_at DESC);

ALTER TABLE spouse_impact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse manages own impact" ON spouse_impact
  FOR ALL USING (auth.uid() = spouse_user_id);
CREATE POLICY "User sees consented impact" ON spouse_impact
  FOR SELECT USING (
    visible_to_partner = true AND
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ── Committed Contender milestones ──────────────────────────
-- Honors the spouse's choice to stay and fight for the relationship.
-- These are EARNED — not given. They represent real engagement.

CREATE TABLE IF NOT EXISTS contender_milestones (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_key   TEXT NOT NULL,
  achieved_at     TIMESTAMPTZ DEFAULT now(),

  UNIQUE (spouse_user_id, milestone_key)
);

ALTER TABLE contender_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse sees own milestones" ON contender_milestones
  FOR SELECT USING (auth.uid() = spouse_user_id);

-- ── Add spouse-specific fields to partners table ────────────

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_journal_enabled BOOLEAN DEFAULT false;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_impact_frequency TEXT DEFAULT 'weekly'
    CHECK (spouse_impact_frequency IN ('daily', 'every_3_days', 'weekly', 'after_alerts'));

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_contender_level SMALLINT DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_trust_trend TEXT DEFAULT 'unknown'
    CHECK (spouse_trust_trend IN ('unknown', 'declining', 'stable', 'rebuilding'));


-- ══════════════════════════════════════════════════════════
-- 019_foundational_motivator.sql
-- ══════════════════════════════════════════════════════════
-- Migration 019: Foundational Motivator
-- Allows users to choose what grounds their accountability journey
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS foundational_motivator TEXT DEFAULT 'general'
  CHECK (foundational_motivator IN ('spiritual', 'psychological', 'relational', 'general'));


-- ══════════════════════════════════════════════════════════
-- 020_content_filtering.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 020: Content Filtering
-- Adds content_rules table for per-user block/allow rules,
-- content_filter_log for audit trail, and content_filter_level
-- column on users.
-- ============================================================

-- ── Content rules (per-user block/allow) ─────────────────────

CREATE TABLE IF NOT EXISTS content_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('block', 'allow')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, domain, rule_type)
);

CREATE INDEX idx_content_rules_user ON content_rules(user_id);
ALTER TABLE content_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rules" ON content_rules
  FOR ALL USING (auth.uid() = user_id);

-- ── Content filter log (audit trail) ─────────────────────────

CREATE TABLE IF NOT EXISTS content_filter_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT,
  app_name TEXT,
  category TEXT,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'flagged', 'allowed')),
  confidence REAL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_filter_log_user ON content_filter_log(user_id, created_at DESC);
ALTER TABLE content_filter_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own filter log" ON content_filter_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts filter log" ON content_filter_log
  FOR INSERT WITH CHECK (true);

-- ── Add filter level to users ────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS content_filter_level TEXT DEFAULT 'standard'
  CHECK (content_filter_level IN ('off', 'standard', 'strict', 'custom'));


-- ══════════════════════════════════════════════════════════
-- 021_teen_mode.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 021: Teen Mode & Guardian System
-- ============================================================

-- Account mode
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'adult'
  CHECK (account_mode IN ('adult', 'teen'));

-- Guardians table
CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teen_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'guardian', 'counselor', 'mentor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  permissions JSONB NOT NULL DEFAULT '{"view_events": true, "view_journal": false, "manage_content_filter": true, "manage_screen_time": true, "receive_alerts": true, "manage_settings": false}',
  invite_token TEXT UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (guardian_user_id, teen_user_id)
);

CREATE INDEX IF NOT EXISTS idx_guardians_teen ON guardians(teen_user_id, status);
CREATE INDEX IF NOT EXISTS idx_guardians_guardian ON guardians(guardian_user_id, status);
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Both guardian and teen can see the relationship
CREATE POLICY "Users view own guardian relationships" ON guardians
  FOR SELECT USING (auth.uid() = guardian_user_id OR auth.uid() = teen_user_id);
CREATE POLICY "Service manages guardians" ON guardians
  FOR ALL USING (true) WITH CHECK (true);

-- Screen time rules
CREATE TABLE IF NOT EXISTS screen_time_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'all',
  daily_limit_minutes INTEGER,
  downtime_start TIME,
  downtime_end TIME,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  enforced BOOLEAN DEFAULT false, -- Guardian-locked
  created_by UUID REFERENCES users(id), -- Who set this rule
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screen_rules_user ON screen_time_rules(user_id);
ALTER TABLE screen_time_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own screen time rules" ON screen_time_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages screen time rules" ON screen_time_rules
  FOR ALL USING (true) WITH CHECK (true);

-- Screen time usage tracking
CREATE TABLE IF NOT EXISTS screen_time_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'all',
  minutes_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date, category)
);

CREATE INDEX IF NOT EXISTS idx_screen_usage_user_date ON screen_time_usage(user_id, date DESC);
ALTER TABLE screen_time_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON screen_time_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages usage" ON screen_time_usage
  FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════
-- 022_walkthrough.sql
-- ══════════════════════════════════════════════════════════
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


-- ══════════════════════════════════════════════════════════
-- 023_realtime_events.sql
-- ══════════════════════════════════════════════════════════
-- ─── Enable Supabase Realtime on events table ─────────────────
-- Required for the real-time activity dashboard to receive live updates.

ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- RLS SELECT policy (required for Realtime to deliver rows to subscribed clients)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can see own events via realtime'
  ) THEN
    CREATE POLICY "Users can see own events via realtime"
      ON public.events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════
-- 024_screen_capture.sql
-- ══════════════════════════════════════════════════════════
-- Screen capture desktop agent settings
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS screen_capture_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS screen_capture_interval INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS screen_capture_change_threshold FLOAT DEFAULT 0.10;


-- ══════════════════════════════════════════════════════════
-- 025_heartbeat.sql
-- ══════════════════════════════════════════════════════════
-- Desktop app heartbeat tracking
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ DEFAULT NULL;


-- ══════════════════════════════════════════════════════════
-- 026_fasting.sql
-- ══════════════════════════════════════════════════════════
-- 026_fasting.sql — Fasting feature: time-limited restrictions on activities

CREATE TABLE IF NOT EXISTS fasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,  -- can be a goal category or custom text like "news", "reddit", "twitter"
  label TEXT NOT NULL,     -- user-facing name like "Reading the News"
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,  -- set when fast completes successfully
  broken_at TIMESTAMPTZ,     -- set if user breaks the fast
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fasts_user ON fasts(user_id);
CREATE INDEX idx_fasts_active ON fasts(user_id, ends_at) WHERE completed_at IS NULL AND broken_at IS NULL;

ALTER TABLE fasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own fasts" ON fasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages fasts" ON fasts FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════
-- 027_quote_favorites.sql
-- ══════════════════════════════════════════════════════════
-- Quote favorites — lets users bookmark motivational quotes
CREATE TABLE IF NOT EXISTS quote_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  quote_author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quote_text)
);

CREATE INDEX idx_quote_favs_user ON quote_favorites(user_id);

ALTER TABLE quote_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON quote_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages favorites" ON quote_favorites FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════
-- 028_referral_program.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 028 — Referral Program & Shareable Milestones
-- ============================================================

-- ── Referral columns on users ───────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- ── Referrals ledger ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  reward_granted BOOLEAN NOT NULL DEFAULT FALSE,
  reward_days   INTEGER NOT NULL DEFAULT 30,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service manages referrals"
  ON public.referrals FOR ALL
  USING (true) WITH CHECK (true);

-- ── Share token on milestones ───────────────────────────────
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_milestones_share_token ON public.milestones(share_token);


-- ══════════════════════════════════════════════════════════
-- 028b_backfill_referral_codes.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 028b — Backfill referral codes for existing users
-- ============================================================
-- Generates a unique 8-char hex code for every user that doesn't have one yet.

UPDATE public.users
SET referral_code = substr(md5(random()::text || id::text || now()::text), 1, 8)
WHERE referral_code IS NULL;


-- ══════════════════════════════════════════════════════════
-- 029_expand_relationship_types.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 029 — Expand relationship type options
-- ============================================================
-- Add 'therapist' and 'pastor' to allowed relationship types

-- Remove restrictive CHECK constraints entirely — allow any text value
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_relationship_type_check;
ALTER TABLE public.partners DROP CONSTRAINT IF EXISTS partners_relationship_check;


-- ══════════════════════════════════════════════════════════
-- 030_login_count.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 030 — Add login_count for walkthrough display control
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;


-- ══════════════════════════════════════════════════════════
-- 031_category_time_limits.sql
-- ══════════════════════════════════════════════════════════
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


-- ══════════════════════════════════════════════════════════
-- 032_site_lists.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Be Candid — Site Whitelist / Blacklist
-- Users can whitelist (safe) or blacklist (avoid) domains.
-- Partners can see whitelist only; blacklist is private.
-- Removing a blacklisted site triggers partner notification.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  list_type TEXT NOT NULL CHECK (list_type IN ('whitelist', 'blacklist')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_site_lists_user ON public.site_lists(user_id);

ALTER TABLE public.site_lists ENABLE ROW LEVEL SECURITY;

-- Users can manage their own lists
CREATE POLICY "Users manage own lists" ON public.site_lists
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all lists (for partner lookups, etc.)
CREATE POLICY "Service manages lists" ON public.site_lists
  FOR ALL USING (true)
  WITH CHECK (true);


-- ══════════════════════════════════════════════════════════
-- 033_nudge_log.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 033 — Nudge notification log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  mood TEXT NOT NULL,
  message TEXT,
  delivered_email BOOLEAN DEFAULT FALSE,
  delivered_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nudge_log_user ON public.nudge_log(user_id);

ALTER TABLE public.nudge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own nudges"
  ON public.nudge_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service manages nudges"
  ON public.nudge_log FOR ALL
  USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════
-- 034_family_systems.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 034: Family Systems Analysis & Therapist Notes
--
-- Adds tables for:
--   1. family_systems_notes — therapist clinical notes on
--      family-of-origin dynamics, parenting style observations,
--      and counseling notes that feed back into AI analysis
--   2. can_see_family_systems consent toggle on therapist_connections
-- ============================================================

-- ── Therapist family systems notes ─────────────────────────
-- Therapists can record observations about each dynamic,
-- confirm/deny predicted dynamics, and add clinical notes.

CREATE TABLE IF NOT EXISTS family_systems_notes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id   UUID NOT NULL REFERENCES therapist_connections(id) ON DELETE CASCADE,

  -- Which dynamic this note relates to (nullable for general notes)
  dynamic         TEXT CHECK (dynamic IS NULL OR dynamic IN (
    'rigidity', 'enmeshment', 'triangulation',
    'dismissiveness', 'abdication', 'incongruence'
  )),

  -- Therapist's clinical assessment
  confirmed       BOOLEAN,           -- true = therapist confirms this dynamic is present
  confidence_override SMALLINT CHECK (confidence_override IS NULL OR confidence_override BETWEEN 0 AND 100),
  parenting_style  TEXT CHECK (parenting_style IS NULL OR parenting_style IN (
    'authoritarian', 'enmeshed', 'uninvolved', 'permissive',
    'conflict_driven', 'performative'
  )),

  -- Freeform clinical notes (encrypted at application layer)
  note            TEXT NOT NULL,

  -- Categorization
  note_type       TEXT DEFAULT 'observation' CHECK (note_type IN (
    'observation',        -- general clinical observation
    'family_history',     -- family-of-origin history
    'attachment_pattern', -- attachment style observation
    'treatment_note',     -- treatment planning / progress
    'dynamic_assessment'  -- assessment of a specific dynamic
  )),

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_notes_user ON family_systems_notes(user_id, created_at DESC);
CREATE INDEX idx_family_notes_therapist ON family_systems_notes(therapist_id);
CREATE INDEX idx_family_notes_dynamic ON family_systems_notes(user_id, dynamic) WHERE dynamic IS NOT NULL;

ALTER TABLE family_systems_notes ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own notes for connected clients
CREATE POLICY "Therapists manage own notes" ON family_systems_notes
  FOR ALL USING (auth.uid() = therapist_id);

-- Users can see notes about themselves (read-only)
CREATE POLICY "Users read own family notes" ON family_systems_notes
  FOR SELECT USING (auth.uid() = user_id);

-- ── Add consent toggle to therapist_connections ────────────
ALTER TABLE therapist_connections ADD COLUMN IF NOT EXISTS
  can_see_family_systems BOOLEAN DEFAULT false;
  -- Off by default — family systems data is sensitive


-- ══════════════════════════════════════════════════════════
-- 035_realtime_tables.sql
-- ══════════════════════════════════════════════════════════
-- ─── Enable Supabase Realtime on additional tables ─────────────
-- Extends 023_realtime_events.sql to support live dashboard updates
-- for alerts, check-ins, nudges, milestones, and focus segments.

ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE nudges;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_segments;

-- RLS SELECT policies (required for Realtime to deliver rows to subscribed clients)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'alerts' AND policyname = 'Users can see own alerts via realtime'
  ) THEN
    CREATE POLICY "Users can see own alerts via realtime"
      ON public.alerts FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'check_ins' AND policyname = 'Users can see own check_ins via realtime'
  ) THEN
    CREATE POLICY "Users can see own check_ins via realtime"
      ON public.check_ins FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() = partner_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nudges' AND policyname = 'Users can see own nudges via realtime'
  ) THEN
    CREATE POLICY "Users can see own nudges via realtime"
      ON public.nudges FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'milestones' AND policyname = 'Users can see own milestones via realtime'
  ) THEN
    CREATE POLICY "Users can see own milestones via realtime"
      ON public.milestones FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'focus_segments' AND policyname = 'Users can see own focus_segments via realtime'
  ) THEN
    CREATE POLICY "Users can see own focus_segments via realtime"
      ON public.focus_segments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════
-- 036_future_letters.sql
-- ══════════════════════════════════════════════════════════
-- Future Letters: "Letter to My Future Self"
-- Users write letters during moments of clarity/strength.
-- Letters are sealed (encrypted) and surfaced during relapse-triggered journal entries.

CREATE TABLE IF NOT EXISTS future_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  letter TEXT NOT NULL,          -- encrypted
  written_mood SMALLINT CHECK (written_mood BETWEEN 1 AND 5),
  sealed_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,     -- NULL until surfaced during relapse
  delivery_trigger TEXT,         -- 'relapse_journal' | 'manual_open'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_future_letters_user ON future_letters(user_id, delivered_at);
ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own letters" ON future_letters FOR ALL USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 037_daily_challenges.sql
-- ══════════════════════════════════════════════════════════
-- Daily Challenge System
-- Users receive one challenge per day to build healthy habits

CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  challenge_text TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('journal', 'connection', 'mindfulness', 'physical', 'gratitude')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_daily_challenges_user ON daily_challenges(user_id, date DESC);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenges"
  ON daily_challenges FOR ALL USING (auth.uid() = user_id);

-- Extend trust_points action CHECK to include daily_challenge
ALTER TABLE public.trust_points DROP CONSTRAINT IF EXISTS trust_points_action_check;
ALTER TABLE public.trust_points ADD CONSTRAINT trust_points_action_check CHECK (
  action IN (
    'focused_morning',
    'focused_evening',
    'focused_full_day',
    'check_in_completed',
    'conversation_done',
    'conversation_positive',
    'milestone_reached',
    'partner_encouraged',
    'streak_bonus_7',
    'streak_bonus_30',
    'streak_bonus_90',
    'manual_adjustment',
    'daily_challenge'
  )
);


-- ══════════════════════════════════════════════════════════
-- 038_groups.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 038: Accountability Groups
-- Small groups (3-5) with anonymized focus boards and check-ins
-- ============================================================

-- Accountability groups
CREATE TABLE IF NOT EXISTS accountability_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  max_members SMALLINT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES accountability_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,  -- anonymized name (e.g., "Member A")
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES accountability_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood SMALLINT CHECK (mood BETWEEN 1 AND 5),
  message TEXT,  -- encrypted
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_group_members ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_checkins ON group_checkins(group_id, created_at DESC);

ALTER TABLE accountability_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members access own groups" ON accountability_groups
  FOR ALL USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Members access group data" ON group_members
  FOR ALL USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Members access group checkins" ON group_checkins
  FOR ALL USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));


-- ══════════════════════════════════════════════════════════
-- 039_therapist_directory.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 039: Therapist Directory
-- Allow therapists to opt into being discoverable
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_therapist BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS therapist_profile JSONB;
-- therapist_profile schema:
-- {
--   specialty: string[],
--   bio: string,
--   location: string,
--   insurance: string[],
--   website: string,
--   listed: boolean
-- }


-- ══════════════════════════════════════════════════════════
-- 040_community_feed.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 040: Community Feed — anonymous wins & encouragement board
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'win' CHECK (post_type IN ('win', 'milestone', 'encouragement', 'gratitude')),
  hearts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_community_posts ON community_posts(created_at DESC);
CREATE INDEX idx_community_hearts_post ON community_hearts(post_id);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users manage own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own posts delete" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read hearts" ON community_hearts FOR SELECT USING (true);
CREATE POLICY "Users manage own hearts" ON community_hearts FOR ALL USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 041_mentorship.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 041: Mentorship — sponsor/mentor matching system
-- ============================================================

CREATE TABLE IF NOT EXISTS mentors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  max_mentees SMALLINT DEFAULT 3,
  active BOOLEAN DEFAULT true,
  streak_at_signup INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentorship_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  UNIQUE (mentor_id, mentee_user_id)
);

CREATE INDEX idx_mentors_active ON mentors(active) WHERE active = true;
CREATE INDEX idx_mentorship_mentee ON mentorship_connections(mentee_user_id);

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read mentors" ON mentors FOR SELECT USING (active = true);
CREATE POLICY "Users manage own mentor profile" ON mentors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own connections" ON mentorship_connections FOR SELECT USING (
  mentee_user_id = auth.uid() OR mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own connections" ON mentorship_connections FOR ALL USING (
  mentee_user_id = auth.uid() OR mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
);


-- ══════════════════════════════════════════════════════════
-- 042_amends.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 042_amends.sql — Amends Tracker (AA Steps 8-9)
--
-- A guided process for identifying people affected by past
-- behavior and planning/tracking amends.
-- ============================================================

CREATE TABLE IF NOT EXISTS amends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,        -- encrypted
  relationship TEXT,                -- encrypted (e.g., "wife", "friend", "coworker")
  what_happened TEXT,               -- encrypted
  what_to_say TEXT,                 -- encrypted
  amend_type TEXT DEFAULT 'direct' CHECK (amend_type IN ('direct', 'indirect', 'living', 'not_appropriate')),
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'planned', 'made', 'in_progress')),
  therapist_reviewed BOOLEAN DEFAULT false,
  notes TEXT,                       -- encrypted
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_amends_user ON amends(user_id, status);

ALTER TABLE amends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own amends" ON amends
  FOR ALL USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 043_daily_inventory.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 043_daily_inventory.sql — Daily Inventory (AA Step 10)
--
-- A quick 2-minute daily self-audit — faster than a full journal.
-- "Continued to take personal inventory and when we were wrong
--  promptly admitted it."
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  went_well TEXT,              -- encrypted
  was_dishonest TEXT,          -- encrypted
  owe_apology TEXT,            -- encrypted
  grateful_for TEXT,           -- encrypted
  overall_rating SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_inventory_user ON daily_inventory(user_id, date DESC);

ALTER TABLE daily_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inventory" ON daily_inventory
  FOR ALL USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 044_values.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 044_values.sql — User values clarification (Miller & Rollnick MI)
--
-- Periodic exercise: users identify and rank core values,
-- then articulate how their rival conflicts with each value.
-- Creates cognitive dissonance — a core Motivational
-- Interviewing technique for change talk.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_name TEXT NOT NULL,
  rank SMALLINT NOT NULL,  -- 1 = most important
  rival_conflict TEXT,     -- encrypted: how this value conflicts with their rival
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, value_name)
);

CREATE INDEX idx_user_values ON user_values(user_id, rank);

ALTER TABLE user_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own values"
  ON user_values FOR ALL
  USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 045_commitments.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 045_commitments.sql — Daily commitment ritual (Gollwitzer)
--
-- Implementation intentions: morning commitment + evening
-- reflection. Based on Gollwitzer's research showing that
-- specific if-then plans dramatically increase goal attainment.
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_intention TEXT,     -- encrypted: "Today I commit to..."
  evening_reflection TEXT,    -- encrypted: "Did I live my intention?"
  intention_met BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_commitments_user ON daily_commitments(user_id, date DESC);

ALTER TABLE daily_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own commitments"
  ON daily_commitments FOR ALL
  USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- 046_coaching_content.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 046 — Pre-generated coaching content library
--
-- Stores warm, Stringer-grounded coaching responses for the
-- hybrid static-first Conversation Coach. Content is served
-- from an in-memory TypeScript constant at runtime; this table
-- exists for future admin editing and analytics.
-- ============================================================

CREATE TABLE IF NOT EXISTS coaching_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,          -- GoalCategory (pornography, gambling, etc.) or 'general'
  tag TEXT,                        -- journal tag (loneliness, stress, etc.) or NULL for category-wide
  phase TEXT NOT NULL CHECK (phase IN ('tributaries', 'longing', 'roadmap', 'opening', 'affirmation')),
  family_dynamic TEXT,             -- optional: rigidity, enmeshment, etc.
  mood_range TEXT,                 -- optional: 'low' (1-2), 'mid' (3), 'high' (4-5)
  content TEXT NOT NULL,           -- the coaching response text
  follow_up_question TEXT,         -- a follow-up question to keep the conversation going
  content_type TEXT DEFAULT 'coach' CHECK (content_type IN ('coach', 'starter', 'affirmation', 'crisis')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coaching_category ON coaching_content(category, phase);
CREATE INDEX idx_coaching_tag ON coaching_content(category, tag, phase);
CREATE INDEX idx_coaching_type ON coaching_content(content_type);


-- ══════════════════════════════════════════════════════════
-- 047_therapist_referrals.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 047 — Therapist Referral Program
-- Therapists who refer clients earn free months of Therapy tier.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.therapist_referrals (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  referral_code     TEXT NOT NULL,
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'signed_up', 'subscribed')),
  reward_granted    BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_therapist_referrals
  ON public.therapist_referrals(therapist_user_id);

CREATE INDEX IF NOT EXISTS idx_therapist_referral_code
  ON public.therapist_referrals(referral_code);

ALTER TABLE public.therapist_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists see own referrals"
  ON public.therapist_referrals
  FOR ALL USING (auth.uid() = therapist_user_id);


-- ══════════════════════════════════════════════════════════
-- 048_org_plans.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 048 — Organization / Church Group Plans
-- Bulk pricing at $7/user/month for churches and recovery orgs.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name        TEXT NOT NULL,
  promo_code      TEXT NOT NULL UNIQUE,   -- e.g., "GRACE-CHURCH-2026"
  price_per_user  NUMERIC(5,2) DEFAULT 7.00,
  max_users       INTEGER DEFAULT 50,
  contact_email   TEXT NOT NULL,
  contact_name    TEXT,
  active          BOOLEAN DEFAULT true,
  users_enrolled  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_plans_code
  ON public.organization_plans(promo_code) WHERE active = true;

ALTER TABLE public.organization_plans ENABLE ROW LEVEL SECURITY;

-- Service role only — no direct user access
-- (No user-facing policies created intentionally)

-- Link users to their organization plan
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS org_plan_id UUID REFERENCES public.organization_plans(id);


-- ══════════════════════════════════════════════════════════
-- 049_feature_flags.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- 049_feature_flags.sql
-- Feature flags table for admin-controlled feature toggles.
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service role only
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Seed default flags
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('coach_enabled', true, 'Enable the Conversation Coach feature'),
  ('community_feed', true, 'Enable the anonymous community feed'),
  ('groups_enabled', true, 'Enable group accountability'),
  ('mentorship_enabled', true, 'Enable mentor matching'),
  ('voice_journal', true, 'Enable voice journaling'),
  ('fasting_challenges', true, 'Enable digital fasting'),
  ('family_systems', true, 'Enable family systems analysis'),
  ('push_notifications', false, 'Enable web push notifications'),
  ('desktop_downloads', false, 'Enable desktop app downloads')
ON CONFLICT (key) DO NOTHING;


-- ══════════════════════════════════════════════════════════
-- 050_grandfather_existing_users.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 050: Grandfather existing users
--
-- All users who signed up before this migration get permanent
-- free access to all features. New users after this date go
-- through the normal trial → paid flow.
-- ============================================================

-- Add grandfathered flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS grandfathered BOOLEAN DEFAULT false;

-- Mark ALL current users as grandfathered
UPDATE users SET grandfathered = true;

-- Future users will have grandfathered = false (the default)


-- ══════════════════════════════════════════════════════════
-- 051_substance_tracking.sql
-- ══════════════════════════════════════════════════════════
-- Stores the specific substances each user is tracking
-- Users with alcohol_drugs or vaping_tobacco in their goals
-- can specify exactly which substances to monitor for
ALTER TABLE users ADD COLUMN IF NOT EXISTS tracked_substances TEXT[] DEFAULT '{}';
-- e.g., ['alcohol', 'marijuana', 'cocaine', 'opioids', 'vaping', 'cigarettes']


-- ══════════════════════════════════════════════════════════
-- 052_onboarding_emails.sql
-- ══════════════════════════════════════════════════════════
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


-- ══════════════════════════════════════════════════════════
-- 053_coach_schedule.sql
-- ══════════════════════════════════════════════════════════
-- Add coach_schedule JSONB column to users table
-- Stores: { hour: 20, minute: 0, frequency: 'weekly', day: 'sunday' }
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_schedule JSONB;


-- ══════════════════════════════════════════════════════════
-- 054_active_sessions.sql
-- ══════════════════════════════════════════════════════════
-- ============================================================
-- Migration 054: Active Sessions — browser/OS/device columns
--
-- Adds parsed device metadata to user_sessions so the settings
-- page can show human-readable session info without parsing
-- user_agent strings on every read.
-- ============================================================

ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS device_name TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,
  ADD COLUMN IF NOT EXISTS os TEXT;

-- Backfill from existing user_agent where possible
UPDATE public.user_sessions
SET
  browser = CASE
    WHEN user_agent ILIKE '%Firefox%' THEN 'Firefox'
    WHEN user_agent ILIKE '%Edg/%' THEN 'Edge'
    WHEN user_agent ILIKE '%OPR/%' OR user_agent ILIKE '%Opera%' THEN 'Opera'
    WHEN user_agent ILIKE '%Chrome%' AND user_agent NOT ILIKE '%Edg/%' THEN 'Chrome'
    WHEN user_agent ILIKE '%Safari%' AND user_agent NOT ILIKE '%Chrome%' THEN 'Safari'
    ELSE 'Unknown'
  END,
  os = CASE
    WHEN user_agent ILIKE '%iPhone%' THEN 'iOS'
    WHEN user_agent ILIKE '%iPad%' THEN 'iPadOS'
    WHEN user_agent ILIKE '%Android%' THEN 'Android'
    WHEN user_agent ILIKE '%Mac OS%' THEN 'macOS'
    WHEN user_agent ILIKE '%Windows%' THEN 'Windows'
    WHEN user_agent ILIKE '%Linux%' THEN 'Linux'
    WHEN user_agent ILIKE '%CrOS%' THEN 'ChromeOS'
    ELSE 'Unknown'
  END,
  device_name = CASE
    WHEN user_agent ILIKE '%iPhone%' THEN 'iPhone'
    WHEN user_agent ILIKE '%iPad%' THEN 'iPad'
    WHEN user_agent ILIKE '%Android%' AND user_agent ILIKE '%Mobile%' THEN 'Android Phone'
    WHEN user_agent ILIKE '%Android%' THEN 'Android Tablet'
    WHEN user_agent ILIKE '%Mac OS%' THEN 'Mac'
    WHEN user_agent ILIKE '%Windows%' THEN 'Windows PC'
    WHEN user_agent ILIKE '%Linux%' THEN 'Linux'
    WHEN user_agent ILIKE '%CrOS%' THEN 'Chromebook'
    ELSE 'Unknown Device'
  END
WHERE browser IS NULL AND user_agent IS NOT NULL;


-- ══════════════════════════════════════════════════════════
-- 055_rls_fixes.sql
-- ══════════════════════════════════════════════════════════
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


