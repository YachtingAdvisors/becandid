// ============================================================
// Be Candid — Conversation Coach Engine
//
// An interactive coaching experience grounded in Jay Stringer's
// *Unwanted* framework + Motivational Interviewing. Walks users
// through three phases after a relapse or difficult moment:
//   1. Tributaries — trace the triggers
//   2. Longing    — name the real need
//   3. Roadmap    — point toward growth
//
// Returns a streaming AsyncGenerator for real-time UI delivery.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// ─── Types ──────────────────────────────────────────────────

interface CoachParams {
  userId: string;
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  alertId?: string;
}

interface UserContext {
  goals: string[];
  recentJournals: Array<{ tributaries?: string; longing?: string; roadmap?: string; freewrite?: string; mood?: number; created_at: string }>;
  familyDynamics: Array<{ dynamic: string; confirmed: boolean }>;
  currentStreak: number;
  alertDetails: { category?: string; severity?: string; platform?: string; app_name?: string; sent_at?: string } | null;
}

// ─── Context Loader ─────────────────────────────────────────

async function loadUserContext(userId: string, alertId?: string): Promise<UserContext> {
  const db = createServiceClient();

  // Run queries in parallel
  const [userRow, journals, familyNotes, streakData, alertData] = await Promise.all([
    // User goals
    db.from('users').select('goals').eq('id', userId).single(),

    // Last 5 journal entries (encrypted)
    db.from('stringer_journal')
      .select('tributaries, longing, roadmap, freewrite, mood, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Family systems notes (confirmed dynamics)
    db.from('family_systems_notes')
      .select('dynamic, confirmed')
      .eq('user_id', userId),

    // Current streak from fasts
    db.from('fasts')
      .select('created_at')
      .eq('user_id', userId)
      .is('broken_at', null)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1),

    // Alert details if provided
    alertId
      ? db.from('alerts')
          .select('events (category, severity, platform, app_name, timestamp), sent_at')
          .eq('id', alertId)
          .eq('user_id', userId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Decrypt journal entries
  const decryptedJournals = (journals.data ?? []).map((entry: Record<string, any>) => {
    const decrypted: Record<string, any> = { ...entry };
    for (const field of ['tributaries', 'longing', 'roadmap', 'freewrite'] as const) {
      if (decrypted[field]) {
        decrypted[field] = decrypt(decrypted[field], userId);
      }
    }
    return decrypted;
  });

  // Calculate streak days from active fast
  let streakDays = 0;
  const activeFast = streakData.data?.[0];
  if (activeFast?.created_at) {
    streakDays = Math.floor(
      (Date.now() - new Date(activeFast.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Parse alert
  let alertDetails = null;
  if (alertData?.data) {
    const a = alertData.data as any;
    const event = Array.isArray(a.events) ? a.events[0] : a.events;
    if (event) {
      alertDetails = {
        category: event.category,
        severity: event.severity,
        platform: event.platform,
        app_name: event.app_name,
        sent_at: a.sent_at,
      };
    }
  }

  return {
    goals: userRow.data?.goals ?? [],
    recentJournals: decryptedJournals,
    familyDynamics: (familyNotes.data ?? []).filter((n: any) => n.confirmed),
    currentStreak: streakDays,
    alertDetails,
  };
}

// ─── System Prompt Builder ──────────────────────────────────

function buildSystemPrompt(ctx: UserContext): string {
  const parts: string[] = [];

  parts.push(`You are the Conversation Coach for Be Candid, a compassionate accountability app. You guide people through self-understanding after a relapse or difficult moment using Jay Stringer's *Unwanted* framework combined with Motivational Interviewing techniques.

CORE IDENTITY:
- You are the Conversation Coach — warm, curious, never shaming
- You believe every relapse contains information worth understanding
- You ask ONE question at a time and wait for a response
- You use reflective listening — mirror what the person says before going deeper
- You never moralize, lecture, or use shame language
- You treat the person as the expert on their own life
- You speak in 2-4 sentences maximum per response
- You use natural, conversational language — not therapy-speak

THREE PHASES (flow naturally, don't announce transitions):

1. TRIBUTARIES — "What was happening before?"
   Help them trace the emotional and situational tributaries that flowed into this moment. Ask about: what they were feeling, what happened earlier in the day, what relational dynamics were at play, whether they were tired/lonely/stressed/bored. Stringer teaches that unwanted behavior is always downstream of something — help them find what's upstream.

2. LONGING — "What did you actually need?"
   Once tributaries are mapped, help them name the legitimate longing underneath. Common longings: to feel seen, to escape pressure, to feel alive, to soothe pain, to feel powerful, to feel connected, to rest. The behavior was an attempt to meet a real need in a way that didn't serve them.

3. ROADMAP — "What is this revealing about your path forward?"
   Help them see what this episode is teaching them. What patterns are emerging? What would it look like to meet that longing in a life-giving way? End with one small, concrete step they can take — not a grand plan.

IMPORTANT RULES:
- Never refer to yourself as "AI" or "artificial intelligence" — you are the Conversation Coach or simply "Coach"
- If the person expresses active suicidal ideation or imminent self-harm, immediately provide crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line: text HOME to 741741) and encourage them to reach out to a professional
- Do not diagnose or prescribe — you are a coach, not a therapist
- If the person seems to need professional support, gently suggest it
- Validate courage: "It takes real courage to look at this honestly"
- Never use the word "relapse" unless the user uses it first — say "what happened" or "this moment" instead
- Keep responses concise — this is a conversation, not a monologue`);

  // Add user context
  if (ctx.goals.length > 0) {
    parts.push(`\nUSER CONTEXT — Goals they're working on: ${ctx.goals.join(', ')}`);
  }

  if (ctx.currentStreak > 0) {
    parts.push(`Current streak: ${ctx.currentStreak} days. Acknowledge their effort without making the streak the focus — growth is not just a number.`);
  }

  // Add recent journal themes (without revealing raw content)
  if (ctx.recentJournals.length > 0) {
    const themes: string[] = [];
    for (const j of ctx.recentJournals) {
      if (j.tributaries) themes.push(`Tributaries: "${j.tributaries.slice(0, 150)}..."`);
      if (j.longing) themes.push(`Longing: "${j.longing.slice(0, 150)}..."`);
    }
    if (themes.length > 0) {
      parts.push(`\nRecent journal themes (use to deepen conversation, don't quote back verbatim):\n${themes.slice(0, 6).join('\n')}`);
    }
  }

  // Weave in family dynamics gently
  if (ctx.familyDynamics.length > 0) {
    const dynamics = ctx.familyDynamics.map((d) => d.dynamic).join(', ');
    parts.push(`\nFAMILY SYSTEMS CONTEXT (confirmed dynamics: ${dynamics}):
These are confirmed family-of-origin patterns. If the conversation naturally touches on family, childhood, or relational patterns, you may GENTLY explore how these dynamics might connect. Do NOT introduce this unprompted or use clinical language. Example: if they mention pressure to perform, and "rigidity" is confirmed, you might ask "It sounds like performing well has always felt really important — was that true growing up too?"`);
  }

  // Alert context
  if (ctx.alertDetails) {
    const a = ctx.alertDetails;
    parts.push(`\nTHIS SESSION WAS TRIGGERED BY: A ${a.severity ?? 'moderate'} flag in the "${a.category ?? 'general'}" category${a.platform ? ` on ${a.platform}` : ''}${a.app_name ? ` (${a.app_name})` : ''}. Use this context to guide your opening question — but don't lead with the specifics unless the user brings them up. Start with how they're feeling.`);
  }

  return parts.join('\n');
}

// ─── Streaming Coach Response ───────────────────────────────

export async function* streamCoachResponse(params: CoachParams): AsyncGenerator<string> {
  const { userId, message, history, alertId } = params;

  // Load context
  const ctx = await loadUserContext(userId, alertId);

  // Build messages array
  const systemPrompt = buildSystemPrompt(ctx);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Add conversation history
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current message
  messages.push({ role: 'user', content: message });

  // Stream from Anthropic
  const stream = getAnthropic().messages.stream({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
