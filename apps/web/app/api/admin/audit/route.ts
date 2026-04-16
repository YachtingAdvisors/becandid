export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/audit/route.ts
//
// GET → Paginated, filterable audit log viewer.
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
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
  const action = url.searchParams.get('action') || '';
  const userId = url.searchParams.get('user_id') || '';
  const dateRange = url.searchParams.get('range') || ''; // 24h, 7d, 30d

  const db = createServiceClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = db
    .from('audit_log')
    .select('id, user_id, action, metadata, ip_address, created_at', {
      count: 'exact',
    });

  if (action) {
    query = query.eq('action', action);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (dateRange) {
    const now = Date.now();
    let cutoff: string | null = null;
    if (dateRange === '24h') {
      cutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    } else if (dateRange === '7d') {
      cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (dateRange === '30d') {
      cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (cutoff) {
      query = query.gte('created_at', cutoff);
    }
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: entries, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve user emails for entries that have user_ids
  const userIds = [
    ...new Set(
      (entries || [])
        .map((e: { user_id: string | null }) => e.user_id)
        .filter(Boolean)
    ),
  ] as string[];

  let emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await db
      .from('users')
      .select('id, email')
      .in('id', userIds);
    for (const u of users || []) {
      emailMap[u.id] = u.email;
    }
  }

  // Fetch distinct actions for filter dropdown
  const { data: actionTypes } = await db
    .from('audit_log')
    .select('action')
    .limit(500);

  const distinctActions = [
    ...new Set((actionTypes || []).map((a: { action: string }) => a.action)),
  ].sort();

  return NextResponse.json({
    entries: (entries || []).map(
      (e: {
        id: string;
        user_id: string | null;
        action: string;
        metadata: Record<string, unknown>;
        ip_address: string | null;
        created_at: string;
      }) => ({
        ...e,
        user_email: e.user_id ? emailMap[e.user_id] || null : null,
      })
    ),
    total: count || 0,
    page,
    limit,
    action_types: distinctActions,
  });
}
