export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/users/route.ts
//
// GET → Paginated user list with search, plan filter, and sort.
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

  const url = req.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const search = (url.searchParams.get('search') || '').trim();
  const plan = (url.searchParams.get('plan') || '').toLowerCase();
  const sort = url.searchParams.get('sort') || 'created_at';
  const order = url.searchParams.get('order') === 'asc' ? true : false;

  const allowedSorts = [
    'created_at',
    'email',
    'name',
    'subscription_status',
    'current_streak',
    'last_active',
  ];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';

  const db = createServiceClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = db
    .from('users')
    .select(
      'id, email, name, goals, subscription_plan, subscription_status, current_streak, monitoring_enabled, created_at, last_active, trial_ends_at',
      { count: 'exact' }
    );

  // Search filter
  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  // Plan filter
  if (plan === 'free') {
    query = query.or('subscription_status.eq.free,subscription_status.is.null');
  } else if (plan === 'pro') {
    query = query.or('subscription_status.eq.pro,subscription_status.eq.active');
  } else if (plan === 'trialing') {
    query = query.eq('subscription_status', 'trialing');
  } else if (plan === 'therapy') {
    query = query.eq('subscription_status', 'therapy');
  }

  query = query.order(sortColumn, { ascending: order }).range(from, to);

  const { data: users, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: users || [],
    total: count || 0,
    page,
    limit,
  });
}
