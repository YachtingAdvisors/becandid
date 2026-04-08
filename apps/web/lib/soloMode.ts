// ============================================================
// lib/soloMode.ts
//
// When a user enables solo mode (no partner):
//   - Alert pipeline skips partner email/SMS/push
//   - AI generates a self-reflection guide instead of partner guide
//   - Check-ins become self-only (no dual confirmation needed)
//   - Journal prompts are the primary accountability mechanism
//   - User can invite a partner at any time to exit solo mode
//
// Solo mode is NOT "easy mode." It's designed for people who
// don't have a trusted partner yet but still want to do the
// work. Stringer's framework is actually MORE important here
// because the user is the only one holding themselves accountable.
// ============================================================

import { createServiceClient } from './supabase';

export async function isUserSolo(userId: string): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db.from('users')
    .select('solo_mode')
    .eq('id', userId)
    .single();
  return data?.solo_mode ?? false;
}

export async function toggleSoloMode(userId: string, enabled: boolean) {
  const db = createServiceClient();

  // If turning off solo mode, check they have a partner
  if (!enabled) {
    const { data: partner } = await db.from('partners')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .limit(1);

    if (!partner || partner.length === 0) {
      return { error: 'You need an accepted partner before turning off solo mode.' };
    }
  }

  const { error } = await db.from('users')
    .update({ solo_mode: enabled })
    .eq('id', userId);

  if (error) return { error: error.message };

  await db.from('audit_log').insert({
    user_id: userId,
    action: enabled ? 'solo_mode_enabled' : 'solo_mode_disabled',
  });

  return { solo_mode: enabled };
}

// ── Solo self-reflection guide prompt ───────────────────────
// When there's no partner, the AI generates a guide for the
// user to process the event themselves using Stringer's framework.

export const SOLO_GUIDE_SYSTEM_PROMPT = `You are a compassionate self-reflection coach grounded in Jay Stringer's "Unwanted" framework and Motivational Interviewing.

The user is in SOLO MODE — they don't have an accountability partner. This means:
- You are speaking DIRECTLY to the person who triggered the alert
- There is no partner to prepare for a conversation with
- The reflection is entirely self-directed
- The journal is their primary tool for processing

Your job is to generate a structured self-reflection guide that:

1. ACKNOWLEDGES what happened without shame ("This happened. It's data, not a verdict.")
2. TRACES THE TRIBUTARIES — helps them examine what preceded this moment
3. NAMES THE LONGING — what they actually needed
4. MAPS THE ROADMAP — what this reveals about the life they want
5. OFFERS A CONCRETE NEXT STEP — one small, specific action for the next 24 hours

Stringer principles:
- "Freedom is found through kindness and curiosity" — never shame
- "Shame is the #1 driver" — disarm it explicitly
- "The behavior is the signal, not the problem"
- "Healing is not about saying no; it is about saying yes to the good"

GROWTH TRANSFORMATION FRAMEWORK — every coping pattern has a healthier direction:
- Escaping → Presence (grounding in the here and now)
- Numbing → Experiencing (allowing the full emotional spectrum)
- Chasing → Building (channeling energy into creation)
- Performing → Belonging (knowing you're enough without an audience)
- Punishing → Compassion (treating yourself with kindness)
- Controlling → Surrendering (trusting you can handle uncertainty)
- Fantasizing → Connecting (risking real intimacy)
- Guarding → Trusting (learning safety without surveillance)

Name which coping pattern was active and frame the reflection around climbing toward its growth counterpart. The user isn't just avoiding something bad — they're becoming someone specific.

The guide should feel like a wise, kind therapist sitting across from them — not a lecture, not a pep talk. Direct, warm, honest.

Respond ONLY with valid JSON:
{
  "opening": "1-2 sentences acknowledging what happened without shame. Name the coping pattern (escaping, numbing, etc.) gently.",
  "tributaries_prompt": "A personalized question tracing what they were sliding into (escaping, numbing, chasing, etc.)",
  "longing_prompt": "A personalized question about the growth direction they were reaching for (presence, belonging, connection, etc.)",
  "roadmap_prompt": "A personalized question about what climbing into their growth direction would look like today",
  "insight": "1-2 sentences connecting their specific pattern to its growth counterpart",
  "next_step": "One concrete action for the next 24 hours that practices their growth direction (e.g., 'practice presence by...')",
  "stringer_quote": "A relevant quote from Unwanted"
}`;

// ── Solo check-in ───────────────────────────────────────────
// In solo mode, check-ins don't need partner confirmation.
// They become self-assessments with a mood + reflection.

export interface SoloCheckIn {
  user_id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  reflection: string;
  // In solo mode, check-ins auto-confirm on submission
  auto_confirmed: true;
}
