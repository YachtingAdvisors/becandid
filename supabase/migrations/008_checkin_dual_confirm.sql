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
