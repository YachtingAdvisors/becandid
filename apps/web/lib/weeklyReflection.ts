// ============================================================
// lib/weeklyReflection.ts
//
// Every Monday, Claude reads the user's journal entries from
// the past week and generates a narrative reflection:
//   - What themes kept appearing (tributaries)
//   - What longings surfaced repeatedly
//   - How mood shifted across the week
//   - What the pattern reveals (roadmap)
//   - One Stringer-informed insight
//   - One encouragement based on actual progress
//
// This is the feature that makes journaling compound —
// individual entries feel useful, but a weekly synthesis
// creates real self-awareness over time.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from './supabase';
import { decryptJournalEntries } from './encryption';
import { encrypt } from './encryption';
import { STRINGER_QUOTES } from '@be-candid/shared';

import { logApiCost } from './costTracker';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const REFLECTION_PROMPT = `You are a compassionate, psychologically rigorous reflection writer grounded in Jay Stringer's "Unwanted" framework.

You're reading someone's journal entries from the past week. These are deeply personal reflections about struggles, unmet longings, and moments of self-sabotage. Treat them with the reverence they deserve.

Generate a weekly reflection that:

1. NAMES THE THEMES — What kept showing up? Not just surface behavior but the emotional undercurrents (loneliness, stress, feeling unseen, conflict).

2. TRACES THE TRIBUTARIES — What patterns connect the entries? Same time of day? Same emotional trigger? Same unmet need?

3. HONORS THE LONGING — What was the person actually reaching for this week? Name the legitimate need beneath the struggle.

4. MAPS THE ROADMAP — Based on this week's entries, what is their struggle revealing about the life they want?

5. ACKNOWLEDGES GROWTH — What did they do well? Showing up to journal IS the work. Name specific moments of courage or honesty from their entries.

6. ONE INSIGHT — A single Stringer-informed observation that connects dots the person might not see themselves.

Tone: warm, direct, specific (reference actual content from their entries). NOT generic motivation. NOT therapy-speak. Like a wise friend who read your journal and noticed something you missed.

Respond ONLY with valid JSON:
{
  "narrative": "3-4 paragraph reflection (the main content)",
  "themes": ["2-4 recurring themes identified"],
  "mood_summary": "1 sentence about mood trajectory",
  "growth_moment": "1 specific thing they did well this week",
  "stringer_insight": "1 Stringer-informed observation",
  "looking_ahead": "1 question or intention for next week"
}`;

export async function generateWeeklyReflection(userId: string): Promise<any> {
  const db = createServiceClient();

  // Get this week's journal entries
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: rawEntries } = await db.from('stringer_journal')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: true });

  if (!rawEntries || rawEntries.length === 0) return null;

  // Decrypt entries for AI processing
  const entries = decryptJournalEntries(rawEntries, userId);

  // Get focus segment data for context
  const { data: segments } = await db.from('focus_segments')
    .select('date, status, period')
    .eq('user_id', userId)
    .gte('date', weekAgo.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  const focusedCount = segments?.filter((s: any) => s.status === 'focused').length ?? 0;
  const totalSegments = segments?.length ?? 0;

  // Get conversation outcomes for context
  const { data: outcomes } = await db.from('conversation_outcomes')
    .select('user_rating, user_felt, partner_rating')
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString());

  // Build context for Claude
  const entryTexts = entries.map((e: any, i: number) => {
    const parts = [];
    const dt = new Date(e.created_at);
    parts.push(`--- Entry ${i + 1} (${dt.toLocaleDateString('en-US', { weekday: 'long' })} ${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}) ---`);
    if (e.trigger_type !== 'manual') parts.push(`[Trigger: ${e.trigger_type}]`);
    if (e.mood) parts.push(`Mood: ${e.mood}/5`);
    if (e.freewrite) parts.push(`Freewrite: ${e.freewrite}`);
    if (e.tributaries) parts.push(`Tributaries: ${e.tributaries}`);
    if (e.longing) parts.push(`Longing: ${e.longing}`);
    if (e.roadmap) parts.push(`Roadmap: ${e.roadmap}`);
    if (e.tags?.length) parts.push(`Tags: ${e.tags.join(', ')}`);
    return parts.join('\n');
  }).join('\n\n');

  const contextLines = [
    `Week: ${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
    `Total journal entries: ${entries.length}`,
    `Focus segments: ${focusedCount}/${totalSegments} focused`,
  ];
  if (outcomes?.length) {
    const avgRating = outcomes.reduce((s: number, o: any) => s + (o.user_rating || 0), 0) / outcomes.length;
    contextLines.push(`Conversations this week: ${outcomes.length} (avg self-rating: ${avgRating.toFixed(1)}/5)`);
  }

  try {
    const reflectionModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    const response = await getAnthropic().messages.create({
      model: reflectionModel,
      max_tokens: 1000,
      system: [{ type: 'text' as const, text: REFLECTION_PROMPT, cache_control: { type: 'ephemeral' as const } }] as any,
      messages: [{
        role: 'user' as const,
        content: `Context:\n${contextLines.join('\n')}\n\nJournal entries:\n${entryTexts}`,
      }],
    } as any);

    logApiCost({
      feature: 'weekly_reflection',
      model: reflectionModel,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      userId,
      tier: 'sonnet',
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('');

    const reflection = JSON.parse(text.replace(/```json|```/g, '').trim());

    // Store encrypted
    const weekStart = weekAgo.toISOString().slice(0, 10);
    await db.from('weekly_reflections').upsert({
      user_id: userId,
      week_start: weekStart,
      reflection: encrypt(JSON.stringify(reflection), userId),
      mood_avg: entries.filter((e: any) => e.mood).length > 0
        ? entries.filter((e: any) => e.mood).reduce((s: number, e: any) => s + e.mood, 0) / entries.filter((e: any) => e.mood).length
        : null,
      entry_count: entries.length,
    }, { onConflict: 'user_id,week_start' });

    return reflection;
  } catch (e) {
    console.error('Weekly reflection generation failed:', e);
    return null;
  }
}
