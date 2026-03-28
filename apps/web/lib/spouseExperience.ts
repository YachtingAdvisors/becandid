// ============================================================
// lib/spouseExperience.ts
//
// When the partner is a spouse, everything changes.
//
// A friend receiving an alert thinks: "I should check on them."
// A spouse receiving an alert thinks: "It happened again."
//
// This module handles:
//   1. Spouse-specific AI guide generation (betrayal-informed)
//   2. Committed Contender milestone system
//   3. Impact-to-empathy bridge (showing the user how their
//      spouse is affected — with consent)
//   4. Trust trend analysis over time
//   5. Spouse notification language
//   6. Journal prompts for the spouse
// ============================================================

import { createServiceClient } from './supabase';
import { awardRelationshipXP } from './relationshipEngine';

// ── Spouse journal prompts ──────────────────────────────────
// These are NOT the user's Stringer prompts. These are for
// the person who was hurt. Informed by betrayal trauma research.

export const SPOUSE_JOURNAL_PROMPTS = [
  {
    id: 'impact',
    label: 'The Impact',
    emoji: '💔',
    question: "How is this affecting you right now — emotionally, physically, in your sense of safety?",
    hint: "You don't have to minimize this. What you're feeling is real and it matters. Name it without editing it for anyone else's comfort.",
  },
  {
    id: 'needs',
    label: 'What I Need',
    emoji: '🤲',
    question: "What do you need right now — from yourself, from your partner, from your community?",
    hint: "Your needs are not demands. They're information about what's required for you to feel safe and whole. You're allowed to have them.",
  },
  {
    id: 'boundaries',
    label: 'My Boundaries',
    emoji: '🛡️',
    question: "What boundaries do I need to hold, set, or reinforce?",
    hint: "Boundaries aren't punishment. They're how you protect yourself while staying in the fight. A boundary says 'I love you AND I need this to be true for me to stay.'",
  },
];

// Notification prompts for spouse journal reminders
export const SPOUSE_REMINDER_PROMPTS = [
  "How are you doing today — really? Your feelings matter here too.",
  "You chose to stay and fight. That's not weakness. Write about what that means today.",
  "What do you need right now that you haven't asked for?",
  "Your trust was broken. Rebuilding it isn't your job alone. What does that look like today?",
  "Name one thing you're feeling that you haven't said out loud yet.",
  "What boundary are you holding that's costing you energy? Is it worth it?",
  "You're allowed to grieve what you thought your relationship was. What are you grieving?",
  "What does healing look like for YOU — not for the relationship, just for you?",
];

// Post-alert prompts (sent to spouse after they receive an alert)
export const SPOUSE_ALERT_PROMPTS = [
  "Another alert came in. Before you respond, check in with yourself first. How are you?",
  "You just received difficult information. You don't have to process this alone or right now.",
  "Take a breath. What do you need in the next hour — not the next conversation, just the next hour?",
  "This is real pain. You're allowed to feel it before you decide what to do with it.",
];

// ── Committed Contender milestones ──────────────────────────
// The spouse earns these by showing up — not by "being okay."

export const CONTENDER_MILESTONES = [
  { key: 'first_journal', title: 'First Words', description: 'Wrote your first journal entry', xp: 25, emoji: '✍️' },
  { key: 'first_impact', title: 'Honest Assessment', description: 'Completed your first impact check-in', xp: 20, emoji: '💛' },
  { key: 'first_conversation', title: 'Showed Up', description: 'Participated in your first accountability conversation', xp: 30, emoji: '🤝' },
  { key: 'journal_7', title: '7 Reflections', description: 'Wrote 7 journal entries — the work is working', xp: 40, emoji: '📓' },
  { key: 'journal_30', title: 'Month of Truth', description: '30 journal entries — you\'re doing this', xp: 75, emoji: '🔥' },
  { key: 'set_boundary', title: 'Drew the Line', description: 'Wrote about a boundary you\'re holding', xp: 25, emoji: '🛡️' },
  { key: 'trust_increase', title: 'Trust Rising', description: 'Your trust meter increased for the first time', xp: 50, emoji: '📈' },
  { key: 'shared_entry', title: 'Bridge Builder', description: 'Shared a journal entry with your partner', xp: 35, emoji: '🌉' },
  { key: 'conversations_5', title: 'Five Hard Talks', description: '5 completed conversations — courage every time', xp: 60, emoji: '💪' },
  { key: 'conversations_20', title: 'Committed Contender', description: '20 conversations — you are fighting for this', xp: 100, emoji: '⚔️' },
  { key: 'streak_14', title: 'Two Weeks Strong', description: '14-day streak of engagement — both of you showing up', xp: 50, emoji: '🏔️' },
  { key: 'streak_90', title: 'Unbreakable', description: '90-day streak — this is who you are now', xp: 150, emoji: '💎' },
];

