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
