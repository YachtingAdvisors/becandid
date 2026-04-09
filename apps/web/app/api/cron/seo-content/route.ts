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
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const dayOfMonth = now.getUTCDate();
  const results = { track: '', generated: false, slug: '', error: '' };

  // Allow manual override via query param: ?track=A or ?track=B
  const url = new URL(req.url);
  const forceTrack = url.searchParams.get('track')?.toUpperCase();

  let track: string | null;
  if (forceTrack === 'A' || forceTrack === 'B') {
    track = forceTrack;
  } else {
    // Auto-schedule: Track B on 1st/15th, Track A on MWF
    const isTrackADay = [1, 3, 5].includes(dayOfWeek); // Mon, Wed, Fri
    const isTrackBDay = [1, 15].includes(dayOfMonth);
    track = isTrackBDay ? 'B' : isTrackADay ? 'A' : null;
  }

  if (!track) {
    return NextResponse.json({ ok: true, message: 'Not a generation day. Use ?track=A or ?track=B to force.', ...results });
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
      return NextResponse.json({ ...results, ok: false, error: `DB select error: ${selectErr.message}` });
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
      return NextResponse.json({ ...results, ok: false, error: `DB upsert error: ${upsertErr.message}`, slug: post.slug });
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
      const wordCount = content.split(/\s+/).length;

      // Build backlink suggestions based on topic
      const backlinkSuggestions = track === 'A'
        ? [
            `Submit to <strong>AlternativeTo.net</strong> — add Be Candid as an alternative to ${('competitor' in nextTopic) ? (nextTopic as any).competitor : 'competitors'} and link back to this article`,
            `Post in relevant <strong>Reddit threads</strong> (r/NoFap, r/pornfree, r/digitalminimalism) where people ask about ${('competitor' in nextTopic) ? (nextTopic as any).competitor : 'accountability apps'} — link naturally`,
            `Share on <strong>Product Hunt discussions</strong> and <strong>Hacker News</strong> if relevant`,
            `Reach out to bloggers who review accountability software — offer this as a resource they can link to`,
            `Add this URL to your <strong>Google Business Profile</strong> posts if applicable`,
          ]
        : [
            `Pitch this to <strong>.edu counseling departments</strong> as a resource — earn authoritative backlinks`,
            `Submit to <strong>psychology newsletters</strong> (e.g., Psychology Today contributor network)`,
            `Share in <strong>therapist Facebook groups</strong> and <strong>counseling forums</strong>`,
            `Reach out to Jay Stringer's team — if they link to this, it's a massive authority signal`,
            `Submit to <strong>SAMHSA, NCBI, or .gov resource lists</strong> if the content qualifies`,
          ];

      const pillarNote = track === 'B'
        ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:0 0 8px;font-weight:700;color:#92400e;">⚠️ PILLAR CONTENT — Human Review Required</p>
            <p style="margin:0;font-size:13px;color:#78350f;">This is YMYL (Your Money or Your Life) content. Before publishing:</p>
            <ul style="margin:8px 0;padding-left:20px;font-size:13px;color:#78350f;">
              <li>Verify all cited studies and statistics are accurate</li>
              <li>Ensure claims are appropriately hedged (no medical advice)</li>
              <li>Add your personal expertise or editorial voice</li>
              <li>Consider adding a real "Reviewed by" credit for E-E-A-T</li>
            </ul>
            <p style="margin:8px 0 0;font-size:13px;color:#78350f;">Edit in Supabase → seo_content table → change status to "published" when ready.</p>
          </div>`
        : '';

      const internalLinks = [
        `<a href="${BASE_URL}/methodology">/methodology</a> — link from articles about "how it works"`,
        `<a href="${BASE_URL}/assessment">/assessment</a> — link from articles mentioning self-discovery or rival identification`,
        `<a href="${BASE_URL}/blog">/blog</a> — link roundup posts to other articles in the cluster`,
        `<a href="${BASE_URL}/pricing">/pricing</a> — link from bottom-of-funnel comparison articles`,
        `<a href="${BASE_URL}/org">/org</a> — link from articles about student access or nonprofit work`,
      ];

      await resend.emails.send({
        from,
        to: 'shawn@becandid.io',
        subject: `[SEO] Track ${track}: ${post.title}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;">
            <h2 style="margin:0 0 4px;">📝 ${post.title}</h2>
            <p style="margin:0 0 16px;color:#666;">Track ${track} · ${wordCount} words · ${nextTopic.keywords.join(', ')}</p>

            <p><strong>Live URL:</strong> <a href="${BASE_URL}/blog/${post.slug}">${BASE_URL}/blog/${post.slug}</a></p>
            <p><strong>Status:</strong> ${track === 'B' ? '🟡 DRAFT — needs your review' : '🟢 Published & submitted to Google Indexing API'}</p>

            ${pillarNote}

            <h3 style="margin:24px 0 8px;border-top:1px solid #e5e7eb;padding-top:16px;">🔗 Backlink Opportunities</h3>
            <p style="font-size:13px;color:#666;">To boost this article's ranking, build backlinks from these sources:</p>
            <ol style="font-size:13px;line-height:1.8;">
              ${backlinkSuggestions.map(s => `<li>${s}</li>`).join('')}
            </ol>

            <h3 style="margin:24px 0 8px;border-top:1px solid #e5e7eb;padding-top:16px;">🏗️ Internal Linking Checklist</h3>
            <p style="font-size:13px;color:#666;">Make sure these pages link TO this article and this article links BACK:</p>
            <ul style="font-size:13px;line-height:1.8;">
              ${internalLinks.map(l => `<li>${l}</li>`).join('')}
            </ul>

            <h3 style="margin:24px 0 8px;border-top:1px solid #e5e7eb;padding-top:16px;">📊 Next Steps</h3>
            <ul style="font-size:13px;line-height:1.8;">
              <li>Check the article reads naturally — AI content needs your voice</li>
              <li>Add any personal anecdotes or unique insights</li>
              <li>Share on social (LinkedIn, X) within 24 hours of publish</li>
              <li>Monitor Google Search Console for impressions in 3-5 days</li>
              ${track === 'A' ? '<li>Consider adding a YouTube video version for rich snippets</li>' : ''}
            </ul>

            <p style="margin:24px 0 0;font-size:11px;color:#999;">Remaining Track ${track} topics: ${topics.filter(t => !existingSlugs.has(t.slug) && t.slug !== post.slug).length} · Total generated: ${existingSlugs.size + 1}</p>
          </div>`,
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
