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
