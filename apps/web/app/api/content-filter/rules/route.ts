export const dynamic = 'force-dynamic';
// ============================================================
// app/api/content-filter/rules/route.ts
//
// GET    → Get user's content filter rules
// POST   → Add rule
// DELETE → Remove rule
//
// Teen accounts: guardian-managed rules can't be deleted by teen.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { isTeenAccount } from '@/lib/teenMode';

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('content_filter_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }

  return NextResponse.json({ rules: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  // Teen accounts cannot set content filter to 'off'
  const teen = await isTeenAccount(user.id);
  if (teen && body.level === 'off') {
    return NextResponse.json(
      { error: 'Teen accounts cannot disable content filtering' },
      { status: 403 }
    );
  }

  const db = createServiceClient();
  const { data, error } = await db.from('content_filter_rules').insert({
    user_id: user.id,
    pattern: body.pattern,
    category: body.category || 'all',
    action: body.action || 'block',
    managed_by: body.managed_by || user.id,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }

  return NextResponse.json({ rule: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing rule id' }, { status: 400 });

  const db = createServiceClient();

  // Teen can't delete guardian-managed rules
  const teen = await isTeenAccount(user.id);
  if (teen) {
    const { data: rule } = await db
      .from('content_filter_rules')
      .select('managed_by')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .single();

    if (rule && rule.managed_by !== user.id) {
      return NextResponse.json(
        { error: 'This rule is managed by your guardian and cannot be removed' },
        { status: 403 }
      );
    }
  }

  const { error } = await db
    .from('content_filter_rules')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
