export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/support/route.ts
//
// GET  → Full user lookup by email for support workflows.
// POST → Quick admin actions (extend trial, upgrade, reset pw).
// Auth: must be authenticated AND an admin (ADMIN_EMAILS).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401, user: null };
  if (!isAdmin(user.email || ''))
    return { error: 'Forbidden', status: 403, user: null };
  return { error: null, status: 0, user };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const blocked = checkUserRate(accountLimiter, auth.user!.id);
  if (blocked) return blocked;

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: 'email query parameter is required' },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Find user by email
  const { data: profile, error: profileErr } = await db
    .from('users')
    .select('*')
    .ilike('email', email)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userId = profile.id;
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch all related data in parallel
  const [
    partnersRes,
    therapistRes,
    journalCountRes,
    eventCountRes,
    recentEventsRes,
    streakRes,
    milestonesRes,
    auditRes,
    loginCountRes,
  ] = await Promise.all([
    db
      .from('partners')
      .select('id, partner_name, partner_email, status, created_at')
      .eq('user_id', userId),
    db
      .from('therapist_connections')
      .select('id, created_at')
      .eq('user_id', userId),
    db
      .from('stringer_journal')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    db
      .from('events')
      .select('id, category, severity, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('users')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .single(),
    db
      .from('milestones')
      .select('milestone, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    db
      .from('audit_log')
      .select('id, action, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('audit_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'login'),
  ]);

  // Subscription timeline from audit log
  const { data: subHistory } = await db
    .from('audit_log')
    .select('action, metadata, created_at')
    .eq('user_id', userId)
    .in('action', [
      'subscription_change',
      'admin_update',
      'plan_change',
      'signup',
    ])
    .order('created_at', { ascending: true });

  // Calculate account age in days
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return NextResponse.json({
    profile,
    partners: partnersRes.data || [],
    therapist_connections: therapistRes.data || [],
    journal_count: journalCountRes.count || 0,
    recent_events: recentEventsRes.data || [],
    event_count: eventCountRes.count || 0,
    streak: {
      current: streakRes.data?.current_streak || 0,
      longest: streakRes.data?.longest_streak || 0,
    },
    milestones: milestonesRes.data || [],
    audit_log: auditRes.data || [],
    login_count: loginCountRes.count || 0,
    account_age_days: accountAgeDays,
    last_active: profile.last_active || null,
    subscription_timeline: subHistory || [],
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const blocked = checkUserRate(accountLimiter, auth.user!.id);
  if (blocked) return blocked;

  const body = await req.json();
  const { action, user_id } = body as {
    action: string;
    user_id: string;
  };

  if (!action || !user_id) {
    return NextResponse.json(
      { error: 'action and user_id are required' },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Verify user exists
  const { data: targetUser, error: userErr } = await db
    .from('users')
    .select('id, email, subscription_status, trial_ends_at')
    .eq('id', user_id)
    .single();

  if (userErr || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  switch (action) {
    case 'extend_trial': {
      const currentEnd = targetUser.trial_ends_at
        ? new Date(targetUser.trial_ends_at)
        : new Date();
      const newEnd = new Date(
        currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await db
        .from('users')
        .update({
          subscription_status: 'trialing',
          trial_ends_at: newEnd,
        })
        .eq('id', user_id);

      if (error) {
        return safeError('POST /api/admin/support', error);
      }

      await db.from('audit_log').insert({
        user_id,
        action: 'admin_extend_trial',
        metadata: {
          admin_email: auth.user!.email,
          new_trial_end: newEnd,
        },
      });

      return NextResponse.json({ success: true, trial_ends_at: newEnd });
    }

    case 'upgrade_to_pro': {
      const { error } = await db
        .from('users')
        .update({
          subscription_plan: 'pro',
          subscription_status: 'pro',
        })
        .eq('id', user_id);

      if (error) {
        return safeError('POST /api/admin/support', error);
      }

      await db.from('audit_log').insert({
        user_id,
        action: 'admin_upgrade_pro',
        metadata: { admin_email: auth.user!.email },
      });

      return NextResponse.json({ success: true });
    }

    case 'reset_password': {
      const { error } = await db.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.email,
      });

      if (error) {
        return safeError('POST /api/admin/support', error);
      }

      await db.from('audit_log').insert({
        user_id,
        action: 'admin_password_reset',
        metadata: { admin_email: auth.user!.email },
      });

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }
}
