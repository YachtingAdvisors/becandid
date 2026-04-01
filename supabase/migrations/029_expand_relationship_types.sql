-- ============================================================
-- 029 — Expand relationship type options
-- ============================================================
-- Add 'therapist' and 'pastor' to allowed relationship types

-- Remove restrictive CHECK constraints entirely — allow any text value
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_relationship_type_check;
ALTER TABLE public.partners DROP CONSTRAINT IF EXISTS partners_relationship_check;
