export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/weekly-reflection/route.ts
//
// Runs Monday 8:30 AM UTC (before the 9 AM digest).
// Generates AI weekly reflections for all users who wrote
// at least 2 journal entries that week. The reflection is
// stored encrypted and included in the weekly digest email.
//
// Schedule: "30 8 * * 1"
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateWeeklyReflection } from '@/lib/weeklyReflection';
import { verifyCronAuth } from '@/lib/cronAuth';
import { logCronRun } from '@/lib/cronAudit';
import { checkFeatureGate } from '@/lib/stripe/featureGate';

export async function GET(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Find users who wrote 2+ journal entries this week
  let activeJournalers: any[] | null = null;
  try {
    const result = await db.rpc('get_active_journalers', { since: weekAgo.toISOString() });
    activeJournalers = result.data;
  } catch {}

  // Fallback if RPC doesn't exist
  let userIds: string[] = [];
  if (activeJournalers) {
    userIds = activeJournalers.map((u: any) => u.user_id);
  } else {
    // Manual query
    const { data: entries } = await db.from('stringer_journal')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString());

    if (entries) {
      const counts: Record<string, number> = {};
      entries.forEach((e: any) => { counts[e.user_id] = (counts[e.user_id] || 0) + 1; });
      userIds = Object.entries(counts).filter(([_, c]) => c >= 2).map(([id]) => id);
    }
  }

  let generated = 0;
  let failed = 0;
  let skippedPlan = 0;

  for (const userId of userIds) {
    try {
      // Feature gate: weekly reflection requires Pro+
      const gate = await checkFeatureGate(userId, 'weeklyReflection');
      if (!gate.allowed) { skippedPlan++; continue; }

      const reflection = await generateWeeklyReflection(userId);
      if (reflection) generated++;
    } catch (e) {
      console.error(`Weekly reflection failed for ${userId}:`, e);
      failed++;
    }

    // Rate limit: max 1 Claude call per 2 seconds
    await new Promise((r) => setTimeout(r, 2000));
  }

  await logCronRun(db, 'weekly-reflection', { users_processed: userIds.length, generated, failed });
  return NextResponse.json({
    eligible_users: userIds.length,
    generated,
    skipped_free_plan: skippedPlan,
    failed,
  });
}
