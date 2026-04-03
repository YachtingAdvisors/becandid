import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

const CHALLENGES = [
  // Journal
  { text: "Write one sentence about what you're grateful for today.", type: 'gratitude' },
  { text: 'Name one emotion you felt in the last hour. Just name it.', type: 'journal' },
  { text: 'Write down the best part of your day so far.', type: 'gratitude' },
  { text: "What's one thing you'd tell your 16-year-old self?", type: 'journal' },

  // Connection
  { text: "Text your partner something honest about how you're doing.", type: 'connection' },
  { text: "Ask someone how they're really doing — and listen.", type: 'connection' },
  { text: 'Tell someone you appreciate them. Be specific about why.', type: 'connection' },

  // Mindfulness
  { text: 'Take 5 deep breaths before opening any app.', type: 'mindfulness' },
  { text: 'Put your phone in another room for 30 minutes.', type: 'mindfulness' },
  { text: 'Notice 3 things you can see, hear, and feel right now.', type: 'mindfulness' },

  // Physical
  { text: 'Take a 10-minute walk. No headphones.', type: 'physical' },
  { text: 'Do 20 pushups or stretch for 5 minutes.', type: 'physical' },
  { text: 'Drink a full glass of water right now.', type: 'physical' },

  // Gratitude
  { text: 'Write down 3 things that went right this week.', type: 'gratitude' },
  { text: 'Take a photo of something beautiful you noticed today.', type: 'gratitude' },
];

/** Deterministic pseudo-random index based on date + userId */
function seededIndex(date: string, userId: string, max: number): number {
  let hash = 0;
  const seed = `${date}:${userId}`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return ((hash % max) + max) % max;
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const today = new Date().toISOString().split('T')[0];

  // Try to get today's challenge
  const { data: existing } = await db
    .from('daily_challenges')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  let challenge = existing;

  if (!challenge) {
    // Pick a challenge deterministically
    const idx = seededIndex(today, user.id, CHALLENGES.length);
    const picked = CHALLENGES[idx];

    const { data: inserted, error } = await db
      .from('daily_challenges')
      .insert({
        user_id: user.id,
        date: today,
        challenge_text: picked.text,
        challenge_type: picked.type,
      })
      .select('*')
      .single();

    if (error) {
      // Race condition — re-fetch
      const { data: refetched } = await db
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      challenge = refetched;
    } else {
      challenge = inserted;
    }
  }

  // Calculate streak (consecutive completed days ending yesterday or today)
  const { data: recentChallenges } = await db
    .from('daily_challenges')
    .select('date, completed')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(90);

  let streak = 0;
  if (recentChallenges && recentChallenges.length > 0) {
    const todayDate = new Date(today);
    // Check if today is completed — if so start counting from today, else from yesterday
    const startDate = new Date(todayDate);
    if (!challenge?.completed) {
      startDate.setDate(startDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const found = recentChallenges.find((c: any) => c.date === dateStr);
      if (found) {
        streak++;
      } else {
        break;
      }
    }
  }

  return NextResponse.json({
    ...challenge,
    streak,
  });
}

export async function PATCH() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const today = new Date().toISOString().split('T')[0];

  // Mark today's challenge as completed
  const { data: updated, error } = await db
    .from('daily_challenges')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      points_awarded: 5,
    })
    .eq('user_id', user.id)
    .eq('date', today)
    .eq('completed', false)
    .select('*')
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: 'Challenge not found or already completed' }, { status: 400 });
  }

  // Award 5 trust points
  await db.from('trust_points').insert({
    user_id: user.id,
    points: 5,
    reason: 'daily_challenge',
  });

  // Recalculate streak for response
  const { data: recentChallenges } = await db
    .from('daily_challenges')
    .select('date, completed')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(90);

  let streak = 0;
  if (recentChallenges) {
    const startDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (recentChallenges.find((c: any) => c.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
  }

  return NextResponse.json({ ...updated, streak });
}
