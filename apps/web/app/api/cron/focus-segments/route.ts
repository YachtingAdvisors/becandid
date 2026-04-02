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
import { onFocusedSegment } from '@/lib/relationshipHooks';
import { updateRelationshipStreaks } from '@/lib/relationshipEngine';
import { verifyCronAuth } from '@/lib/cronAuth';

// Vercel Crons send GET requests
export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

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

      // Relationship XP for focused segment
      await onFocusedSegment(user.id).catch(() => {});

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

  // Update relationship streaks for all users
  await updateRelationshipStreaks().catch(() => {});

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
