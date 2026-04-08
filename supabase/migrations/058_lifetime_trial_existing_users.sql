-- Grant lifetime trial to all existing users registered before this migration.
-- Sets trial_ends_at to 2099-12-31 and ensures subscription_status is 'trialing'.
UPDATE public.users
SET
  trial_ends_at = '2099-12-31T23:59:59Z',
  subscription_status = 'trialing'
WHERE created_at < NOW();
