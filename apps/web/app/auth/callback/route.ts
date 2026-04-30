export const dynamic = 'force-dynamic';
// ============================================================
// app/auth/callback/route.ts
//
// Handles Supabase auth callbacks (email verification,
// password reset, magic links). Exchanges the code for a
// session and redirects.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import { applyReferralReward } from '@/lib/referral';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next') || '/dashboard';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';
  const referralCode = url.searchParams.get('ref') || '';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Self-heal: signup-time profile creation can race with cookie
      // propagation or be skipped entirely when email confirmation is
      // required. Create the profile row here once the session exists.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const db = createServiceClient();
          const { data: existing } = await db
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          await ensureUserRow(db, user);

          // Apply referral reward only if this is a fresh row AND a
          // referral code was carried through the verification link.
          if (!existing && referralCode) {
            const { data: referrer } = await db
              .from('users')
              .select('id')
              .eq('referral_code', referralCode)
              .maybeSingle();
            if (referrer && referrer.id !== user.id) {
              await db.from('users').update({ referred_by: referrer.id }).eq('id', user.id);
              await applyReferralReward(db, referrer.id, user.id, referralCode);
            }
          }
        }
      } catch (err) {
        // Don't block the redirect — dashboard pages also self-heal.
        console.error('[auth/callback] Profile self-heal failed:', err);
      }

      return NextResponse.redirect(new URL(next, req.url));
    }
  }

  // If code exchange failed, redirect to signin with error
  return NextResponse.redirect(
    new URL('/auth/signin?error=auth_callback_failed', req.url)
  );
}

// ============================================================
// app/api/auth/resend-verification/route.ts
//
// Resends the email verification link.
// Rate limited: max 3 per hour per email.
// ============================================================

// NOTE: This is a separate file in the actual app structure.
// Included here for packaging convenience.
// Move to: app/api/auth/resend-verification/route.ts

/*
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });

  // Always return success to prevent email enumeration
  return NextResponse.json({ sent: true });
}
*/
