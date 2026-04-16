-- ============================================================
-- 070_admin_roles.sql
-- Add a role-backed admin authorization source for privileged
-- routes so admin access no longer depends on email allowlists.
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS platform_role TEXT NOT NULL DEFAULT 'user'
  CHECK (platform_role IN ('user', 'admin'));

UPDATE public.users
SET platform_role = 'admin'
WHERE lower(email) IN (
  'slaser90@gmail.com',
  'shawn@becandid.io'
);

CREATE INDEX IF NOT EXISTS idx_users_platform_role
  ON public.users(platform_role);

COMMENT ON COLUMN public.users.platform_role IS
  'Application-level role used for privileged admin access checks.';
