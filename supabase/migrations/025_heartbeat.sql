-- Desktop app heartbeat tracking
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ DEFAULT NULL;
