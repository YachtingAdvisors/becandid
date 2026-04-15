CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.partners
  ALTER COLUMN invite_token DROP NOT NULL;

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;

ALTER TABLE public.guardians
  ADD COLUMN IF NOT EXISTS guardian_email TEXT,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;

ALTER TABLE public.therapist_connections
  ALTER COLUMN invite_token DROP NOT NULL;

ALTER TABLE public.therapist_connections
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;

UPDATE public.guardians
SET guardian_email = lower(guardian_email)
WHERE guardian_email IS NOT NULL;

UPDATE public.partners
SET
  invite_token = NULL,
  invite_expires_at = NULL
WHERE status <> 'pending';

UPDATE public.guardians
SET
  invite_token = NULL,
  invite_expires_at = NULL
WHERE status <> 'pending';

UPDATE public.therapist_connections
SET
  invite_token = NULL,
  invite_expires_at = NULL
WHERE status <> 'pending';

UPDATE public.partners
SET
  invite_token = encode(digest(invite_token, 'sha256'), 'hex'),
  invite_expires_at = COALESCE(invite_expires_at, invited_at + interval '14 days')
WHERE invite_token IS NOT NULL
  AND status = 'pending'
  AND invite_token !~ '^[0-9a-f]{64}$';

UPDATE public.guardians
SET
  invite_token = encode(digest(invite_token, 'sha256'), 'hex'),
  invite_expires_at = COALESCE(invite_expires_at, invited_at + interval '14 days')
WHERE invite_token IS NOT NULL
  AND status = 'pending'
  AND invite_token !~ '^[0-9a-f]{64}$';

UPDATE public.therapist_connections
SET
  invite_token = encode(digest(invite_token, 'sha256'), 'hex'),
  invite_expires_at = COALESCE(invite_expires_at, created_at + interval '14 days')
WHERE invite_token IS NOT NULL
  AND status = 'pending'
  AND invite_token !~ '^[0-9a-f]{64}$';

ALTER TABLE public.partners
  DROP CONSTRAINT IF EXISTS partners_invite_token_key;

ALTER TABLE public.guardians
  DROP CONSTRAINT IF EXISTS guardians_invite_token_key;

ALTER TABLE public.therapist_connections
  DROP CONSTRAINT IF EXISTS therapist_connections_invite_token_key;

DROP INDEX IF EXISTS public.idx_partners_invite_token;
DROP INDEX IF EXISTS public.idx_therapist_token;

CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_invite_token_pending
  ON public.partners (invite_token)
  WHERE invite_token IS NOT NULL AND status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_guardians_invite_token_pending
  ON public.guardians (invite_token)
  WHERE invite_token IS NOT NULL AND status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_therapist_token_pending
  ON public.therapist_connections (invite_token)
  WHERE invite_token IS NOT NULL AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_partners_invite_expires_at
  ON public.partners (invite_expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_guardians_invite_expires_at
  ON public.guardians (invite_expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_therapist_invite_expires_at
  ON public.therapist_connections (invite_expires_at)
  WHERE status = 'pending';
