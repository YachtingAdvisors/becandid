export const dynamic = 'force-dynamic';
// POST/GET /api/cron/google-indexing
// Daily cron: fetches sitemap, checks which URLs aren't indexed,
// submits up to 10 per day via Google Indexing API.
// URLs are ranked by SEO value so highest-impact pages get indexed first.
//
// Required env vars:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
//   GOOGLE_SERVICE_ACCOUNT_KEY — private key (PEM, newlines as \n)
//   NEXT_PUBLIC_APP_URL — base URL (https://becandid.io)

import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/cronAuth';
import { createServiceClient } from '@/lib/supabase';

const DAILY_LIMIT = 10;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

/* ------------------------------------------------------------------ */
/*  SEO value scoring — highest-value pages get submitted first       */
/* ------------------------------------------------------------------ */

// Blog slugs that target high-intent competitive keywords
const HIGH_VALUE_SLUGS = new Set([
  'covenant-eyes-alternatives',
  'be-candid-vs-covenant-eyes',
  'best-accountability-apps-2026',
  'covenant-eyes-review-2026',
  'accountable2you-alternatives',
  'switch-from-covenant-eyes-to-be-candid',
  'ever-accountable-vs-be-candid',
  'best-porn-blocker-for-iphone',
  'accountability-partner-app',
  'bark-vs-be-candid-for-teens',
  'why-covenant-eyes-fails-accountability-software-truth',
  'best-christian-accountability-apps-2026',
  'should-christians-use-accountability-apps',
]);

// Statistics pages — high search volume, link-magnet content
const STATISTICS_SLUGS = new Set([
  'pornography-statistics-2026',
  'gambling-addiction-statistics-2026',
  'social-media-addiction-statistics-2026',
  'alcohol-substance-addiction-statistics-2026',
  'ai-chatbot-addiction-statistics-2026',
  'eating-disorder-statistics-2026',
  'gaming-addiction-statistics-2026',
]);

// How-to / problem-awareness posts — mid-funnel search intent
const HOW_TO_SLUGS = new Set([
  'how-to-break-phone-addiction',
  'how-to-stop-doomscrolling',
  'how-to-talk-to-partner-about-porn-addiction',
  'signs-husband-addicted-phone-what-to-do',
  'husband-phone-addiction-signs',
  'signs-youre-a-workaholic',
  'signs-you-need-accountability-partner',
  'am-i-having-emotional-affair',
  'self-harm-recovery-tools',
  'social-media-addiction-adults',
  'ai-chatbot-addiction',
  'revenge-bedtime-procrastination',
  'breaking-the-shame-cycle',
  'gambling-addiction-digital-age',
  'procrastination-shame-cycle',
]);

function seoScore(url: string): number {
  const path = url.replace(BASE_URL, '');

  // Tier 1 (100): Homepage & primary conversion pages
  if (path === '' || path === '/') return 100;
  if (path === '/assessment') return 98;
  if (path === '/pricing') return 97;

  // Tier 2 (90): Core marketing pages with strong keyword targets
  if (path === '/methodology') return 92;
  if (path === '/why-becandid') return 91;
  if (path === '/therapists') return 90;

  // Tier 3 (80-85): Competitor comparison & high-intent blog posts
  const slug = path.replace('/blog/', '');
  if (path.startsWith('/blog/') && HIGH_VALUE_SLUGS.has(slug)) return 85;

  // Tier 4 (75): Statistics / link-magnet content
  if (path.startsWith('/blog/') && STATISTICS_SLUGS.has(slug)) return 75;

  // Tier 5 (70): Secondary conversion & audience pages
  if (path === '/blog') return 72;
  if (path === '/families') return 71;
  if (path === '/org') return 70;
  if (path === '/pricing/groups') return 70;
  if (path === '/download') return 70;

  // Tier 6 (60-65): How-to & problem-awareness blog posts
  if (path.startsWith('/blog/') && HOW_TO_SLUGS.has(slug)) return 65;

  // Tier 7 (50): Remaining blog posts (topical authority)
  if (path.startsWith('/blog/')) return 50;

  // Tier 8 (40): About, donate, help pages
  if (path === '/about') return 42;
  if (path === '/donate') return 40;
  if (path === '/help/mac-setup') return 40;

  // Tier 9 (20): Legal pages (low search value but needed for trust)
  if (path.startsWith('/legal/')) return 20;

  // Default: anything else
  return 30;
}

