export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/health/route.ts
//
// GET → System health: DB status, recent errors, cron runs.
// ============================================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();

  let dbConnected = true;
  try {
    const { error } = await db.from('users').select('id', { count: 'exact', head: true });
    if (error) dbConnected = false;
  } catch {
    dbConnected = false;
  }

  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  // Recent errors from audit_log
  const { count: errorCount } = await db
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .in('action', ['error', 'rate_limit_exceeded', 'auth_failure', 'brute_force_lockout'])
    .gte('created_at', twentyFourHoursAgo);

  // Last cron runs — check audit_log for cron actions
  const cronJobs = ['checkin', 'digest', 'reengagement', 'journal-reminders', 'partner-impact'];
  const lastCronRuns: Record<string, string | null> = {};

  for (const job of cronJobs) {
    const { data } = await db
      .from('audit_log')
      .select('created_at')
      .eq('action', `cron_${job}`)
      .order('created_at', { ascending: false })
      .limit(1);

    lastCronRuns[job] = data?.[0]?.created_at || null;
  }

  return NextResponse.json({
    db_connected: dbConnected,
    recent_errors: errorCount || 0,
    last_cron_runs: lastCronRuns,
  });
}
