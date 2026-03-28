// ============================================================
// Be Candid — Contextual Check-in Prompt Generator
// Uses Claude to generate personalized check-in prompts
// based on the user's recent activity, streak, and mood trend.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

export async function generateContextualPrompt(
  db: SupabaseClient,
  userId: string,
  userName: string,
  goals: string[],
  frequency: string
): Promise<string> {
  try {
    // Gather context
    const [eventsRes, segmentsRes, checkInsRes, streakRes] = await Promise.all([
      db.from('events').select('category, severity, timestamp')
        .eq('user_id', userId).order('timestamp', { ascending: false }).limit(10),
      db.from('focus_segments').select('date, segment, status')
        .eq('user_id', userId).order('date', { ascending: false }).limit(14),
      db.from('check_ins').select('user_mood, user_response, status, sent_at')
        .eq('user_id', userId).order('sent_at', { ascending: false }).limit(5),
      db.from('focus_segments').select('date, segment, status')
        .eq('user_id', userId).eq('status', 'focused').order('date', { ascending: false }).limit(60),
    ]);

    const recentEvents = eventsRes.data ?? [];
    const recentSegments = segmentsRes.data ?? [];
    const recentCheckIns = checkInsRes.data ?? [];

    // Build streak count
    const segmentsByDate = new Map<string, Set<string>>();
    for (const s of (streakRes.data ?? [])) {
      if (!segmentsByDate.has(s.date)) segmentsByDate.set(s.date, new Set());
      segmentsByDate.get(s.date)!.add(s.segment);
    }
    let streakDays = 0;
    const today = new Date().toLocaleDateString('en-CA');
    const cursor = new Date(today);
    while (segmentsByDate.get(cursor.toLocaleDateString('en-CA'))?.size === 2) {
      streakDays++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Recent moods
    const recentMoods = recentCheckIns
      .filter(c => c.user_mood)
      .map(c => c.user_mood)
      .slice(0, 3);

    // Event summary
    const eventSummary = recentEvents.length === 0
      ? 'No flags in the last week.'
      : `${recentEvents.length} flags recently, mostly ${
          GOAL_LABELS[recentEvents[0].category as GoalCategory] ?? recentEvents[0].category
        }.`;

    // Focused segments ratio
    const focused = recentSegments.filter(s => s.status === 'focused').length;
    const total = recentSegments.length;
    const focusRate = total > 0 ? Math.round((focused / total) * 100) : 100;

    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const prompt = `Generate a single check-in message (2-3 sentences max) for ${userName}. Context:
- Day: ${dayOfWeek}
- Goals they're tracking: ${goals.map(g => GOAL_LABELS[g as GoalCategory] ?? g).join(', ')}
- Current streak: ${streakDays} full focused days
- Focus rate (last 7 days): ${focusRate}%
- Recent events: ${eventSummary}
- Recent moods: ${recentMoods.length > 0 ? recentMoods.join(', ') : 'no recent check-ins'}
- Check-in frequency: ${frequency}

Tone: warm, direct, personally relevant. Reference specific context (their streak, their mood trend, the day of week). Never generic. Never preachy. End with a question that invites honest reflection. Mention that both they and their partner need to confirm.

Output ONLY the check-in message text, no quotes, no preamble.`;

    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim();

    return text || fallbackPrompt(userName, frequency);
  } catch (err) {
    console.error('Contextual prompt generation failed:', err);
    return fallbackPrompt(userName, frequency);
  }
}

function fallbackPrompt(name: string, frequency: string): string {
  const greetings = [
    `Hey ${name}, time for your check-in. How are you really doing?`,
    `${name} — pausing to check in. What's the honest answer to "how am I doing"?`,
    `Check-in time, ${name}. No performance required — just honesty. How are things?`,
  ];
  const note = frequency !== 'daily' ? ' Both you and your partner need to confirm this one.' : '';
  return greetings[Math.floor(Math.random() * greetings.length)] + note;
}
