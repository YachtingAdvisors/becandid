-- Issue #7: Add payment_failed_at column for Stripe dunning state machine
-- Used by the invoice.payment_failed webhook handler to track
-- when the first payment failure occurred, enabling time-based
-- escalation (3-day follow-up, 7-day downgrade).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_failed_at timestamptz;
