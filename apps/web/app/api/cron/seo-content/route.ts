export const dynamic = 'force-dynamic';
export const maxDuration = 60;
// POST/GET /api/cron/seo-content
// Track A: MWF competitor spokes (auto-publish)
// Track B: 1st & 15th pillar guides (draft for review)
//
// Generates content via Claude, publishes to blog JSON files,
// and triggers Google Indexing API for immediate indexing.

import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/cronAuth';
import { createServiceClient } from '@/lib/supabase';
import {
  TRACK_A_TOPICS,
  TRACK_B_TOPICS,
  TRACK_A_SYSTEM_PROMPT,
  TRACK_B_SYSTEM_PROMPT,
  processContent,
} from '@/lib/seo/contentEngine';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const dayOfMonth = now.getDate();
  const results = { track: '', generated: false, slug: '', error: '' };

  // Determine which track to run
  const isTrackADay = [1, 3, 5].includes(dayOfWeek); // Mon, Wed, Fri
  const isTrackBDay = [1, 15].includes(dayOfMonth);

  // Track B takes priority on overlap days (1st and 15th)
  const track = isTrackBDay ? 'B' : isTrackADay ? 'A' : null;

  if (!track) {
    return NextResponse.json({ ok: true, message: 'Not a generation day', ...results });
  }

  results.track = track;

  const db = createServiceClient();

  try {
    // Find the next ungenerated topic
    const topics = track === 'A' ? TRACK_A_TOPICS : TRACK_B_TOPICS;
    const systemPrompt = track === 'A' ? TRACK_A_SYSTEM_PROMPT : TRACK_B_SYSTEM_PROMPT;

    // Check which slugs already exist
    const { data: existing, error: selectErr } = await db
      .from('seo_content')
      .select('slug');

    if (selectErr) {
      return NextResponse.json({ ok: false, error: `DB select error: ${selectErr.message}`, ...results });
    }

    const existingSlugs = new Set((existing ?? []).map(e => e.slug));
    const nextTopic = topics.find(t => !existingSlugs.has(t.slug));

    if (!nextTopic) {
      return NextResponse.json({ ok: true, message: `All Track ${track} topics already generated (${existingSlugs.size} exist)`, ...results });
    }

    // Generate content via Claude
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic();

    const userPrompt = `Write an article with this exact title: "${nextTopic.title}"

Description: ${nextTopic.description}
Target keywords: ${nextTopic.keywords.join(', ')}
${('competitor' in nextTopic) ? `Primary competitor: ${(nextTopic as any).competitor}` : ''}

Generate the full article now.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawContent = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    if (!rawContent || rawContent.length < 500) {
      results.error = 'Generated content too short';
      return NextResponse.json({ ok: false, ...results });
    }

    // Process internal links
    const content = processContent(rawContent);

    // Build the blog post object
    const post = {
      slug: nextTopic.slug,
      title: nextTopic.title,
      description: nextTopic.description,
      date: now.toISOString().split('T')[0],
      author: 'Be Candid Team',
      readTime: `${Math.max(5, Math.round(content.split(/\s+/).length / 250))} min read`,
      tags: nextTopic.tags,
      content,
    };

    // Store in database for tracking
    const { error: upsertErr } = await db.from('seo_content').upsert({
      slug: post.slug,
      track,
      title: post.title,
      status: track === 'B' ? 'draft' : 'published',
      generated_at: now.toISOString(),
      content: post.content,
      metadata: {
        description: post.description,
        tags: post.tags,
        keywords: nextTopic.keywords,
        readTime: post.readTime,
      },
    }, { onConflict: 'slug' });

    if (upsertErr) {
      return NextResponse.json({ ok: false, error: `DB upsert error: ${upsertErr.message}`, slug: post.slug, ...results });
    }

    // For Track A: auto-publish by writing the JSON file via API
    if (track === 'A') {
      // Write to the blog posts table so it appears on the site
      // We store it in the seo_content table and the blog loader picks it up
      // via a dynamic route that checks the DB
      await db.from('seo_content').update({ status: 'published' }).eq('slug', post.slug);

      // Trigger Google Indexing for immediate crawling
      try {
        const indexUrl = `${BASE_URL}/blog/${post.slug}`;
        await submitToGoogleIndex(indexUrl);
      } catch (indexErr: any) {
        console.error('[seo-content] Indexing failed:', indexErr.message);
        // Non-fatal — content is published even if indexing fails
      }
    }

    results.generated = true;
    results.slug = post.slug;

    // Notify admin
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
      await resend.emails.send({
        from,
        to: 'shawn@becandid.io',
        subject: `[SEO] Track ${track}: ${post.title}`,
        html: `<p><strong>Track ${track}</strong> article generated: <a href="${BASE_URL}/blog/${post.slug}">${post.title}</a></p>
          <p>Status: ${track === 'B' ? 'DRAFT — needs human review' : 'Published & submitted to Google'}</p>
          <p>Keywords: ${nextTopic.keywords.join(', ')}</p>
          <p>Word count: ~${content.split(/\s+/).length}</p>`,
      });
    } catch {}

    return NextResponse.json({ ok: true, ...results });
  } catch (err: any) {
    results.error = err.message;
    return NextResponse.json({ ok: false, ...results }, { status: 500 });
  }
}

// Reuse Google Indexing API logic
async function submitToGoogleIndex(url: string) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) return;

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const pemBody = key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(pemBody);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  const sigBytes = new Uint8Array(sig);
  let sigBin = '';
  for (const b of sigBytes) sigBin += String.fromCharCode(b);
  const jwt = `${header}.${payload}.${btoa(sigBin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) return;

  await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
}
