export const dynamic = 'force-dynamic';
// POST /api/cron/focus-segments
// Nightly cron: backfill yesterday's focus segments for all users,
// award trust points, and check streak milestones.
//
// Should be called via Vercel Cron or external scheduler at ~5:30 AM UTC

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import {
  backfillAndScoreDay,
  calculateFocusStreak,
  checkStreakMilestones,
} from '@/lib/focusSegments';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Get all users with monitoring enabled
  const { data: users } = await db
    .from('users')
    .select('id, timezone')
    .eq('monitoring_enabled', true);

  if (!users || users.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const results: Array<{
    userId: string;
    morning: string;
    evening: string;
    points: number;
    milestones: string[];
  }> = [];

  for (const user of users) {
    const tz = user.timezone || 'America/New_York';

    // Calculate yesterday in user's timezone
    const now = new Date();
    const yesterdayLocal = new Date(
      now.toLocaleString('en-US', { timeZone: tz })
    );
    yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);
    const yesterdayStr = yesterdayLocal.toLocaleDateString('en-CA');

    try {
      // Backfill segments and award points
      const { morning, evening, pointsAwarded } = await backfillAndScoreDay(
        db, user.id, yesterdayStr
      );

      // Check streak milestones
      const streak = await calculateFocusStreak(db, user.id, tz);
      const milestones = await checkStreakMilestones(db, user.id, streak.streakDays);

      results.push({
        userId: user.id,
        morning,
        evening,
        points: pointsAwarded,
        milestones,
      });
    } catch (err) {
      console.error(`Focus segment cron error for user ${user.id}:`, err);
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
