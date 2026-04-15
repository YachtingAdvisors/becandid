export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/token-login?token=xxx&redirect=/dashboard
 *
 * Accepts a Supabase access token (from desktop app or extension),
 * establishes a proper Supabase session via cookies, and redirects.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';

function getSafeRedirectPath(rawRedirect: string | null): string {
  if (!rawRedirect) return '/dashboard';
  if (!rawRedirect.startsWith('/')) return '/dashboard';
  if (rawRedirect.startsWith('//')) return '/dashboard';
  return rawRedirect;
}

export async function GET(req: NextRequest) {
  // IP-based rate limit for token exchange (no authenticated user yet)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const blocked = await checkDistributedRateLimit({
    scope: 'token-login',
    key: ip,
    max: 10,
    windowMs: 900_000,
  });
  if (blocked) return blocked;

  const token = req.nextUrl.searchParams.get('token');
  const refresh = req.nextUrl.searchParams.get('refresh') || '';
  const redirect = getSafeRedirectPath(req.nextUrl.searchParams.get('redirect'));

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  try {
    const redirectUrl = new URL(redirect, req.nextUrl.origin);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');

    // Create a Supabase client that writes cookies to the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60, // 1 hour
              });
            });
          },
        },
      }
    );

    // Look up the refresh token from the desktop app's stored session
    // The access token alone can establish the session
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });

    if (error || !data.session) {
      // Try getUser as fallback to validate the token
      const { data: userData } = await supabase.auth.getUser(token);
      if (!userData.user) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
}
