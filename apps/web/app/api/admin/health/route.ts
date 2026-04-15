export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/health/route.ts
//
// GET → System health: DB status, cron jobs, errors, table
//       sizes, cost estimates, and uptime.
// ============================================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';

const CRON_JOBS = [
  'checkin',
  'digest',
  'journal-reminders',
  'patterns',
  'focus-segments',
  'weekly-reflection',
  'partner-impact',
  'reengagement',
  'google-indexing',
];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();

  // ─── Database connectivity ──────────────────────────────────
  let dbConnected = true;
  try {
    const { error } = await db
      .from('users')
      .select('id', { count: 'exact', head: true });
    if (error) dbConnected = false;
  } catch {
    dbConnected = false;
  }

  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // ─── Parallel fetches ────────────────────────────────────────
  const [
    errorCountRes,
    userCountRes,
    eventCountRes,
    journalCountRes,
    alertCountRes,
    nudgeCountRes,
    auditCountRes,
    partnerCountRes,
    indexingTotalRes,
    indexingCycleRes,
    indexingLastRunRes,
  ] = await Promise.all([
    // Error count (24h)
    db
      .from('audit_log')
      .select('id', { count: 'exact', head: true })
      .in('action', [
        'error',
        'rate_limit_exceeded',
        'auth_failure',
        'brute_force_lockout',
      ])
      .gte('created_at', twentyFourHoursAgo),
    // Table row counts
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('events').select('id', { count: 'exact', head: true }),
    db.from('stringer_journal').select('id', { count: 'exact', head: true }),
    db.from('alerts').select('id', { count: 'exact', head: true }),
    db.from('nudges').select('id', { count: 'exact', head: true }),
    db.from('audit_log').select('id', { count: 'exact', head: true }),
    db.from('partners').select('id', { count: 'exact', head: true }),
    // Google Indexing: total URLs ever submitted
    db.from('indexing_submissions').select('url', { count: 'exact', head: true }),
    // Google Indexing: submitted within the current 7-day window (cron's dedup window)
    db
      .from('indexing_submissions')
      .select('url', { count: 'exact', head: true })
      .gte('submitted_at', sevenDaysAgo),
    // Google Indexing: most recent submission timestamp
    db
      .from('indexing_submissions')
      .select('url, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(1),
  ]);

  // ─── Cron job status ────────────────────────────────────────
  const cronStatus: Record<
    string,
    {
      last_run: string | null;
      result: string | null;
      users_processed: number | null;
    }
  > = {};

  for (const job of CRON_JOBS) {
    const { data } = await db
      .from('audit_log')
      .select('created_at, metadata')
      .eq('action', `cron_${job}`)
      .order('created_at', { ascending: false })
      .limit(1);

    const entry = data?.[0];
    const meta =
      entry?.metadata && typeof entry.metadata === 'object'
        ? (entry.metadata as Record<string, unknown>)
        : {};

    cronStatus[job] = {
      last_run: entry?.created_at || null,
      result: (meta.result as string) || (entry ? 'success' : null),
      users_processed: (meta.users_processed as number) ?? null,
    };
  }

  // ─── Cost estimate ──────────────────────────────────────────
  // Rough estimate based on active user count and average usage.
  // In production, replace with real cost tracking data.
  const activeUsers = userCountRes.count || 0;
  const estimatedDailyCost = activeUsers * 0.02; // ~$0.02 per active user per day

  // ─── Google Indexing status ─────────────────────────────────
  const totalSubmitted = indexingTotalRes.count ?? 0;
  const submittedThisCycle = indexingCycleRes.count ?? 0;
  const lastSubmission = indexingLastRunRes.data?.[0]?.submitted_at ?? null;

  // State logic:
  //   complete  — every known URL was touched in the last 7-day window
  //   running   — there are still URLs outside the current window
  //   stalled   — table is empty or last submission is older than 2 days (cron missed a run)
  const daysSinceLastSub = lastSubmission
    ? (Date.now() - new Date(lastSubmission).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  let indexingState: 'running' | 'complete' | 'stalled';
  if (totalSubmitted === 0 || daysSinceLastSub > 2) {
    indexingState = 'stalled';
  } else if (submittedThisCycle >= totalSubmitted && totalSubmitted > 0) {
    indexingState = 'complete';
  } else {
    indexingState = 'running';
  }

  return NextResponse.json({
    db_connected: dbConnected,
    recent_errors: errorCountRes.count || 0,
    last_cron_runs: Object.fromEntries(
      Object.entries(cronStatus).map(([k, v]) => [k, v.last_run])
    ),
    cron_status: cronStatus,
    indexing_status: {
      state: indexingState,
      total_submitted: totalSubmitted,
      submitted_this_cycle: submittedThisCycle,
      remaining_this_cycle: Math.max(0, totalSubmitted - submittedThisCycle),
      last_submission: lastSubmission,
    },
    table_sizes: {
      users: userCountRes.count || 0,
      events: eventCountRes.count || 0,
      stringer_journal: journalCountRes.count || 0,
      alerts: alertCountRes.count || 0,
      nudges: nudgeCountRes.count || 0,
      audit_log: auditCountRes.count || 0,
      partners: partnerCountRes.count || 0,
    },
    cost_estimate: {
      daily: Math.round(estimatedDailyCost * 100) / 100,
      monthly: Math.round(estimatedDailyCost * 30 * 100) / 100,
    },
    uptime_since: process.env.DEPLOY_TIMESTAMP || null,
  });
}
