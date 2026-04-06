export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/engagement/route.ts
//
// GET -> Engagement analytics for the admin dashboard.
// Auth: must be authenticated AND an admin (ADMIN_EMAILS).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const now = new Date();

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  // ── Fetch all data in parallel ────────────────────────────
  const [
    allUsersRes,
    journalWeekRes,
    coachWeekRes,
    checkInWeekRes,
    fastWeekRes,
    groupMemberWeekRes,
    communityWeekRes,
    eventsWeekRes,
    focusWeekRes,
    goalsRes,
  ] = await Promise.all([
    // All users with last_active_at and created_at
    db.from('users').select('id, last_active_at, created_at'),

    // Journal entries this week
    db
      .from('stringer_journal')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // Coach conversations this week
    db
      .from('conversation_outcomes')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // Check-ins this week
    db
      .from('check_ins')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', sevenDaysAgo),

    // Fasts this week
    db
      .from('fasts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // Group members who joined this week
    db
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .gte('joined_at', sevenDaysAgo),

    // Community posts this week
    db
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // Events this week (tracked behaviors)
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),

    // Focus segments this week (for session length approximation)
    db
      .from('focus_segments')
      .select('id, status')
      .gte('date', sevenDaysAgo.slice(0, 10)),

    // Goal categories (from users.goals array)
    db.from('users').select('goals'),
  ]);

  const users = allUsersRes.data || [];
  const totalUsers = users.length;

  // ── DAU (last 30 days) ────────────────────────────────────
  const dauByDay: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 86_400_000);
    const dayEnd = new Date(now.getTime() - (i - 1) * 86_400_000);
    const dateStr = dayStart.toISOString().slice(0, 10);

    const count = users.filter((u) => {
      if (!u.last_active_at) return false;
      const active = new Date(u.last_active_at).getTime();
      return active >= dayStart.getTime() && active < dayEnd.getTime();
    }).length;

    dauByDay.push({ date: dateStr, count });
  }

  // ── WAU (users active in last 7 days) ─────────────────────
  const wau = users.filter(
    (u) =>
      u.last_active_at &&
      new Date(u.last_active_at).getTime() > new Date(sevenDaysAgo).getTime(),
  ).length;

  // ── MAU (users active in last 30 days) ────────────────────
  const mau = users.filter(
    (u) =>
      u.last_active_at &&
      new Date(u.last_active_at).getTime() > new Date(thirtyDaysAgo).getTime(),
  ).length;

  // ── DAU/MAU stickiness ────────────────────────────────────
  const avgDau =
    dauByDay.length > 0
      ? dauByDay.reduce((s, d) => s + d.count, 0) / dauByDay.length
      : 0;
  const stickiness = mau > 0 ? avgDau / mau : 0;

  // ── Feature usage this week ───────────────────────────────
  const features = [
    { name: 'Journal', count: journalWeekRes.count ?? 0, icon: 'edit_note' },
    { name: 'Coach', count: coachWeekRes.count ?? 0, icon: 'forum' },
    { name: 'Check-in', count: checkInWeekRes.count ?? 0, icon: 'fact_check' },
    { name: 'Fasting', count: fastWeekRes.count ?? 0, icon: 'timer' },
    { name: 'Groups', count: groupMemberWeekRes.count ?? 0, icon: 'group' },
    { name: 'Community', count: communityWeekRes.count ?? 0, icon: 'favorite' },
    { name: 'Tracking', count: eventsWeekRes.count ?? 0, icon: 'monitoring' },
  ];

  const maxFeatureCount = Math.max(...features.map((f) => f.count), 1);
  const featureUsage = features.map((f) => ({
    ...f,
    pct: totalUsers > 0 ? Math.round((f.count / totalUsers) * 10000) / 100 : 0,
    trend: Math.round((f.count / maxFeatureCount) * 100),
  }));

  // ── Top rivals (goal categories) ──────────────────────────
  const categoryCounts: Record<string, number> = {};
  for (const u of goalsRes.data || []) {
    for (const g of u.goals || []) {
      categoryCounts[g] = (categoryCounts[g] || 0) + 1;
    }
  }

  const topRivals = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({
      category: category.replace(/_/g, ' '),
      count,
      pct: totalUsers > 0 ? Math.round((count / totalUsers) * 10000) / 100 : 0,
    }));

  // ── Retention cohorts (week 0-4) ──────────────────────────
  const cohorts: {
    week: string;
    total: number;
    retained: number[];
  }[] = [];

  for (let w = 4; w >= 0; w--) {
    const cohortStart = new Date(now.getTime() - (w + 1) * 7 * 86_400_000);
    const cohortEnd = new Date(now.getTime() - w * 7 * 86_400_000);
    const label = cohortStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const cohortUsers = users.filter((u) => {
      const created = new Date(u.created_at).getTime();
      return created >= cohortStart.getTime() && created < cohortEnd.getTime();
    });

    const retained: number[] = [];
    for (let r = 0; r <= 4 - w; r++) {
      const retentionWindowStart = new Date(
        cohortEnd.getTime() + r * 7 * 86_400_000,
      );
      const retentionWindowEnd = new Date(
        cohortEnd.getTime() + (r + 1) * 7 * 86_400_000,
      );

      if (retentionWindowEnd.getTime() > now.getTime() + 86_400_000) {
        break;
      }

      const activeInWindow = cohortUsers.filter((u) => {
        if (!u.last_active_at) return false;
        const active = new Date(u.last_active_at).getTime();
        return active >= retentionWindowStart.getTime() && active < retentionWindowEnd.getTime();
      }).length;

      retained.push(
        cohortUsers.length > 0
          ? Math.round((activeInWindow / cohortUsers.length) * 10000) / 100
          : 0,
      );
    }

    cohorts.push({ week: label, total: cohortUsers.length, retained });
  }

  // ── Average session length (from focus_segments) ──────────
  const segments = focusWeekRes.data || [];
  // Each segment represents ~12 hours (morning/evening). A focused
  // segment is roughly an active session marker.
  const focusedSegments = segments.filter(
    (s: { status: string }) => s.status === 'focused',
  ).length;
  const totalSegments = segments.length || 1;
  const avgSessionProxy = Math.round((focusedSegments / totalSegments) * 100);

  return NextResponse.json({
    dau: dauByDay,
    wau,
    mau,
    stickiness: Math.round(stickiness * 10000) / 100,
    feature_usage: featureUsage,
    top_rivals: topRivals,
    retention_cohorts: cohorts,
    avg_focused_pct: avgSessionProxy,
    total_users: totalUsers,
  });
}