/* ------------------------------------------------------------------ */
/*  Google OAuth2 token via service account JWT                       */
/* ------------------------------------------------------------------ */

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) throw new Error('Missing Google service account credentials');

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const jwt = `${header}.${payload}.${arrayBufferToBase64Url(signature)}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* ------------------------------------------------------------------ */
/*  Submit a URL to Google Indexing API                               */
/* ------------------------------------------------------------------ */

async function submitUrl(url: string, token: string): Promise<{ url: string; ok: boolean; status: number }> {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return { url, ok: res.ok, status: res.status };
}

/* ------------------------------------------------------------------ */
/*  Build the full URL list (static + sitemap blog posts)             */
/* ------------------------------------------------------------------ */

async function getSitemapUrls(): Promise<string[]> {
  const staticPages = [
    '',
    '/assessment',
    '/pricing',
    '/methodology',
    '/therapists',
    '/blog',
    '/why-becandid',
    '/org',
    '/pricing/groups',
    '/families',
    '/download',
    '/about',
    '/donate',
    '/help/mac-setup',
    '/legal/privacy',
    '/legal/terms',
    '/legal/therapist-dpa',
  ];

  const urls = staticPages.map(p => `${BASE_URL}${p}`);

  // Also fetch blog post slugs from the sitemap dynamically
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`, {
      headers: { 'Accept': 'application/xml', 'User-Agent': 'BeCandid-Indexer/1.0' },
    });
    if (res.ok) {
      const xml = await res.text();
      const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
      const sitemapUrls = new Set(urls);
      for (const match of matches) {
        if (match[1]) sitemapUrls.add(match[1]);
      }
      return Array.from(sitemapUrls);
    }
  } catch {
    // Sitemap fetch failed — use static list only
  }

  return urls;
}

/* ------------------------------------------------------------------ */
/*  Cron handler                                                      */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const results = {
    submitted: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
    urls: [] as { url: string; score: number; status: string }[],
  };

  try {
    // 1. Get all sitemap URLs
    const sitemapUrls = await getSitemapUrls();
    if (sitemapUrls.length === 0) {
      return NextResponse.json({ ok: true, message: 'No sitemap URLs found', ...results });
    }

    // 2. Check which URLs were already submitted recently (last 7 days)
    const db = createServiceClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentSubmissions } = await db
      .from('indexing_submissions')
      .select('url')
      .gte('submitted_at', sevenDaysAgo);

    const recentlySubmitted = new Set((recentSubmissions ?? []).map(r => r.url));

    // 3. Score and rank unsubmitted URLs by SEO value (highest first)
    const toSubmit = sitemapUrls
      .filter(url => !recentlySubmitted.has(url))
      .map(url => ({ url, score: seoScore(url) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, DAILY_LIMIT);

    if (toSubmit.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'All sitemap URLs submitted within last 7 days',
        total: sitemapUrls.length,
        ...results,
      });
    }

    // 4. Get Google access token
    const token = await getAccessToken();

    // 5. Submit URLs in priority order
    for (const { url, score } of toSubmit) {
      try {
        const result = await submitUrl(url, token);
        if (result.ok) {
          results.submitted++;
          results.urls.push({ url, score, status: 'submitted' });
          await db.from('indexing_submissions').upsert({
            url,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          }, { onConflict: 'url' });
        } else {
          results.failed++;
          results.urls.push({ url, score, status: `failed:${result.status}` });
          results.errors.push(`${url} (score ${score}): HTTP ${result.status}`);
        }
      } catch (err: any) {
        results.failed++;
        results.urls.push({ url, score, status: `error:${err.message}` });
        results.errors.push(`${url} (score ${score}): ${err.message}`);
      }
    }

    results.skipped = sitemapUrls.length - toSubmit.length - results.failed;

    return NextResponse.json({
      ok: true,
      total: sitemapUrls.length,
      ...results,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, ...results }, { status: 500 });
  }
}
