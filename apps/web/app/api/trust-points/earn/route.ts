export const dynamic = 'force-dynamic';
// POST /api/trust-points/earn
// Generic endpoint to award reputation points for specific actions
// Used by check-in completion, partner encouragement, etc.

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

const EARNABLE_ACTIONS: Record<string, { points: number; maxPerDay: number }> = {
  check_in_completed: { points: 5, maxPerDay: 1 },
  partner_encouraged: { points: 5, maxPerDay: 3 },
};

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const { action, note, referenceId } = await req.json();

  if (!action || !EARNABLE_ACTIONS[action]) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const config = EARNABLE_ACTIONS[action];
  const db = createServiceClient();

  // Rate limit: check how many times this action was awarded today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await db
    .from('trust_points')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action', action)
    .gte('created_at', todayStart.toISOString());

  if ((count || 0) >= config.maxPerDay) {
    return NextResponse.json({
      error: 'Daily limit reached for this action',
      alreadyEarned: true,
    }, { status: 429 });
  }

  // Award points
  const { error } = await db.from('trust_points').insert({
    user_id: user.id,
    points: config.points,
    action,
    note: note || null,
    reference_id: referenceId || null,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to award points' }, { status: 500 });
  }

  // Get updated balance
  const { data: allPoints } = await db
    .from('trust_points')
    .select('points')
    .eq('user_id', user.id);

  const newBalance = (allPoints || []).reduce((sum, r) => sum + r.points, 0);

  // Check points milestones
  const pointMilestones: Record<number, string> = {
    100: 'points_100',
    500: 'points_500',
    1000: 'points_1000',
    5000: 'points_5000',
  };

  // Fetch all existing milestones in one query to avoid N+1
  const { data: existingMilestones } = await db
    .from('milestones')
    .select('milestone')
    .eq('user_id', user.id);
  const earnedSet = new Set(existingMilestones?.map(m => m.milestone) ?? []);

  const milestonesUnlocked: string[] = [];
  for (const [threshold, milestone] of Object.entries(pointMilestones)) {
    if (newBalance >= parseInt(threshold)) {
      if (earnedSet.has(milestone)) continue;

      await db.from('milestones').insert({ user_id: user.id, milestone });
      await db.from('trust_points').insert({
        user_id: user.id,
        points: 50,
        action: 'milestone_reached',
        note: `Unlocked: ${milestone}`,
      });
      milestonesUnlocked.push(milestone);
    }
  }

  return NextResponse.json({
    success: true,
    pointsAwarded: config.points,
    newBalance: newBalance + milestonesUnlocked.length * 50,
    milestonesUnlocked,
  });
}
