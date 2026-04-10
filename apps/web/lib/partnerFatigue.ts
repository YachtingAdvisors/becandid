// ============================================================
// lib/partnerFatigue.ts
//
// Being an accountability partner is emotionally demanding.
// This module monitors partner engagement and detects burnout:
//
//   1. Tracks average response time to alerts
//   2. Detects engagement drop-off (unviewed alerts)
//   3. Sends the USER a gentle nudge when fatigue is detected
//   4. Suggests actions: add a second partner, switch to
//      self-check-in mode, or send an encouragement
//
// We never tell the partner they're "failing." We tell the
// user their partner might need care.
// ============================================================

import { createServiceClient } from './supabase';
import { sendPush } from './push/pushService';

interface FatigueAnalysis {
  fatigued: boolean;
  signals: string[];
  avgResponseHours: number | null;
  unresolvedAlerts: number;
  alertsThisWeek: number;
  lastEngagement: string | null;
  recommendation: 'none' | 'encourage_partner' | 'reduce_frequency' | 'suggest_solo' | 'add_second_partner';
}

export async function analyzePartnerFatigue(userId: string): Promise<FatigueAnalysis> {
  const db = createServiceClient();

  // Get partner record (use first accepted partner by priority; safe with 0 or many)
  const { data: partner } = await db.from('partners')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!partner) {
    return { fatigued: false, signals: [], avgResponseHours: null, unresolvedAlerts: 0, alertsThisWeek: 0, lastEngagement: null, recommendation: 'none' };
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  // Count alerts this week
  const { count: alertsThisWeek } = await db.from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekAgo);

  // Count unresolved alerts (no partner_viewed_at in last 2 weeks)
  const { count: unresolvedAlerts } = await db.from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('partner_viewed_at', null)
    .gte('created_at', twoWeeksAgo);

  // Calculate average response time (last 10 alerts with responses)
  const { data: respondedAlerts } = await db.from('alerts')
    .select('created_at, partner_viewed_at')
    .eq('user_id', userId)
    .not('partner_viewed_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  let avgResponseHours: number | null = null;
  if (respondedAlerts && respondedAlerts.length > 0) {
    const totalHours = respondedAlerts.reduce((sum, a) => {
      const diff = (new Date(a.partner_viewed_at).getTime() - new Date(a.created_at).getTime()) / 3600000;
      return sum + diff;
    }, 0);
    avgResponseHours = Math.round((totalHours / respondedAlerts.length) * 10) / 10;
  }

  // Last engagement (most recent partner_viewed_at or conversation completion)
  const { data: lastView } = await db.from('alerts')
    .select('partner_viewed_at')
    .eq('user_id', userId)
    .not('partner_viewed_at', 'is', null)
    .order('partner_viewed_at', { ascending: false })
    .limit(1);

  const lastEngagement = lastView?.[0]?.partner_viewed_at || null;

  // Detect fatigue signals
  const signals: string[] = [];

  // Signal 1: Response time increasing (>24 hours average)
  if (avgResponseHours && avgResponseHours > 24) {
    signals.push('slow_response');
  }

  // Signal 2: Multiple unresolved alerts
  if ((unresolvedAlerts ?? 0) >= 3) {
    signals.push('unresolved_alerts');
  }

  // Signal 3: No engagement in over a week
  if (lastEngagement) {
    const daysSinceEngagement = (Date.now() - new Date(lastEngagement).getTime()) / 86400000;
    if (daysSinceEngagement > 7) {
      signals.push('no_recent_engagement');
    }
  }

  // Signal 4: High alert volume this week (>5 alerts)
  if ((alertsThisWeek ?? 0) > 5) {
    signals.push('high_alert_volume');
  }

  const fatigued = signals.length >= 2;

  // Determine recommendation
  let recommendation: FatigueAnalysis['recommendation'] = 'none';
  if (fatigued) {
    if (signals.includes('no_recent_engagement') && signals.includes('unresolved_alerts')) {
      recommendation = 'suggest_solo';
    } else if (signals.includes('high_alert_volume')) {
      recommendation = 'reduce_frequency';
    } else if (signals.includes('slow_response')) {
      recommendation = 'encourage_partner';
    } else {
      recommendation = 'add_second_partner';
    }
  }

  // Update partner record
  await db.from('partners').update({
    avg_response_hours: avgResponseHours,
    alerts_this_week: alertsThisWeek ?? 0,
    last_engagement_at: lastEngagement,
  }).eq('id', partner.id);

  return {
    fatigued,
    signals,
    avgResponseHours,
    unresolvedAlerts: unresolvedAlerts ?? 0,
    alertsThisWeek: alertsThisWeek ?? 0,
    lastEngagement,
    recommendation,
  };
}

// ── Send fatigue warning to the monitored user ──────────────
// NOT the partner. The user should care for their partner.

export async function sendFatigueWarning(userId: string, analysis: FatigueAnalysis) {
  const db = createServiceClient();

  // Don't send more than once per week
  const { data: partner } = await db.from('partners')
    .select('fatigue_warning_sent')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (partner?.fatigue_warning_sent) return;

  const { data: user } = await db.from('users')
    .select('id, name')
    .eq('id', userId)
    .single();

  const messages: Record<string, string> = {
    encourage_partner: 'Your partner has been slower to respond lately. They might need encouragement — this work is hard for them too.',
    reduce_frequency: 'Your partner received a lot of alerts this week. Consider adjusting your vulnerability windows or check-in frequency.',
    suggest_solo: "Your partner hasn't engaged in a while. You might want to switch to solo mode temporarily — or reach out to check on them.",
    add_second_partner: 'Consider adding a second accountability partner. It reduces the load on one person and gives you a backup.',
  };

  const message = messages[analysis.recommendation] || 'Your partner might need some care right now.';

  // Send push
  const { data: tokens } = await db.from('push_tokens')
    .select('token, platform')
    .eq('user_id', userId);

  if (tokens && tokens.length > 0) {
    await Promise.allSettled(
      tokens.map((t: any) => sendPush(t.token, t.platform, {
        title: '💙 Check on your partner',
        body: message,
        data: { type: 'partner_fatigue', url: '/dashboard/partner' },
      }))
    );
  }

  // Create nudge
  await db.from('nudges').insert({
    user_id: userId,
    type: 'partner_fatigue',
    severity: 'info',
    title: 'Your partner might need care',
    message,
    metadata: {
      recommendation: analysis.recommendation,
      signals: analysis.signals,
      avg_response_hours: analysis.avgResponseHours,
    },
  });

  // Mark warning sent (reset weekly by patterns cron)
  await db.from('partners').update({
    fatigue_warning_sent: true,
  }).eq('user_id', userId).eq('status', 'accepted');
}
