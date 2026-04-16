export const dynamic = 'force-dynamic';
// GET /api/trust-points/stats
// Returns the full reputation points dashboard payload:
// balance, streak, 21-day heatmap, recent actions, milestones

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
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

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Get user timezone
  const { data: profile } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', user.id)
    .single();

  const tz = profile?.timezone || 'America/New_York';

  const [balance, streak, heatmap, recentActions, milestones] = await Promise.all([
    getTrustPointsBalance(supabase, user.id),
    calculateFocusStreak(supabase, user.id, tz),
    get21DayHeatmap(supabase, user.id, tz),
    getRecentPointActions(supabase, user.id, 15),
    getUnlockedMilestones(supabase, user.id),
  ]);

  return NextResponse.json({
    balance,
    streak,
    heatmap,
    recentActions,
    milestones,
  });
}
