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
    '/download',
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

  const results = { submitted: 0, skipped: 0, failed: 0, errors: [] as string[] };

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

    // 3. Find URLs that haven't been submitted recently
    const toSubmit = sitemapUrls
      .filter(url => !recentlySubmitted.has(url))
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
        if (result.ok) {
          results.submitted++;
          // Record submission
          await db.from('indexing_submissions').upsert({
            url,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          }, { onConflict: 'url' });
        } else {
          results.failed++;
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