// ── Check and award milestones ──────────────────────────────

export async function checkContenderMilestones(spouseUserId: string, partnerId: string) {
  const db = createServiceClient();

  // Get existing milestones
  const { data: existing } = await db.from('contender_milestones')
    .select('milestone_key')
    .eq('spouse_user_id', spouseUserId);
  const earned = new Set((existing || []).map((m: any) => m.milestone_key));

  const newMilestones: typeof CONTENDER_MILESTONES[0][] = [];

  // Journal count
  const { count: journalCount } = await db.from('spouse_journal')
    .select('id', { count: 'exact', head: true })
    .eq('spouse_user_id', spouseUserId);

  if (!earned.has('first_journal') && (journalCount ?? 0) >= 1) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'first_journal')!);
  if (!earned.has('journal_7') && (journalCount ?? 0) >= 7) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'journal_7')!);
  if (!earned.has('journal_30') && (journalCount ?? 0) >= 30) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'journal_30')!);

  // Impact check-ins
  const { count: impactCount } = await db.from('spouse_impact')
    .select('id', { count: 'exact', head: true })
    .eq('spouse_user_id', spouseUserId);

  if (!earned.has('first_impact') && (impactCount ?? 0) >= 1) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'first_impact')!);

  // Conversations completed
  const { data: partner } = await db.from('partners')
    .select('user_id').eq('id', partnerId).single();
  if (partner) {
    const { count: convCount } = await db.from('conversation_outcomes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', partner.user_id)
      .not('partner_completed_at', 'is', null);

    if (!earned.has('first_conversation') && (convCount ?? 0) >= 1) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'first_conversation')!);
    if (!earned.has('conversations_5') && (convCount ?? 0) >= 5) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'conversations_5')!);
    if (!earned.has('conversations_20') && (convCount ?? 0) >= 20) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'conversations_20')!);
  }

  // Boundary entries
  const { count: boundaryCount } = await db.from('spouse_journal')
    .select('id', { count: 'exact', head: true })
    .eq('spouse_user_id', spouseUserId)
    .not('boundaries', 'is', null);

  if (!earned.has('set_boundary') && (boundaryCount ?? 0) >= 1) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'set_boundary')!);

  // Shared entries
  const { count: sharedCount } = await db.from('spouse_journal')
    .select('id', { count: 'exact', head: true })
    .eq('spouse_user_id', spouseUserId)
    .eq('shared_with_partner', true);

  if (!earned.has('shared_entry') && (sharedCount ?? 0) >= 1) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'shared_entry')!);

  // Trust increase
  const { data: impacts } = await db.from('spouse_impact')
    .select('trust_level, created_at')
    .eq('spouse_user_id', spouseUserId)
    .not('trust_level', 'is', null)
    .order('created_at', { ascending: true })
    .limit(20);

  if (!earned.has('trust_increase') && impacts && impacts.length >= 2) {
    const first = impacts[0].trust_level;
    const latest = impacts[impacts.length - 1].trust_level;
    if (latest > first) newMilestones.push(CONTENDER_MILESTONES.find((m) => m.key === 'trust_increase')!);
  }

  // Award new milestones
  for (const milestone of newMilestones) {
    await db.from('contender_milestones').upsert({
      spouse_user_id: spouseUserId,
      milestone_key: milestone.key,
    }, { onConflict: 'spouse_user_id,milestone_key', ignoreDuplicates: true });

    // Award relationship XP
    await awardRelationshipXP(spouseUserId, 'partner', 'sent_encouragement', {
      milestone: milestone.key, bonus_xp: milestone.xp,
    }).catch(() => {});
  }

  // Update contender level on partner record
  const totalEarned = (existing?.length ?? 0) + newMilestones.length;
  const contenderLevel = totalEarned >= 10 ? 3 : totalEarned >= 5 ? 2 : totalEarned >= 1 ? 1 : 0;
  await db.from('partners').update({ spouse_contender_level: contenderLevel }).eq('id', partnerId);

  return newMilestones;
}

