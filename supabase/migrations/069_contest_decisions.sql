-- ============================================================
-- 069_contest_decisions.sql
--
-- Adds contest decision tracking to events and a
-- false_positive_rules table for automatic suppression of
-- previously-contested (and accepted) flags.
-- ============================================================

-- ── Contest decision columns on events ─────────────────────

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS contest_decision TEXT
    CHECK (contest_decision IN ('accepted', 'rejected')),
  ADD COLUMN IF NOT EXISTS contest_decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contest_decided_by UUID;

-- ── False positive rules table ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.false_positive_rules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_type      TEXT NOT NULL CHECK (match_type IN ('app_name', 'domain', 'url_hash', 'category_app')),
  match_value     TEXT NOT NULL,
  category        TEXT,
  source_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, match_type, match_value, category)
);

CREATE INDEX idx_fpr_user ON public.false_positive_rules(user_id);

-- ── RLS ────────────────────────────────────────────────────

ALTER TABLE public.false_positive_rules ENABLE ROW LEVEL SECURITY;

-- Users can read their own rules
CREATE POLICY "Users can view own false positive rules"
  ON public.false_positive_rules
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can insert (via admin API)
-- No INSERT policy for authenticated users — service_role
-- bypasses RLS automatically.
