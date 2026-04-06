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
