export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/users/route.ts
//
// GET → Paginated user list with search, plan filter, and sort.
// Auth: must be authenticated and hold users.platform_role='admin'.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status });
  }

  const blocked = await checkUserRate(adminLimiter, adminAccess.user.id);
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
    'subscription_plan',
    'last_active_at',
  ];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';

  const db = createServiceClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = db
    .from('users')
    .select(
      'id, email, name, goals, subscription_plan, subscription_status, monitoring_enabled, created_at, last_active_at, trial_ends_at',
      { count: 'exact' }
    );

  // Search filter
  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  // Plan filter (subscription_plan holds free/pro/therapy)
  if (plan === 'free') {
    query = query.or('subscription_plan.eq.free,subscription_plan.is.null');
  } else if (plan === 'pro') {
    query = query.eq('subscription_plan', 'pro');
  } else if (plan === 'trialing') {
    query = query.eq('subscription_status', 'trialing');
  } else if (plan === 'therapy') {
    query = query.eq('subscription_plan', 'therapy');
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
