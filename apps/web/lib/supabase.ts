// ============================================================
// Be Candid — Supabase Client Setup
// Three clients for different contexts:
// - createClient(): browser-side (uses anon key)
// - createServerSupabaseClient(): server components/routes (uses cookies)
// - createServiceClient(): service role (bypasses RLS)
// ============================================================

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generateReferralCode } from './referral';

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
// Single source of truth for profile creation. Signup may fail to
// create the profile (cookie race or email-confirmation pending),
// so this runs again on the auth callback and on every dashboard
// page load as a self-heal.
export async function ensureUserRow(
  db: ReturnType<typeof createServiceClient>,
  user: { id: string; email?: string; user_metadata?: Record<string, any> },
) {
  const { data } = await db.from('users').select('*').eq('id', user.id).maybeSingle();
  if (data) return data;

  const trialEnds = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
  await db.from('users').insert({
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name ?? 'User',
    referral_code: generateReferralCode(),
    subscription_status: 'trialing',
    trial_ends_at: trialEnds,
  });

  const { data: created } = await db.from('users').select('*').eq('id', user.id).single();
  return created;
}
