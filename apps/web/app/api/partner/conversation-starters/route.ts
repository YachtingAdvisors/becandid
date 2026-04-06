export const dynamic = 'force-dynamic';
// ============================================================
// GET /api/partner/conversation-starters?user_id=<uuid>
//
// Generates 3 personalized conversation starters for the partner
// based on the monitored user's recent journal themes.
// Results cached in-memory for 6 hours per user pair.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decryptJournalEntries } from '@/lib/encryption';
import { aiGuideLimiter, checkUserRate } from '@/lib/rateLimit';
import Anthropic from '@anthropic-ai/sdk';
import { getModel, getMaxTokens } from '@/lib/modelRouter';
import { logApiCost } from '@/lib/costTracker';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

// ── Simple 6-hour cache ────────────────────────────────────────
interface CachedStarters {
  starters: { text: string; theme: string }[];
  expiresAt: number;
}
const starterCache = new Map<string, CachedStarters>();

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(aiGuideLimiter, user.id);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const monitoredUserId = url.searchParams.get('user_id');
  if (!monitoredUserId) {
    return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 });
  }

  const db = createServiceClient();

  // Verify active partnership
  const { data: partnership } = await db
    .from('partners')
    .select('user_id')
    .eq('partner_user_id', user.id)
    .eq('user_id', monitoredUserId)
    .eq('status', 'active')
    .maybeSingle();

  if (!partnership) {
    return NextResponse.json({ error: 'No active partnership with this user' }, { status: 403 });
  }

  // Check cache
  const cacheKey = `${user.id}:${monitoredUserId}`;
  const cached = starterCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({ starters: cached.starters, cached: true });
  }

  // Fetch last 7 days of journal entries
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rawEntries } = await db
    .from('stringer_journal')
    .select('freewrite, tributaries, longing, roadmap, mood, tags, trigger_type, created_at')
    .eq('user_id', monitoredUserId)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!rawEntries || rawEntries.length === 0) {
    return NextResponse.json({
      starters: [],
      empty: true,
      fallback: "Your partner hasn't journaled recently. Try asking: 'How are you really doing?'",
    });
  }

  // Decrypt entries
  const entries = decryptJournalEntries(rawEntries, monitoredUserId);

  // Build context summary for Claude (no raw content — just themes)
  const moods = entries.map(e => e.mood).filter(Boolean);
  const allTags = entries.flatMap(e => e.tags || []);
  const triggers = entries.map(e => e.trigger_type).filter(t => t && t !== 'manual');
  const entryCount = entries.length;

  // Build a brief thematic summary from journal fields
  const themeSummary = entries.map((e, i) => {
    const parts: string[] = [];
    if (e.freewrite) parts.push(`Freewrite: ${e.freewrite.slice(0, 200)}`);
    if (e.tributaries) parts.push(`Tributaries (what led here): ${e.tributaries.slice(0, 200)}`);
    if (e.longing) parts.push(`Longing (what they really want): ${e.longing.slice(0, 200)}`);
    if (e.roadmap) parts.push(`Roadmap (next step): ${e.roadmap.slice(0, 200)}`);
    if (e.mood) parts.push(`Mood: ${e.mood}/5`);
    if (e.tags?.length) parts.push(`Tags: ${e.tags.join(', ')}`);
    return `Entry ${i + 1} (${new Date(e.created_at).toLocaleDateString()}):\n${parts.join('\n')}`;
  }).join('\n\n');

  const systemPrompt = `You help accountability partners start meaningful conversations.
Based on the journal entries, generate exactly 3 conversation starters.
Each should:
- Reference a specific theme or emotion from the journals (without quoting private content directly)
- Be warm, curious, and non-judgmental
- Open a door without forcing it open
- Be 1-2 sentences max

Format as JSON: { "starters": [{ "text": "...", "theme": "..." }] }

The "theme" should be a single word or short phrase (e.g., "loneliness", "conflict", "growth", "stress", "hope").
Output ONLY valid JSON — no markdown fences, no preamble.`;

  const userPrompt = `Here is context about your partner's recent journaling (${entryCount} entries in the last 7 days):

Mood scores: ${moods.length > 0 ? moods.join(', ') + ' (1=heavy, 5=hopeful)' : 'none recorded'}
Common tags: ${allTags.length > 0 ? [...new Set(allTags)].join(', ') : 'none'}
Trigger types: ${triggers.length > 0 ? [...new Set(triggers)].join(', ') : 'all manual entries'}

Journal themes:
${themeSummary}

Generate 3 conversation starters that would help the accountability partner check in meaningfully.`;

  try {
    const starterModel = getModel('moderate');
    const response = await getAnthropic().messages.create({
      model: starterModel,
      max_tokens: getMaxTokens('moderate'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    logApiCost({
      feature: 'conversation_starters',
      model: starterModel,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      userId: user.id,
      tier: 'haiku',
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as { starters: { text: string; theme: string }[] };

    // Cache result
    starterCache.set(cacheKey, {
      starters: parsed.starters,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return NextResponse.json({ starters: parsed.starters, cached: false });
  } catch (error) {
    console.error('Conversation starters generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate conversation starters' },
      { status: 500 }
    );
  }
}
