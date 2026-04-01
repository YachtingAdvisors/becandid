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
