export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/activity/route.ts
//
// GET → Recent platform-wide activity feed.
// Aggregates signups, plan changes, partner invites, and
// therapist connections into a unified timeline.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

interface ActivityItem {
  id: string;
  type: 'signup' | 'plan_change' | 'partner_invite' | 'therapist_connection';
  description: string;
  created_at: string;
  user_id?: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const blocked = checkUserRate(adminLimiter, user.id);
  if (blocked) return blocked;

  const url = req.nextUrl;
  const limitParam = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
  const typeFilter = url.searchParams.get('type') || '';

  const db = createServiceClient();
  const items: ActivityItem[] = [];

  const shouldInclude = (t: string) => !typeFilter || typeFilter === t;

  // Fetch all activity types in parallel
  const [signupsRes, auditRes, partnersRes, therapistRes] = await Promise.all([
    shouldInclude('signup')
      ? db
          .from('users')
          .select('id, email, name, created_at')
          .order('created_at', { ascending: false })
          .limit(limitParam)
      : Promise.resolve({ data: [] }),
    shouldInclude('plan_change')
      ? db
          .from('audit_log')
          .select('id, user_id, action, details, created_at')
          .in('action', ['subscription_change', 'admin_update', 'plan_change'])
          .order('created_at', { ascending: false })
          .limit(limitParam)
      : Promise.resolve({ data: [] }),
    shouldInclude('partner_invite')
      ? db
          .from('partners')
          .select('id, user_id, partner_name, partner_email, status, created_at')
          .order('created_at', { ascending: false })
          .limit(limitParam)
      : Promise.resolve({ data: [] }),
    shouldInclude('therapist_connection')
      ? db
          .from('therapist_connections')
          .select('id, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(limitParam)
      : Promise.resolve({ data: [] }),
  ]);

  // Map signups
  for (const row of (signupsRes as { data: Array<{ id: string; email: string; name: string; created_at: string }> }).data || []) {
    items.push({
      id: `signup-${row.id}`,
      type: 'signup',
      description: `${row.name || 'User'} (${row.email}) signed up`,
      created_at: row.created_at,
      user_id: row.id,
    });
  }

  // Map audit log entries (plan changes)
  for (const row of (auditRes as { data: Array<{ id: string; user_id: string; action: string; details: string; created_at: string }> }).data || []) {
    items.push({
      id: `audit-${row.id}`,
      type: 'plan_change',
      description: `${row.action}: ${typeof row.details === 'string' ? row.details : JSON.stringify(row.details)}`,
      created_at: row.created_at,
      user_id: row.user_id,
    });
  }

  // Map partner invites
  for (const row of (partnersRes as { data: Array<{ id: string; user_id: string; partner_name: string; partner_email: string; status: string; created_at: string }> }).data || []) {
    items.push({
      id: `partner-${row.id}`,
      type: 'partner_invite',
      description: `Partner invite sent to ${row.partner_name || row.partner_email} (${row.status})`,
      created_at: row.created_at,
      user_id: row.user_id,
    });
  }

  // Map therapist connections
  for (const row of (therapistRes as { data: Array<{ id: string; user_id: string; created_at: string }> }).data || []) {
    items.push({
      id: `therapist-${row.id}`,
      type: 'therapist_connection',
      description: 'New therapist connection established',
      created_at: row.created_at,
      user_id: row.user_id,
    });
  }

  // Sort by date descending, take first N
  items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    items: items.slice(0, limitParam),
    total: items.length,
  });
}
