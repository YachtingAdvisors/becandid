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
