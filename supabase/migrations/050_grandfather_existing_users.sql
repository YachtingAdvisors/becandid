-- ============================================================
-- Migration 050: Grandfather existing users
--
-- All users who signed up before this migration get permanent
-- free access to all features. New users after this date go
-- through the normal trial → paid flow.
-- ============================================================

-- Add grandfathered flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS grandfathered BOOLEAN DEFAULT false;

-- Mark ALL current users as grandfathered
UPDATE users SET grandfathered = true;

-- Future users will have grandfathered = false (the default)
