-- ============================================================
-- 039: Therapist Directory
-- Allow therapists to opt into being discoverable
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_therapist BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS therapist_profile JSONB;
-- therapist_profile schema:
-- {
--   specialty: string[],
--   bio: string,
--   location: string,
--   insurance: string[],
--   website: string,
--   listed: boolean
-- }
