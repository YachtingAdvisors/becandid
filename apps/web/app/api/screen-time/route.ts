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

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await getScreenTimeRules(user.id);
  return NextResponse.json({ rules });
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
