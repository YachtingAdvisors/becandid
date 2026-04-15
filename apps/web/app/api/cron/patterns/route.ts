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
import { detectPredictivePatterns, type PredictiveAlert } from '@/lib/predictivePatterns';
import { analyzePartnerFatigue, sendFatigueWarning } from '@/lib/partnerFatigue';
import { verifyCronAuth } from '@/lib/cronAuth';
import { checkFeatureGate } from '@/lib/stripe/featureGate';

export async function GET(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  let patternsDetected = 0;
  let predictiveAlertsDetected = 0;
  let fatigueWarnings = 0;
  let skippedPlan = 0;
  let errors = 0;

  // Get all active users
  const { data: users } = await db.from('users').select('id, solo_mode').eq('monitoring_enabled', true);
  if (!users) return NextResponse.json({ processed: 0 });

  for (const user of users) {
    try {
      // Feature gate: pattern detection requires Pro+
      const gate = await checkFeatureGate(user.id, 'patternDetection');
      if (!gate.allowed) { skippedPlan++; continue; }

      // 1. Pattern detection (reactive)
      const patterns = await detectPatterns(db, user.id);
      patternsDetected += patterns.length;

      // 2. Predictive pattern detection
      const predictiveAlerts = await detectPredictivePatterns(db, user.id, 'America/New_York');
      if (predictiveAlerts.length > 0) {
        // Dedup: don't send the same predictive pattern within 48 hours
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { data: recentPredictive } = await db
          .from('nudges')
          .select('trigger_type, category')
          .eq('user_id', user.id)
          .eq('trigger_type', 'predictive')
          .gte('sent_at', twoDaysAgo);

        const recentPredictiveSet = new Set(
          (recentPredictive ?? []).map((n: { trigger_type: string; category: string | null }) =>
            `${n.trigger_type}:${n.category ?? ''}`
          )
        );

        const newPredictive = predictiveAlerts.filter(
          (a: PredictiveAlert) => !recentPredictiveSet.has(`predictive:${a.category ?? ''}`)
        );

        if (newPredictive.length > 0) {
          await db.from('nudges').insert(
            newPredictive.map((a: PredictiveAlert) => ({
              user_id: user.id,
              category: a.category ?? null,
              trigger_type: 'predictive',
              message: a.message,
              severity: a.confidence >= 0.7 ? 'warning' : 'info',
              metadata: {
                predictive_type: a.type,
                confidence: a.confidence,
                suggested_action: a.suggested_action,
              },
            }))
          );
          predictiveAlertsDetected += newPredictive.length;
        }
      }

      // 3. Vulnerability window checks (handled inside detectPatterns)

      // 4. Partner fatigue (skip for solo mode users)
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

  // 5. Reset weekly partner alert counters on Mondays
  const today = new Date();
  if (today.getUTCDay() === 1 && today.getUTCHours() < 1) {
    await db.from('partners').update({
      alerts_this_week: 0,
      fatigue_warning_sent: false,
    }).neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
  }

  return NextResponse.json({
    processed: users.length,
    skipped_free_plan: skippedPlan,
    patterns_detected: patternsDetected,
    predictive_alerts: predictiveAlertsDetected,
    fatigue_warnings: fatigueWarnings,
    errors,
  });
}
