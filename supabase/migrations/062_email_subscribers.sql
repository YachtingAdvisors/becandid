-- Email subscribers for blog lead capture
create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'blog',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Allow service role full access (API route uses service client)
alter table public.email_subscribers enable row level security;

-- Index for admin queries
create index if not exists idx_email_subscribers_source on public.email_subscribers(source);
create index if not exists idx_email_subscribers_subscribed_at on public.email_subscribers(subscribed_at desc);
