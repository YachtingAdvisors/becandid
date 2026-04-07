-- Add dashboard_layout JSONB column for user-customizable widget order and visibility
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL;

COMMENT ON COLUMN public.users.dashboard_layout IS 'User-customizable dashboard widget order and hidden widgets. Schema: { order: string[], hidden: string[] }';
