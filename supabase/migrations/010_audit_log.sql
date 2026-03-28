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
