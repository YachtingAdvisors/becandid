export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/token-login?token=xxx&redirect=/dashboard
 *
 * Accepts a Supabase access token (from desktop app or extension),
 * sets it as a session cookie, and redirects to the dashboard.
 * This allows "Open Dashboard" from the desktop app to auto-login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const redirect = req.nextUrl.searchParams.get('redirect') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Validate the token
  try {
    const db = createServiceClient();
    const { data: { user }, error } = await db.auth.getUser(token);

    if (error || !user) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Set Supabase auth cookies by creating a response with the session
    const redirectUrl = new URL(redirect, req.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set the access token as a cookie that Supabase SSR client can read
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60, // 1 hour
    };

    // Supabase SSR expects these cookie names
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+?)\.supabase/)?.[1] || '';
    response.cookies.set(`sb-${projectRef}-auth-token`, JSON.stringify({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: '',
      user,
    }), cookieOptions);

    return response;
  } catch {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
}
