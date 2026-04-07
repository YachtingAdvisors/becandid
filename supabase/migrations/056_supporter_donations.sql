-- 034: Add supporter/donation columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_supporter     BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS supporter_until  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_donated    INTEGER      DEFAULT 0;
