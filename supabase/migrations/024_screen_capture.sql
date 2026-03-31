-- Screen capture desktop agent settings
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS screen_capture_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS screen_capture_interval INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS screen_capture_change_threshold FLOAT DEFAULT 0.10;
