export const dynamic = 'force-dynamic';
// ============================================================
// app/api/screen-time/route.ts
//
// GET    → Get screen time rules for user
// POST   → Create new rule
// PUT    → Update rule
// DELETE → Remove rule
//
// Teen accounts: guardian-enforced rules cannot be changed by teen.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getScreenTimeRules } from '@/lib/screenTime';
import { isTeenAccount } from '@/lib/teenMode';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const includeAggregates = url.searchParams.get('aggregates') !== 'false';

  const rules = await getScreenTimeRules(user.id);

  if (!includeAggregates) {
    return NextResponse.json({ rules });
  }

  // Build date boundaries for daily, weekly, and monthly aggregates
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const db = createServiceClient();

  // Fetch events for the entire month (covers daily + weekly + monthly)
  const { data: monthEvents } = await db
    .from('events')
    .select('category, duration_seconds, timestamp')
    .eq('user_id', user.id)
    .gte('timestamp', monthStart.toISOString())
    .order('timestamp', { ascending: true });

  const events = monthEvents ?? [];

  // Helper to aggregate events by category
  function aggregateByCategory(filtered: typeof events) {
    const byCategory: Record<string, { total_seconds: number; event_count: number }> = {};
    let totalSeconds = 0;

    for (const e of filtered) {
      const dur = e.duration_seconds ?? 0;
      totalSeconds += dur;
      if (!byCategory[e.category]) {
        byCategory[e.category] = { total_seconds: 0, event_count: 0 };
      }
      byCategory[e.category].total_seconds += dur;
      byCategory[e.category].event_count += 1;
    }

    return {
      total_seconds: totalSeconds,
      total_minutes: Math.round(totalSeconds / 60),
      by_category: byCategory,
    };
  }

  const todayISO = todayStart.toISOString();
  const weekISO = weekStart.toISOString();

  const daily = aggregateByCategory(events.filter(e => e.timestamp >= todayISO));
  const weekly = aggregateByCategory(events.filter(e => e.timestamp >= weekISO));
  const monthly = aggregateByCategory(events);

  return NextResponse.json({
    rules,
    aggregates: {
      daily,
      weekly,
      monthly,
      period: {
        today: todayISO,
        week_start: weekISO,
        month_start: monthStart.toISOString(),
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const db = createServiceClient();
  const { data, error } = await db.from('screen_time_rules').insert({
    user_id: user.id,
    category: body.category || 'all',
    daily_limit_minutes: body.daily_limit_minutes ?? null,
    downtime_start: body.downtime_start ?? null,
    downtime_end: body.downtime_end ?? null,
    days_of_week: body.days_of_week ?? [0, 1, 2, 3, 4, 5, 6],
    enforced: false, // Only guardians can set enforced=true
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  return NextResponse.json({ rule: data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing rule id' }, { status: 400 });

  const db = createServiceClient();

  // Check if teen is trying to modify an enforced rule
  const teen = await isTeenAccount(user.id);
  if (teen) {
    const { data: existingRule } = await db
      .from('screen_time_rules')
      .select('enforced')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .single();

    if (existingRule?.enforced) {
      return NextResponse.json(
        { error: 'This rule is set by your guardian and cannot be changed' },
        { status: 403 }
      );
    }
  }

  const updates: Record<string, any> = {};
  if (body.category !== undefined) updates.category = body.category;
  if (body.daily_limit_minutes !== undefined) updates.daily_limit_minutes = body.daily_limit_minutes;
  if (body.downtime_start !== undefined) updates.downtime_start = body.downtime_start;
  if (body.downtime_end !== undefined) updates.downtime_end = body.downtime_end;
  if (body.days_of_week !== undefined) updates.days_of_week = body.days_of_week;

  const { data, error } = await db
    .from('screen_time_rules')
    .update(updates)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  return NextResponse.json({ rule: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing rule id' }, { status: 400 });

  const db = createServiceClient();

  // Check if teen is trying to delete an enforced rule
  const teen = await isTeenAccount(user.id);
  if (teen) {
    const { data: existingRule } = await db
      .from('screen_time_rules')
      .select('enforced')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .single();

    if (existingRule?.enforced) {
      return NextResponse.json(
        { error: 'This rule is set by your guardian and cannot be removed' },
        { status: 403 }
      );
    }
  }

  const { error } = await db
    .from('screen_time_rules')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
