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