// ── Trust trend analysis ────────────────────────────────────

export async function analyzeTrustTrend(spouseUserId: string, partnerId: string) {
  const db = createServiceClient();

  const { data: impacts } = await db.from('spouse_impact')
    .select('trust_level, created_at')
    .eq('spouse_user_id', spouseUserId)
    .not('trust_level', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!impacts || impacts.length < 2) {
    await db.from('partners').update({ spouse_trust_trend: 'unknown' }).eq('id', partnerId);
    return 'unknown';
  }

  // Compare recent 3 vs older 3
  const recent = impacts.slice(0, 3);
  const older = impacts.slice(-3);
  const recentAvg = recent.reduce((s: number, i: any) => s + i.trust_level, 0) / recent.length;
  const olderAvg = older.reduce((s: number, i: any) => s + i.trust_level, 0) / older.length;

  let trend: string;
  if (recentAvg - olderAvg > 0.5) trend = 'rebuilding';
  else if (olderAvg - recentAvg > 0.5) trend = 'declining';
  else trend = 'stable';

  await db.from('partners').update({ spouse_trust_trend: trend }).eq('id', partnerId);
  return trend;
}

// ── Spouse-specific AI guide system prompt addition ─────────

export const SPOUSE_GUIDE_ADDITION = `

CRITICAL CONTEXT: The accountability partner is the user's SPOUSE.

This changes everything about your guide:

FOR THE USER'S GUIDE:
- They didn't just break a personal commitment — they breached trust in their most intimate relationship.
- Help them see the impact through their spouse's eyes. Not to create shame, but to create empathy.
- The spouse didn't choose to be part of this. They're a co-sufferer, not a spectator.
- The user needs to approach the conversation ready to hear pain, not just explain behavior.
- Stringer's tributaries framework still applies, but add: "How did what happened affect the person you promised yourself to?"

FOR THE PARTNER (SPOUSE) GUIDE:
- The spouse is likely experiencing betrayal trauma. Their nervous system is activated.
- DO NOT tell them to "be supportive" as if they're a neutral friend. They're hurt.
- DO validate their pain. Their anger, fear, numbness, and grief are appropriate responses.
- DO encourage them to set boundaries — boundaries are not punishment, they're self-protection.
- DO acknowledge their choice to stay and engage. That choice is courageous, not passive.
- Frame them as a COMMITTED CONTENDER — someone who chooses to fight for the relationship even when it costs them.
- Include at least one reminder: "Your healing matters independently of your partner's recovery. You are not responsible for fixing this."

LANGUAGE ADJUSTMENTS:
- Replace "your partner" with "your spouse" or their name
- Replace "flag" or "event" with honest language: "what happened"
- Never minimize: don't say "a small incident" — let the spouse define its weight
- Acknowledge the marriage specifically: "Your marriage is worth fighting for, and that fight includes honesty about how much this hurt."

CONVERSATION STARTERS for the spouse should include ONE that:
- Creates space for their pain ("Before I explain anything, I want to hear how you're feeling.")
- Acknowledges the pattern, not just the incident ("I know this isn't the first time, and I know what that means for your trust in me.")
- Offers agency to the spouse ("What do you need from me right now? Not what you think I want to hear — what you actually need.")`;

// ── Spouse notification language ────────────────────────────

export function getSpouseAlertNotification(userName: string): { title: string; body: string } {
  return {
    title: 'Be Candid',
    body: `${userName} had a moment of struggle. You don't have to respond right now. Check in with yourself first.`,
  };
}

export function getSpouseJournalNudge(): string {
  return SPOUSE_REMINDER_PROMPTS[Math.floor(Math.random() * SPOUSE_REMINDER_PROMPTS.length)];
}

export function getSpousePostAlertNudge(): string {
  return SPOUSE_ALERT_PROMPTS[Math.floor(Math.random() * SPOUSE_ALERT_PROMPTS.length)];
}
