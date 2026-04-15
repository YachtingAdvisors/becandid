-- ============================================================
-- 068_heartbeat_email_hash.sql
--
-- Stores a SHA-256 hash of the email that sent the most recent
-- desktop heartbeat. The web dashboard compares its own hash
-- to detect with certainty that a different account is logged
-- into the desktop app. Raw emails are never stored or compared.
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_heartbeat_email_hash text;

COMMENT ON COLUMN users.last_heartbeat_email_hash IS
  'SHA-256(lower(email)) of the account that last POSTed a heartbeat. '
  'Used to detect desktop/web account mismatch without leaking email addresses.';
