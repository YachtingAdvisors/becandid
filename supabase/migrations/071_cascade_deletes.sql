-- ============================================================
-- Be Candid — Migration 071: CASCADE Deletes
--
-- Adds ON DELETE CASCADE to all foreign keys referencing users
-- that were missing it. This lets the database handle cascading
-- deletes when a user row is removed, instead of requiring
-- manual multi-table deletion in application code.
-- ============================================================

-- ─── encouragements.from_user_id ─────────────────────────────
ALTER TABLE public.encouragements
  DROP CONSTRAINT IF EXISTS encouragements_from_user_id_fkey;

ALTER TABLE public.encouragements
  ADD CONSTRAINT encouragements_from_user_id_fkey
  FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ─── encouragements.to_user_id ───────────────────────────────
ALTER TABLE public.encouragements
  DROP CONSTRAINT IF EXISTS encouragements_to_user_id_fkey;

ALTER TABLE public.encouragements
  ADD CONSTRAINT encouragements_to_user_id_fkey
  FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ─── check_ins.partner_user_id ───────────────────────────────
-- When a user is deleted, null out their partner references on
-- check-ins rather than cascading (the check-in belongs to the
-- other user). Use SET NULL to preserve the primary user's data.
ALTER TABLE public.check_ins
  DROP CONSTRAINT IF EXISTS check_ins_partner_user_id_fkey;

ALTER TABLE public.check_ins
  ADD CONSTRAINT check_ins_partner_user_id_fkey
  FOREIGN KEY (partner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
