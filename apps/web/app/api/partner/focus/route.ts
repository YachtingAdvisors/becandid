export const dynamic = 'force-dynamic';
// GET /api/partner/focus
// Returns the monitored user's focus stats for the partner view

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import {
  calculateFocusStreak,
  get21DayHeatmap,
  getTrustPointsBalance,
  getUnlockedMilestones,
} from '@/lib/focusSegments';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  // Find who this partner is monitoring
  const { data: partnership } = await db
    .from('partners')
    .select('user_id')
    .eq('partner_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!partnership) {
    return NextResponse.json({ error: 'No active partnership found' }, { status: 404 });
  }

  const monitoredUserId = partnership.user_id;

  // Get monitored user's profile
  const { data: monitoredUser } = await db
    .from('users')
    .select('name, timezone')
    .eq('id', monitoredUserId)
    .single();

  const tz = monitoredUser?.timezone || 'America/New_York';

  const [balance, streak, heatmap, milestones] = await Promise.all([
    getTrustPointsBalance(db, monitoredUserId),
    calculateFocusStreak(db, monitoredUserId, tz),
    get21DayHeatmap(db, monitoredUserId, tz),
    getUnlockedMilestones(db, monitoredUserId),
  ]);

  return NextResponse.json({
    monitoredUserName: monitoredUser?.name || 'Your partner',
    balance,
    streak,
    heatmap,
    milestones,
  });
}
