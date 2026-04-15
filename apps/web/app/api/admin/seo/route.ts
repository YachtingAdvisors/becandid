export const dynamic = 'force-dynamic';
// ============================================================
// GET /api/admin/seo
// Returns AI-generated content from seo_content table joined
// with 30-day Google Search Console performance data.
// Uses the same service account as the indexing cron.
//
// Required env vars (already set for indexing cron):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_KEY
//   GSC_SITE_URL  (optional — defaults to sc-domain:becandid.io)
// ============================================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';
// Must match what's verified in Search Console (domain property or URL-prefix property)
const GSC_SITE = process.env.GSC_SITE_URL ?? 'sc-domain:becandid.io';

// ─── Track A articles where a human voice matters most ─────
// Criteria: direct comparisons, review content, parenting topics,
// or emotional relationship content — categories where authenticity
// is a ranking signal and AI-flat prose underperforms.
const CRITICAL_A_SLUGS = new Set([
  'be-candid-vs-covenant-eyes',     // Head-to-head — needs firsthand product knowledge
  'covenant-eyes-review-2026',       // Review — authenticity is the whole point
  'best-accountability-apps-2026',   // Roundup — credibility determines trust / CTR
  'bark-vs-be-candid-for-teens',    // Parenting — emotional, needs personal angle
  'accountability-partner-app',      // Relationship-focused — relational depth matters
]);

// ─── JWT helpers (mirrors google-indexing/route.ts) ────────

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

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGscToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) return null;

  try {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(`${header}.${payload}`)
    );

    const jwt = `${header}.${payload}.${toBase64Url(sig)}`;
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const { access_token } = await res.json();
    return access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Search Console data ────────────────────────────────────

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function fetchGscData(token: string): Promise<{
  byPage: Map<string, { clicks: number; impressions: number; ctr: number; position: number }>;
  topQueries: Array<{ query: string; clicks: number; impressions: number; position: number }>;
}> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const siteEncoded = encodeURIComponent(GSC_SITE);
  const baseEndpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteEncoded}/searchAnalytics/query`;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Fetch page-level data
  const pageRes = await fetch(baseEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 500,
    }),
  });
  const pageData = await pageRes.json();

  const byPage = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
  for (const row of (pageData.rows ?? []) as GscRow[]) {
    const url = row.keys[0];
    byPage.set(url, {
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    });
  }

  // Fetch top queries (site-wide, last 30d)
  const queryRes = await fetch(baseEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 20,
    }),
  });
  const queryData = await queryRes.json();

  const topQueries = ((queryData.rows ?? []) as GscRow[]).map(r => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
  }));

  return { byPage, topQueries };
}

// ─── Personalization logic ──────────────────────────────────

type PersonalizePriority = 'critical' | 'recommended';

interface PersonalizeTag {
  priority: PersonalizePriority;
  reason: string;
}

function getPersonalizationTag(
  slug: string,
  track: string,
  metrics: { clicks: number; impressions: number; ctr: number; position: number } | null
): PersonalizeTag | null {
  // All Track B = critical (YMYL, authority content, E-E-A-T requires real expertise)
  if (track === 'B') {
    return {
      priority: 'critical',
      reason: 'YMYL pillar content — add citations, clinical expertise, and your editorial voice before this competes for top rankings.',
    };
  }

  // High-stakes Track A topics where human authenticity is a ranking advantage
  if (CRITICAL_A_SLUGS.has(slug)) {
    return {
      priority: 'critical',
      reason: 'High-intent comparison page — first-hand product knowledge and specific real-world detail will outrank AI-generated content at this keyword difficulty.',
    };
  }

  // Performance-triggered: getting found but failing to convert clicks
  if (metrics && metrics.impressions >= 100 && metrics.ctr < 0.02 && metrics.position > 10) {
    return {
      priority: 'recommended',
      reason: `Ranking at avg position ${metrics.position.toFixed(0)} with ${(metrics.ctr * 100).toFixed(1)}% CTR — a stronger hook and personal voice could meaningfully lift both.`,
    };
  }

  return null;
}

// ─── Route handler ──────────────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email ?? '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();

  // Fetch all generated articles
  const { data: articles, error } = await db
    .from('seo_content')
    .select('slug, track, title, status, generated_at, content, metadata')
    .order('generated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Try to fetch GSC data (non-fatal if it fails)
  let gscAvailable = false;
  let byPage = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
  let topQueries: Array<{ query: string; clicks: number; impressions: number; position: number }> = [];

  try {
    const token = await getGscToken();
    if (token) {
      const gscData = await fetchGscData(token);
      byPage = gscData.byPage;
      topQueries = gscData.topQueries;
      gscAvailable = true;
    }
  } catch {
    // GSC unavailable — show content data only
  }

  const now = Date.now();

  const enriched = (articles ?? []).map(article => {
    const url = `${BASE_URL}/blog/${article.slug}`;
    const metrics = byPage.get(url) ?? null;
    const daysLive = Math.floor((now - new Date(article.generated_at).getTime()) / (1000 * 60 * 60 * 24));
    const personalization = getPersonalizationTag(article.slug, article.track, metrics);

    return {
      slug: article.slug,
      title: article.title,
      track: article.track as 'A' | 'B',
      status: article.status as 'published' | 'draft',
      generated_at: article.generated_at,
      days_live: daysLive,
      description: article.metadata?.description ?? '',
      keywords: (article.metadata?.keywords ?? []) as string[],
      tags: (article.metadata?.tags ?? []) as string[],
      metrics,
      personalization,
    };
  });

  // Aggregate totals
  const published = enriched.filter(a => a.status === 'published');
  const totalClicks = published.reduce((sum, a) => sum + (a.metrics?.clicks ?? 0), 0);
  const totalImpressions = published.reduce((sum, a) => sum + (a.metrics?.impressions ?? 0), 0);
  const withPosition = published.filter(a => a.metrics && a.metrics.impressions > 0);
  const avgPosition = withPosition.length > 0
    ? withPosition.reduce((sum, a) => sum + a.metrics!.position, 0) / withPosition.length
    : null;

  return NextResponse.json({
    articles: enriched,
    totals: {
      clicks_30d: totalClicks,
      impressions_30d: totalImpressions,
      avg_position: avgPosition ? Math.round(avgPosition * 10) / 10 : null,
      articles_published: enriched.filter(a => a.status === 'published').length,
      articles_draft: enriched.filter(a => a.status === 'draft').length,
      articles_needing_attention: enriched.filter(a => a.personalization?.priority === 'critical').length,
    },
    top_queries: topQueries,
    gsc_available: gscAvailable,
  });
}
