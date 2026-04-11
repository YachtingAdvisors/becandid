export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/revenue/route.ts
//
// GET -> Revenue analytics for the admin dashboard.
// Auth: must be authenticated AND an admin (ADMIN_EMAILS).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

const PRO_PRICE = 9.99;
const THERAPY_PRICE = 19.99;

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

  const db = createServiceClient();
  const now = new Date();

  // ── Date boundaries ───────────────────────────────────────
  const monthBoundaries = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return d.toISOString();
  });

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86_400_000).toISOString();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86_400_000).toISOString();

  // ── Fetch data in parallel ────────────────────────────────
  const [
    allUsersRes,
    orgPlansRes,
    referralsRes,
    therapistReferralsRes,
  ] = await Promise.all([
    db
      .from('users')
      .select(
        'id, subscription_plan, subscription_status, trial_ends_at, created_at, referred_by, org_plan_id',
      ),
    db.from('organization_plans').select('id, price_per_user, users_enrolled, org_name, active'),
    db.from('referrals').select('referred_id'),
    db.from('therapist_referrals').select('referred_user_id').eq('status', 'subscribed'),
  ]);

  const users = allUsersRes.data || [];
  const orgPlans = orgPlansRes.data || [];
  const referredUserIds = new Set((referralsRes.data || []).map((r: { referred_id: string }) => r.referred_id));
  const therapistReferredIds = new Set(
    (therapistReferralsRes.data || [])
      .map((r: { referred_user_id: string | null }) => r.referred_user_id)
      .filter(Boolean),
  );

  // ── Current subscription counts ───────────────────────────
  let proCount = 0;
  let therapyCount = 0;
  let trialingCount = 0;
  let freeCount = 0;
  let totalPaid = 0;

  for (const u of users) {
    const plan = (u.subscription_plan || 'free').toLowerCase();
    const status = (u.subscription_status || 'active').toLowerCase();

    if (status === 'trialing') {
      trialingCount++;
    } else if (plan === 'pro' && status === 'active') {
      proCount++;
      totalPaid++;
    } else if (plan === 'therapy' && status === 'active') {
      therapyCount++;
      totalPaid++;
    } else {
      freeCount++;
    }
  }

  // ── Org revenue ───────────────────────────────────────────
  const activeOrgs = orgPlans.filter((o: { active: boolean }) => o.active);
  const orgMrr = activeOrgs.reduce(
    (sum: number, o: { price_per_user: number; users_enrolled: number }) =>
      sum + o.price_per_user * o.users_enrolled,
    0,
  );

  const directMrr = proCount * PRO_PRICE + therapyCount * THERAPY_PRICE;
  const totalMrr = directMrr + orgMrr;

  // ── MRR trend (last 6 months, simplified) ─────────────────
  // We approximate by counting users whose created_at is before each
  // month boundary and whose plan is paid.
  const mrrTrend = monthBoundaries.slice(0, 6).map((boundary, i) => {
    const nextBoundary = monthBoundaries[i + 1];
    const label = new Date(boundary).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });

    let monthPro = 0;
    let monthTherapy = 0;
    let monthOrg = orgMrr; // simplified: assume current org size

    for (const u of users) {
      if (u.created_at > nextBoundary) continue;
      const plan = (u.subscription_plan || 'free').toLowerCase();
      const status = (u.subscription_status || 'active').toLowerCase();
      if (plan === 'pro' && status !== 'trialing') monthPro++;
      if (plan === 'therapy' && status !== 'trialing') monthTherapy++;
    }

    return {
      month: label,
      pro: Math.round(monthPro * PRO_PRICE * 100) / 100,
      therapy: Math.round(monthTherapy * THERAPY_PRICE * 100) / 100,
      org: Math.round(monthOrg * 100) / 100,
      total: Math.round((monthPro * PRO_PRICE + monthTherapy * THERAPY_PRICE + monthOrg) * 100) / 100,
    };
  });

  // ── Churn (users who went from paid to free/canceled) ─────
  const churn30 = users.filter((u) => {
    const status = (u.subscription_status || '').toLowerCase();
    return (
      (status === 'canceled' || (u.subscription_plan || 'free') === 'free') &&
      u.trial_ends_at &&
      new Date(u.trial_ends_at).getTime() > new Date(thirtyDaysAgo).getTime()
    );
  }).length;

  const churn60 = users.filter((u) => {
    const status = (u.subscription_status || '').toLowerCase();
    return (
      (status === 'canceled' || (u.subscription_plan || 'free') === 'free') &&
      u.trial_ends_at &&
      new Date(u.trial_ends_at).getTime() > new Date(sixtyDaysAgo).getTime()
    );
  }).length;

  const churn90 = users.filter((u) => {
    const status = (u.subscription_status || '').toLowerCase();
    return (
      (status === 'canceled' || (u.subscription_plan || 'free') === 'free') &&
      u.trial_ends_at &&
      new Date(u.trial_ends_at).getTime() > new Date(ninetyDaysAgo).getTime()
    );
  }).length;

  const churnRate30 = totalPaid + churn30 > 0 ? churn30 / (totalPaid + churn30) : 0;
  const churnRate60 = totalPaid + churn60 > 0 ? churn60 / (totalPaid + churn60) : 0;
  const churnRate90 = totalPaid + churn90 > 0 ? churn90 / (totalPaid + churn90) : 0;

  // ── Trial conversion ──────────────────────────────────────
  const totalTrialed = users.filter((u) => u.trial_ends_at).length;
  const convertedFromTrial = users.filter((u) => {
    const plan = (u.subscription_plan || 'free').toLowerCase();
    const status = (u.subscription_status || '').toLowerCase();
    return u.trial_ends_at && (plan === 'pro' || plan === 'therapy') && status === 'active';
  }).length;
  const trialConversionRate =
    totalTrialed > 0 ? convertedFromTrial / totalTrialed : 0;

  // ── ARPU & LTV ────────────────────────────────────────────
  const arpu = users.length > 0 ? totalMrr / users.length : 0;

  // Average months retained: approximate from users who signed up > 30 days ago
  const retainedUsers = users.filter(
    (u) => new Date(u.created_at).getTime() < new Date(thirtyDaysAgo).getTime(),
  );
  const avgMonthsRetained =
    retainedUsers.length > 0
      ? retainedUsers.reduce((sum, u) => {
          const months =
            (now.getTime() - new Date(u.created_at).getTime()) / (30 * 86_400_000);
          return sum + months;
        }, 0) / retainedUsers.length
      : 1;

  const ltv = arpu * avgMonthsRetained;

  // ── Revenue by source ─────────────────────────────────────
  let directSignups = 0;
  let referralSignups = 0;
  let therapistRefSignups = 0;
  let orgSignups = 0;

  for (const u of users) {
    const plan = (u.subscription_plan || 'free').toLowerCase();
    if (plan === 'free') continue;

    if (u.org_plan_id) {
      orgSignups++;
    } else if (therapistReferredIds.has(u.id)) {
      therapistRefSignups++;
    } else if (referredUserIds.has(u.id)) {
      referralSignups++;
    } else {
      directSignups++;
    }
  }

  // ── Funnel ────────────────────────────────────────────────
  const totalSignups = users.length;
  const totalTrials = users.filter((u) => u.trial_ends_at).length;
  const totalConverted = totalPaid;
  // "Retained" = paid users who signed up > 30 days ago and are still active
  const retained = users.filter((u) => {
    const plan = (u.subscription_plan || 'free').toLowerCase();
    const status = (u.subscription_status || '').toLowerCase();
    return (
      (plan === 'pro' || plan === 'therapy') &&
      status === 'active' &&
      new Date(u.created_at).getTime() < new Date(thirtyDaysAgo).getTime()
    );
  }).length;

  return NextResponse.json({
    mrr: {
      total: Math.round(totalMrr * 100) / 100,
      pro: Math.round(proCount * PRO_PRICE * 100) / 100,
      therapy: Math.round(therapyCount * THERAPY_PRICE * 100) / 100,
      org: Math.round(orgMrr * 100) / 100,
      trend: mrrTrend,
    },
    subscriptions: {
      pro: proCount,
      therapy: therapyCount,
      trialing: trialingCount,
      free: freeCount,
    },
    churn: {
      rate_30d: Math.round(churnRate30 * 10000) / 100,
      rate_60d: Math.round(churnRate60 * 10000) / 100,
      rate_90d: Math.round(churnRate90 * 10000) / 100,
      churned_30d: churn30,
      churned_60d: churn60,
      churned_90d: churn90,
    },
    trial_conversion: {
      rate: Math.round(trialConversionRate * 10000) / 100,
      total_trialed: totalTrialed,
      converted: convertedFromTrial,
    },
    arpu: Math.round(arpu * 100) / 100,
    ltv: Math.round(ltv * 100) / 100,
    avg_months_retained: Math.round(avgMonthsRetained * 10) / 10,
    revenue_by_source: {
      direct: directSignups,
      referral: referralSignups,
      therapist_referral: therapistRefSignups,
      org: orgSignups,
    },
    funnel: {
      signups: totalSignups,
      trials: totalTrials,
      paid: totalConverted,
      retained,
    },
  });
}
