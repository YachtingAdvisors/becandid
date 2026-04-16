export const dynamic = 'force-dynamic';
// GET /api/notifications — fetch in-app notifications from multiple tables

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

interface Notification {
  id: string;
  type: 'nudge' | 'partner' | 'checkin' | 'milestone' | 'streak';
  message: string;
  timestamp: string;
  read: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/notifications', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();
    const markRead = req.nextUrl.searchParams.get('mark_read') === 'true';

    // If marking all read, update nudges and milestones
    if (markRead) {
      await Promise.all([
        db.from('nudges')
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('acknowledged', false),
        db.from('milestones')
          .update({ notified: true })
          .eq('user_id', user.id)
          .eq('notified', false),
      ]);

      return NextResponse.json({ success: true, notifications: [], unreadCount: 0 });
    }

    // Fetch from multiple tables in parallel
    const [nudgesResult, milestonesResult] = await Promise.all([
      // Recent nudges (last 20 unread + last 10 acknowledged)
      db.from('nudges')
        .select('id, message, severity, trigger_type, acknowledged, sent_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(30),

      // Recent milestones (last 10)
      db.from('milestones')
        .select('id, milestone, unlocked_at, notified')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(10),
    ]);

    const notifications: Notification[] = [];

    // Map nudges
    for (const nudge of nudgesResult.data ?? []) {
      let type: Notification['type'] = 'nudge';
      if (nudge.trigger_type === 'streak_at_risk') type = 'streak';
      if (nudge.trigger_type === 'check_in_missed') type = 'checkin';

      notifications.push({
        id: `nudge-${nudge.id}`,
        type,
        message: nudge.message,
        timestamp: nudge.sent_at,
        read: nudge.acknowledged,
      });
    }

    // Map milestones
    const MILESTONE_LABELS: Record<string, string> = {
      focused_segments_10: 'You reached 10 focused segments!',
      focused_segments_25: '25 focused segments unlocked!',
      focused_segments_50: '50 focused segments — halfway to 100!',
      focused_segments_100: '100 focused segments achieved!',
      full_days_7: '7 full focus days — one week strong!',
      full_days_14: '14 full focus days — two weeks!',
      full_days_30: '30 full focus days — one month!',
      full_days_60: '60 full focus days unlocked!',
      full_days_90: '90 full focus days — incredible!',
      points_100: 'You earned 100 reputation points!',
      points_500: '500 reputation points milestone!',
      points_1000: '1,000 reputation points — well done!',
      points_5000: '5,000 reputation points — legendary!',
      conversations_5: '5 conversations completed!',
      conversations_10: '10 conversations milestone!',
      conversations_25: '25 conversations — amazing growth!',
      streak_7: '7-day streak achieved!',
      streak_30: '30-day streak — one month strong!',
      streak_90: '90-day streak — extraordinary!',
    };

    for (const ms of milestonesResult.data ?? []) {
      notifications.push({
        id: `milestone-${ms.id}`,
        type: 'milestone',
        message: MILESTONE_LABELS[ms.milestone] ?? `Milestone unlocked: ${ms.milestone.replace(/_/g, ' ')}`,
        timestamp: ms.unlocked_at,
        read: ms.notified,
      });
    }

    // Sort by timestamp, newest first
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return safeError('GET /api/notifications', err);
  }
}
