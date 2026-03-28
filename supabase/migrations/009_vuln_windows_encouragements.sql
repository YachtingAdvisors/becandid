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
