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
  '/r/',
  '/share/',
  '/blog',
  '/therapists',
  '/methodology',
  '/why-becandid',
  '/download',
  '/donate',
  '/pause',
  '/account',
  '/assessment',
  '/org',
  '/about',
  '/offline',
];

const CRON_PATHS = ['/api/cron'];
const PUBLIC_API_PATHS = ['/api/partners/invite', '/api/partners/accept', '/api/webhooks/', '/api/og', '/api/auth/check-lockout', '/api/auth/record-attempt', '/api/auth/sessions'];

// ─── Content Security Policy ─────────────────────────────────
function buildCSP(): string {
  const isDev = process.env.NODE_ENV === 'development';
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://js.stripe.com`
    : `'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://upload.wikimedia.org https://images.unsplash.com https://images.gr-assets.com https://i.gr-assets.com https://*.supabase.co`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com`,
    `frame-src https://js.stripe.com https://hooks.stripe.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

// ─── Security Headers ────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': buildCSP(),
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

// ─── Chrome Extension Origin Check ──────────────────────────
// TODO: Set ALLOWED_EXTENSION_ID to the published extension's ID to
// restrict CORS to only the official Be Candid extension.
function isAllowedExtensionOrigin(origin: string): boolean {
  if (!origin.startsWith('chrome-extension://')) return false;
  const allowedId = process.env.ALLOWED_EXTENSION_ID;
  if (allowedId) {
    return origin === `chrome-extension://${allowedId}`;
  }
  // No explicit ID configured — block in production, allow in dev
  if (process.env.NODE_ENV === 'production') return false;
  return true;
}

// ─── Middleware ───────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get('origin') || '';

    // ── 0. CORS preflight for Chrome extension ─────────────
    if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
      const res = new NextResponse(null, { status: 204 });
      if (isAllowedExtensionOrigin(origin)) {
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
      if (process.env.NODE_ENV === 'production') {
        console.error('Middleware: Missing required Supabase environment variables');
        return new NextResponse('Internal Server Error', { status: 500 });
      }
      return NextResponse.next();
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
              maxAge: 60 * 60 * 24 * 30, // 30 days — persist across browser restarts
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
      if (isAllowedExtensionOrigin(origin)) {
        bearerResponse.headers.set('Access-Control-Allow-Origin', origin);
        bearerResponse.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      }
      return bearerResponse;
    }

    // Unauthenticated → redirect or 401
    if (!user) {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/partner') || pathname.startsWith('/download') || pathname.startsWith('/admin')) {
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

    // ── 5b. MFA enforcement — redirect to challenge if aal2 required ──
    if (user && (pathname.startsWith('/dashboard') || pathname.startsWith('/partner'))) {
      // Skip the MFA challenge page itself to avoid redirect loops
      if (!pathname.startsWith('/auth/')) {
        try {
          const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aal.data?.currentLevel === 'aal1' && aal.data?.nextLevel === 'aal2') {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/mfa-verify';
            url.searchParams.set('redirect', pathname);
            const redir = NextResponse.redirect(url);
            applyHeaders(redir);
            return redir;
          }
        } catch {
          // Fail open — don't block if MFA check fails
        }
      }
    }

    // ── 6. Apply security headers and CORS ────────────────
    applyHeaders(response);
    if (isAllowedExtensionOrigin(origin) && pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    }
    return response;

  } catch (error) {
    // Never crash — let the request through if middleware fails
    console.error('Middleware error:', error);
    const response = NextResponse.next();
    applyHeaders(response);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
