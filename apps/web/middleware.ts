// ============================================================
// Be Candid — Middleware
// Auth redirects, security headers, API rate limiting,
// timing-safe cron auth, body size limits
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/', '/invite', '/_next', '/favicon', '/legal/', '/families', '/pricing', '/guardian'];
const CRON_PATHS = ['/api/cron'];
const PUBLIC_API_PATHS = ['/api/partners/invite'];

// ─── Security Headers ────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    // Next.js requires 'unsafe-inline' for scripts; 'unsafe-eval' only in dev
    process.env.NODE_ENV === 'production'
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
};

// ─── IP Rate Limiter (in middleware scope) ────────────────────
const IP_STORE = new Map<string, { count: number; resetAt: number }>();
const IP_WINDOW_MS = 60_000;
const IP_MAX = 120; // 120 requests per minute per IP

function checkIpRate(ip: string): boolean {
  const now = Date.now();
  const entry = IP_STORE.get(ip);
  if (!entry || now > entry.resetAt) {
    IP_STORE.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (entry.count >= IP_MAX) return false;
  entry.count++;
  return true;
}

// Clean stale entries on each invocation (Edge Runtime doesn't support setInterval)
function cleanStaleEntries() {
  const now = Date.now();
  if (IP_STORE.size > 1000) {
    for (const [key, val] of IP_STORE) {
      if (now > val.resetAt) IP_STORE.delete(key);
    }
  }
}

// ─── Timing-Safe Comparison ──────────────────────────────────
function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i % (a.length || 1)) ?? 0) ^ (b.charCodeAt(i % (b.length || 1)) ?? 0);
  }
  return result === 0;
}

function applyHeaders(response: NextResponse, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

function jsonError(msg: string, status: number) {
  return new NextResponse(
    JSON.stringify({ error: msg }),
    { status, headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS } }
  );
}

// ─── Middleware ───────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clean IP store periodically
  cleanStaleEntries();

  // Root landing page is always public
  if (pathname === '/') {
    const response = NextResponse.next();
    applyHeaders(response, SECURITY_HEADERS);
    return response;
  }

  // ── 1. IP rate limit on all API requests ────────────────
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';

    if (!checkIpRate(ip)) {
      return jsonError('Too many requests. Please try again later.', 429);
    }

    // Block oversized bodies (2MB)
    const cl = request.headers.get('content-length');
    if (cl && parseInt(cl) > 2 * 1024 * 1024) {
      return jsonError('Request body too large', 413);
    }

    // ── CSRF: Origin check for state-changing requests ───
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Skip CSRF for webhook endpoints (Stripe, etc.)
      const isWebhook = pathname.startsWith('/api/webhooks/');
      if (!isWebhook) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
        let appHost = '';
        try { if (appUrl) appHost = new URL(appUrl).host; } catch { /* ignore invalid URL */ }

        // Allow requests with matching origin, matching referer, or same-origin (no origin header for same-origin in some browsers)
        const originHost = origin ? new URL(origin).host : null;
        const refererHost = referer ? new URL(referer).host : null;

        const originOk = !origin || originHost === appHost || originHost === request.nextUrl.host;
        const refererOk = !referer || refererHost === appHost || refererHost === request.nextUrl.host;

        // If both headers are present and neither matches, block the request
        if (origin && !originOk) {
          return jsonError('Forbidden — origin mismatch', 403);
        }
        if (!origin && referer && !refererOk) {
          return jsonError('Forbidden — referer mismatch', 403);
        }
      }
    }
  }

  // ── 2. Cron auth (timing-safe) ──────────────────────────
  if (CRON_PATHS.some(p => pathname.startsWith(p))) {
    const secret = request.headers.get('authorization')?.replace('Bearer ', '')
      ?? request.headers.get('x-cron-secret') ?? '';
    const expected = process.env.CRON_SECRET ?? '';

    if (!expected || !timingSafeEqual(secret, expected)) {
      return jsonError('Unauthorized', 401);
    }

    const response = NextResponse.next();
    applyHeaders(response, SECURITY_HEADERS);
    return response;
  }

  // ── 3. Public paths ─────────────────────────────────────
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    const response = NextResponse.next();
    applyHeaders(response, SECURITY_HEADERS);
    return response;
  }

  // ── 4. User auth via Supabase ───────────────────────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated → redirect or 401
  if (!user) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/partner') || pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('redirect', pathname);
      const redir = NextResponse.redirect(url);
      applyHeaders(redir, SECURITY_HEADERS);
      return redir;
    }

    if (pathname.startsWith('/api/') && !PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
      return jsonError('Unauthorized', 401);
    }
  }

  // Authenticated → redirect away from auth pages
  if (user && pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const redir = NextResponse.redirect(url);
    applyHeaders(redir, SECURITY_HEADERS);
    return redir;
  }

  // ── 5. Track last activity (debounced via cookie, every 5min) ──
  if (user && !pathname.startsWith('/api/')) {
    const lastPing = request.cookies.get('bc_active')?.value;
    const now = Date.now();
    if (!lastPing || now - parseInt(lastPing) > 5 * 60 * 1000) {
      response.cookies.set('bc_active', String(now), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 min
        path: '/',
      });
      // Fire-and-forget — don't block the response
      // The sessions API updates last_active_at
      const origin = request.nextUrl.origin;
      fetch(`${origin}/api/auth/sessions`, {
        method: 'POST',
        headers: {
          cookie: request.headers.get('cookie') ?? '',
          'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
          'user-agent': request.headers.get('user-agent') ?? '',
        },
      }).catch(() => {});
    }
  }

  // ── 6. Apply security headers ──────────────────────────
  applyHeaders(response, SECURITY_HEADERS);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
