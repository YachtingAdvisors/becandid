// ============================================================
// Be Candid — Supabase Client Setup
// Three clients for different contexts:
// - createClient(): browser-side (uses anon key)
// - createServerSupabaseClient(): server components/routes (uses cookies)
// - createServiceClient(): service role (bypasses RLS)
// ============================================================

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ─── Browser Client ──────────────────────────────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Server Client (respects RLS via cookie auth) ────────────
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can't set cookies in Server Components — only Route Handlers
          }
        },
      },
    }
  );
}

// ─── Service Role Client (bypasses RLS — server only) ────────
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Ensure public.users row exists ─────────────────────────
// Signup profile creation is fire-and-forget and may not have
// completed when the user first reaches the dashboard.
// Call this before any query that depends on the users table.
export async function ensureUserRow(
  db: ReturnType<typeof createServiceClient>,
  user: { id: string; email?: string; user_metadata?: Record<string, any> },
) {
  const { data } = await db.from('users').select('*').eq('id', user.id).single();
  if (data) return data;

  const trialEnds = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  await db.from('users').insert({
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name ?? 'User',
    subscription_status: 'trialing',
    trial_ends_at: trialEnds,
  });

  const { data: created } = await db.from('users').select('*').eq('id', user.id).single();
  return created;
}
