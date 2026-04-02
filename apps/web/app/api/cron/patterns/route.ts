export const dynamic = 'force-dynamic';
// ============================================================
// app/api/cron/patterns/route.ts — UPDATED
//
// Runs every 30 minutes (or daily at 6 AM UTC).
// For each user:
//   1. Run pattern detection (time clustering, frequency spikes, etc.)
//   2. Check active vulnerability windows → fire nudges
//   3. Analyze partner fatigue → warn user if needed
//   4. Reset weekly partner alert counters (on Mondays)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { detectPatterns } from '@/lib/patternDetector';
import { analyzePartnerFatigue, sendFatigueWarning } from '@/lib/partnerFatigue';
import { verifyCronAuth } from '@/lib/cronAuth';

export async function GET(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  let patternsDetected = 0;
  let fatigueWarnings = 0;
  let errors = 0;

  // Get all active users
  const { data: users } = await db.from('users').select('id, solo_mode').eq('monitoring_enabled', true);
  if (!users) return NextResponse.json({ processed: 0 });

  for (const user of users) {
    try {
      // 1. Pattern detection
      const patterns = await detectPatterns(db, user.id);
      patternsDetected += patterns.length;

      // 2. Vulnerability window checks (handled inside detectPatterns)

      // 3. Partner fatigue (skip for solo mode users)
      if (!user.solo_mode) {
        const fatigue = await analyzePartnerFatigue(user.id);
        if (fatigue.fatigued) {
          await sendFatigueWarning(user.id, fatigue);
          fatigueWarnings++;
        }
      }
    } catch (e) {
      console.error(`Patterns cron failed for user ${user.id}:`, e);
      errors++;
    }
  }

  // 4. Reset weekly partner alert counters on Mondays
  const today = new Date();
  if (today.getUTCDay() === 1 && today.getUTCHours() < 1) {
    await db.from('partners').update({
      alerts_this_week: 0,
      fatigue_warning_sent: false,
    }).neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
  }

  return NextResponse.json({
    processed: users.length,
    patterns_detected: patternsDetected,
    fatigue_warnings: fatigueWarnings,
    errors,
  });
}
