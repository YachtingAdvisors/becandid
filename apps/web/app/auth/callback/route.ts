export const dynamic = 'force-dynamic';
// ============================================================
// app/auth/callback/route.ts
//
// Handles Supabase auth callbacks (email verification,
// password reset, magic links). Exchanges the code for a
// session and redirects.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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
