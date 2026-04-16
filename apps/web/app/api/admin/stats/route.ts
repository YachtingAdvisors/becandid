export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/stats/route.ts
//
// GET → Platform-wide metrics for the admin dashboard.
// Auth: must be authenticated and hold users.platform_role='admin'.
// Rate limited via adminLimiter.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status });
  }

  const blocked = await checkUserRate(adminLimiter, adminAccess.user.id);
  if (blocked) return blocked;

  const db = createServiceClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all stats in parallel
  const [
    totalUsersRes,
    activeUsersRes,
    newUsersRes,
    subscriptionRes,
    journalCountRes,
    eventCountRes,
    conversationCountRes,
    activePartnersRes,
    streakRes,
    moodRes,
  ] = await Promise.all([
    // Total users
    db.from('users').select('id', { count: 'exact', head: true }),
    // Active users (last_active within 7 days)
    db.from('users').select('id', { count: 'exact', head: true })
      .gte('last_active', sevenDaysAgo),
    // New users (created within 7 days)
    db.from('users').select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
    // Subscription breakdown
    db.from('users').select('subscription_status'),
    // Journal entries count
    db.from('stringer_journal').select('id', { count: 'exact', head: true }),
    // Events count
    db.from('events').select('id', { count: 'exact', head: true }),
    // Conversations count
    db.from('conversation_outcomes').select('id', { count: 'exact', head: true }),
    // Active partners
    db.from('partners').select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Average streak (from users table)
    db.from('users').select('current_streak'),
    // Average mood (last 30 days from check_ins)
    db.from('check_ins').select('user_mood')
      .gte('sent_at', thirtyDaysAgo)
      .not('user_mood', 'is', null),
  ]);

  // Calculate subscription breakdown
  const plans: Record<string, number> = { free: 0, trialing: 0, pro: 0, therapy: 0 };
  for (const row of subscriptionRes.data || []) {
    const status = (row.subscription_status || 'free').toLowerCase();
    if (status === 'pro' || status === 'active') {
      plans.pro++;
    } else if (status === 'therapy') {
      plans.therapy++;
    } else if (status === 'trialing') {
      plans.trialing++;
    } else {
      plans.free++;
    }
  }

  // MRR calculation
  const mrr = plans.pro * 9.99 + plans.therapy * 19.99;

  // Average streak
  const streaks = (streakRes.data || [])
    .map((r: any) => r.current_streak ?? 0)
    .filter((s: number) => s > 0);
  const avgStreak = streaks.length > 0
    ? Math.round((streaks.reduce((a: number, b: number) => a + b, 0) / streaks.length) * 10) / 10
    : 0;

  // Average mood
  const moods = (moodRes.data || [])
    .map((r: any) => r.user_mood)
    .filter((m: any) => typeof m === 'number');
  const avgMood = moods.length > 0
    ? Math.round((moods.reduce((a: number, b: number) => a + b, 0) / moods.length) * 10) / 10
    : 0;

  // Journal entries this week
  const journalThisWeekRes = await db.from('stringer_journal')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // Conversations this week
  const conversationsThisWeekRes = await db.from('conversation_outcomes')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  return NextResponse.json({
    total_users: totalUsersRes.count ?? 0,
    active_users_7d: activeUsersRes.count ?? 0,
    new_users_7d: newUsersRes.count ?? 0,
    subscriptions: plans,
    mrr: Math.round(mrr * 100) / 100,
    total_journal_entries: journalCountRes.count ?? 0,
    total_events: eventCountRes.count ?? 0,
    total_conversations: conversationCountRes.count ?? 0,
    active_partners: activePartnersRes.count ?? 0,
    avg_streak: avgStreak,
    avg_mood_30d: avgMood,
    journal_entries_7d: journalThisWeekRes.count ?? 0,
    conversations_7d: conversationsThisWeekRes.count ?? 0,
  });
}
