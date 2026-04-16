export const dynamic = 'force-dynamic';
// GET /api/trust-points/stats
// Returns the full reputation points dashboard payload:
// balance, streak, 21-day heatmap, recent actions, milestones

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import {
  calculateFocusStreak,
  get21DayHeatmap,
  getTrustPointsBalance,
  getRecentPointActions,
  getUnlockedMilestones,
} from '@/lib/focusSegments';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();

  // Get user timezone
  const { data: profile } = await db
    .from('users')
    .select('timezone')
    .eq('id', user.id)
    .single();

  const tz = profile?.timezone || 'America/New_York';

  const [balance, streak, heatmap, recentActions, milestones] = await Promise.all([
    getTrustPointsBalance(db, user.id),
    calculateFocusStreak(db, user.id, tz),
    get21DayHeatmap(db, user.id, tz),
    getRecentPointActions(db, user.id, 15),
    getUnlockedMilestones(db, user.id),
  ]);

  return NextResponse.json({
    balance,
    streak,
    heatmap,
    recentActions,
    milestones,
  });
}
