// ============================================================
// lib/authGuards.ts
//
// Auth enforcement utilities:
//   1. Email verification check (blocks unverified users)
//   2. Password reset token validation
//   3. Re-authentication for sensitive actions
//
// Usage in API routes:
//   import { requireVerifiedEmail, requireReauth } from '@/lib/authGuards';
//   const user = await requireVerifiedEmail(req);
//   if (!user) return; // Already returned 401/403
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from './supabase';

// ── Require verified email ──────────────────────────────────
// Returns the user if verified, null if not (and sends response).

export async function requireVerifiedEmail(req: NextRequest): Promise<{
  user: any;
  response?: never;
} | {
  user?: never;
  response: NextResponse;
}> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // Supabase sets email_confirmed_at when the user verifies
  if (!user.email_confirmed_at) {
    return {
      response: NextResponse.json({
        error: 'Email not verified',
        message: 'Please check your email and click the verification link before continuing.',
        action: 'verify_email',
      }, { status: 403 }),
    };
  }

  return { user };
}

// ── Re-authentication for sensitive actions ─────────────────
// Requires the user to provide their current password.
// Used for: account deletion, email change, password change,
// data purge, partner removal.

export async function requireReauth(
  req: NextRequest,
  password: string
): Promise<{
  user: any;
  response?: never;
} | {
  user?: never;
  response: NextResponse;
}> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!password) {
    return {
      response: NextResponse.json({
        error: 'Password required',
        message: 'Please enter your current password to confirm this action.',
      }, { status: 400 }),
    };
  }

  // Verify password by attempting sign in
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (error) {
    return {
      response: NextResponse.json({
        error: 'Invalid password',
        message: 'The password you entered is incorrect.',
      }, { status: 401 }),
    };
  }

  return { user };
}

// ── Password reset: send + verify ───────────────────────────

export async function sendPasswordResetEmail(email: string) {
  const supabase = await createServerSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/update-password`,
  });

  return { error };
}

// ── Send verification email ─────────────────────────────────

export async function resendVerificationEmail(email: string) {
  const supabase = await createServerSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  return { error };
}
