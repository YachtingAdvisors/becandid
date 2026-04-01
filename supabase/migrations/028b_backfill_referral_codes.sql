-- ============================================================
-- 028b — Backfill referral codes for existing users
-- ============================================================
-- Generates a unique 8-char hex code for every user that doesn't have one yet.

UPDATE public.users
SET referral_code = substr(md5(random()::text || id::text || now()::text), 1, 8)
WHERE referral_code IS NULL;
