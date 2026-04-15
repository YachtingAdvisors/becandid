export const dynamic = 'force-dynamic';
// POST/GET /api/cron/google-indexing
// Daily cron: fetches sitemap, checks which URLs aren't indexed,
// submits up to 10 per day via Google Indexing API.
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

// Google OAuth2 token via service account JWT
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

  // Sign JWT with RS256
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

// Submit a URL to Google Indexing API
async function submitUrl(url: string, token: string): Promise<{ url: string; ok: boolean; status: number }> {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      type: 'URL_UPDATED',
    }),
  });
  return { url, ok: res.ok, status: res.status };
}

// SEO value scores — higher = submit sooner
// Scoring rationale:
//   100-90  Conversion + core marketing pages (direct revenue impact)
//   85-80   Competitor comparison + comparison hub (high purchase intent)
//   75-70   Stats / link magnet articles (backlink acquisition)
//   65-60   Audience landing pages + high-traffic how-to content
//   55-50   General blog content + faith niche
//   40-35   Support / about pages
//   20      Legal pages (no SEO value, but must stay indexed)
const SEO_SCORES: Record<string, number> = {
  // Conversion pages
  '':                                                    100,
  '/assessment':                                          97,
  '/pricing':                                             95,
  // Core marketing
  '/compare':                                             90,
  '/methodology':                                         88,
  '/why-becandid':                                        87,
  '/therapists':                                          85,
  // High-intent blog: competitor comparisons
  '/blog/covenant-eyes-alternatives':                     85,
  '/blog/why-covenant-eyes-fails-accountability-software-truth': 84,
  '/blog/why-porn-blockers-dont-work':                    83,
  '/blog/best-christian-accountability-apps-2026':        82,
  '/blog/should-christians-use-accountability-apps':      80,
  // Stats / link-magnet posts
  '/blog/pornography-statistics-2026':                    78,
  '/blog/social-media-addiction-statistics-2026':         77,
  '/blog/gambling-addiction-statistics-2026':             76,
  '/blog/gaming-addiction-statistics-2026':               75,
  '/blog/alcohol-substance-addiction-statistics-2026':    75,
  '/blog/eating-disorder-statistics-2026':                74,
  '/blog/ai-chatbot-addiction-statistics-2026':           73,
  '/blog/accountability-industry-rising-addiction-rates-2026': 73,
  // High-search-volume awareness + positioning
  '/blog/big-tech-mental-health-crisis-profit':           72,
  '/blog/screen-time-mental-health':                      70,
  '/blog/science-behind-digital-accountability':          70,
  // Audience landing pages
  '/blog':                                                70,
  '/families':                                            68,
  '/org':                                                 67,
  '/pricing/groups':                                      66,
  // How-to / problem-aware content
  '/blog/how-to-break-phone-addiction':                   65,
  '/blog/how-to-talk-to-partner-about-porn-addiction':    65,
  '/blog/how-to-stop-doomscrolling':                      64,
  '/blog/signs-husband-addicted-phone-what-to-do':        64,
  '/blog/husband-phone-addiction-signs':                  63,
  '/blog/signs-you-need-accountability-partner':          63,
  '/blog/am-i-having-emotional-affair':                   62,
  '/blog/screen-time-accountability-for-couples':         62,
  '/blog/understanding-your-triggers':                    61,
  '/blog/partners-guide-to-accountability':               61,
  '/blog/social-media-addiction-adults':                  60,
  '/blog/ai-chatbot-addiction':                           60,
  // Faith / niche content
  '/blog/porn-addiction-church-beyond-shame':             58,
  '/blog/mens-accountability-group-church':               57,
  '/blog/breaking-the-shame-cycle':                       56,
  '/blog/digital-wellness-guide':                         55,
  '/blog/therapists-guide-digital-accountability':        55,
  '/blog/gambling-addiction-digital-age':                 54,
  '/blog/procrastination-shame-cycle':                    52,
  '/blog/revenge-bedtime-procrastination':                52,
  '/blog/signs-youre-a-workaholic':                       51,
  '/blog/self-harm-recovery-tools':                       50,
  // About / support
  '/about':                                               40,
  '/donate':                                              38,
  '/download':                                            35,
  // Legal (must stay indexed, but low SEO priority)
  '/legal/privacy':                                       20,
  '/legal/terms':                                         20,
  '/legal/therapist-dpa':                                 20,
};

function scoreUrl(url: string): number {
  const path = url.replace(BASE_URL, '');
  if (path in SEO_SCORES) return SEO_SCORES[path];
  // Default: all other /blog/* posts get 50, everything else gets 30
  if (path.startsWith('/blog/')) return 50;
  return 30;
}

// Generate URLs directly (avoids self-fetch issues on Vercel)
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
    '/compare',
    '/about',
    '/donate',
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

export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const results = { submitted: 0, skipped: 0, failed: 0, errors: [] as string[], urls: [] as { url: string; score: number; ok: boolean }[] };

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

    // 3. Find URLs that haven't been submitted recently, sorted highest SEO value first
    const toSubmit = sitemapUrls
      .filter(url => !recentlySubmitted.has(url))
      .sort((a, b) => scoreUrl(b) - scoreUrl(a))
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

    // 5. Submit URLs
    for (const url of toSubmit) {
      try {
        const result = await submitUrl(url, token);
        const score = scoreUrl(url);
        if (result.ok) {
          results.submitted++;
          results.urls.push({ url, score, ok: true });
          // Record submission
          await db.from('indexing_submissions').upsert({
            url,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          }, { onConflict: 'url' });
        } else {
          results.failed++;
          results.urls.push({ url, score, ok: false });
          results.errors.push(`${url}: HTTP ${result.status}`);
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${url}: ${err.message}`);
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
