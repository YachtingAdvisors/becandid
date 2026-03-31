// ============================================================
// Be Candid — Middleware (Edge Runtime compatible)
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Paths that never require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/',
  '/invite',
  '/legal/',
  '/families',
  '/pricing',
  '/guardian',
  '/onboarding',
];

const CRON_PATHS = ['/api/cron'];
const PUBLIC_API_PATHS = ['/api/partners/invite', '/api/webhooks/'];

// ─── Security Headers ────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

function applyHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

function jsonError(msg: string, status: number) {
  return new NextResponse(
    JSON.stringify({ error: msg }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

// ─── Timing-Safe Comparison ──────────────────────────────────
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Middleware ───────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin') || '';

    // ── 0. CORS preflight for Chrome extension ─────────────
    if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
      const res = new NextResponse(null, { status: 204 });
      if (origin.startsWith('chrome-extension://')) {
        res.headers.set('Access-Control-Allow-Origin', origin);
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.headers.set('Access-Control-Max-Age', '86400');
      }
      return res;
    }

    // ── 1. Public paths — skip auth entirely ────────────────
    if (pathname === '/') {
      const response = NextResponse.next();
      applyHeaders(response);
      return response;
    }

    if (PUBLIC_PATHS.some(p => p !== '/' && pathname.startsWith(p))) {
      const response = NextResponse.next();
      applyHeaders(response);
      return response;
    }

    // ── 2. Cron auth ────────────────────────────────────────
    if (CRON_PATHS.some(p => pathname.startsWith(p))) {
      const secret = request.headers.get('authorization')?.replace('Bearer ', '')
        ?? request.headers.get('x-cron-secret') ?? '';
      const expected = process.env.CRON_SECRET ?? '';

      if (!expected || !timingSafeEqual(secret, expected)) {
        return jsonError('Unauthorized', 401);
      }

      const response = NextResponse.next();
      applyHeaders(response);
      return response;
    }

    // ── 3. Public API paths ─────────────────────────────────
    if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
      const response = NextResponse.next();
      applyHeaders(response);
      return response;
    }

    // ── 4. Check Supabase env vars exist ────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Env vars missing — let the request through rather than crash
      console.error('Middleware: Missing Supabase env vars');
      const response = NextResponse.next();
      applyHeaders(response);
      return response;
    }

    // ── 5. User auth via Supabase ───────────────────────────
    let response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: true,
              sameSite: 'lax' as const,
            });
          });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // API requests with Bearer token bypass cookie auth (extension/API clients)
    if (!user && pathname.startsWith('/api/') && request.headers.get('authorization')?.startsWith('Bearer ')) {
      // Let the route handler validate the Bearer token via authFromRequest
      const bearerResponse = NextResponse.next({ request });
      applyHeaders(bearerResponse);
      if (origin.startsWith('chrome-extension://')) {
        bearerResponse.headers.set('Access-Control-Allow-Origin', origin);
        bearerResponse.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      }
      return bearerResponse;
    }

    // Unauthenticated → redirect or 401
    if (!user) {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/partner')) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/signin';
        url.searchParams.set('redirect', pathname);
        const redir = NextResponse.redirect(url);
        applyHeaders(redir);
        return redir;
      }

      if (pathname.startsWith('/api/')) {
        return jsonError('Unauthorized', 401);
      }
    }

    // ── 6. Apply security headers and CORS ────────────────
    applyHeaders(response);
    if (origin.startsWith('chrome-extension://') && pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    }
    return response;

  } catch (error) {
    // Never crash — let the request through if middleware fails
    console.error('Middleware error:', error);
    const response = NextResponse.next();
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
