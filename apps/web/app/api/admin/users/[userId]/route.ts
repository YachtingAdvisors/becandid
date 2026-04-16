export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/users/[userId]/route.ts
//
// GET   → Full user detail with related data counts.
// PATCH → Admin actions (plan override, trial extend, etc.).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { normalizeAdminUserUpdate } from '@/lib/adminTools';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
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

  const db = createServiceClient();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    profileRes,
    partnersRes,
    therapistRes,
    journalCountRes,
    journalRecentRes,
    eventCountRes,
    eventRecentRes,
    trustRes,
    milestonesRes,
    recentEventsRes,
    recentJournalsRes,
  ] = await Promise.all([
    db.from('users').select('*').eq('id', userId).single(),
    db
      .from('partners')
      .select('id, partner_name, partner_email, status')
      .eq('user_id', userId),
    db
      .from('therapist_connections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    db
      .from('stringer_journal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    db
      .from('stringer_journal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo),
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo),
    db
      .from('trust_points')
      .select('points')
      .eq('user_id', userId),
    db.from('milestones').select('milestone, created_at').eq('user_id', userId),
    db
      .from('events')
      .select('id, category, severity, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    db
      .from('stringer_journal')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (!profileRes.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const totalTrust = (trustRes.data || []).reduce(
    (sum: number, r: { points: number }) => sum + (r.points || 0),
    0
  );

  return NextResponse.json({
    profile: profileRes.data,
    partners: partnersRes.data || [],
    therapist_count: therapistRes.count || 0,
    journal_count: journalCountRes.count || 0,
    journal_count_7d: journalRecentRes.count || 0,
    event_count: eventCountRes.count || 0,
    event_count_7d: eventRecentRes.count || 0,
    trust_points: totalTrust,
    milestones: milestonesRes.data || [],
    recent_events: recentEventsRes.data || [],
    recent_journals: recentJournalsRes.data || [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
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

  const db = createServiceClient();
  const body = await req.json();

  const parsed = normalizeAdminUserUpdate(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const update = parsed.update;

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }

  const { error } = await db.from('users').update(update).eq('id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log admin action
  await db.from('audit_log').insert({
    user_id: userId,
    action: 'admin_update',
    metadata: {
      admin_email: adminAccess.user.email,
      fields_updated: Object.keys(update),
      ...update,
    },
  });

  return NextResponse.json({ success: true });
}
