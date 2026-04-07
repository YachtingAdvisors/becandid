'use client';

import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────

interface MrrTrendPoint {
  month: string;
  pro: number;
  therapy: number;
  org: number;
  total: number;
}

interface RevenueData {
  mrr: {
    total: number;
    pro: number;
    therapy: number;
    org: number;
    trend: MrrTrendPoint[];
  };
  subscriptions: {
    pro: number;
    therapy: number;
    trialing: number;
    free: number;
  };
  churn: {
    rate_30d: number;
    rate_60d: number;
    rate_90d: number;
    churned_30d: number;
    churned_60d: number;
    churned_90d: number;
  };
  trial_conversion: {
    rate: number;
    total_trialed: number;
    converted: number;
  };
  arpu: number;
  ltv: number;
  avg_months_retained: number;
  revenue_by_source: {
    direct: number;
    referral: number;
    therapist_referral: number;
    org: number;
  };
  funnel: {
    signups: number;
    trials: number;
    paid: number;
    retained: number;
  };
}

// ── Component ───────────────────────────────────────────────

export default function RevenueClient() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [churnWindow, setChurnWindow] = useState<'30d' | '60d' | '90d'>('30d');

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load revenue data');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-56 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-error/10 rounded-3xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-error mb-2 block">
          error
        </span>
        <p className="text-sm text-error font-body">
          {error || 'Failed to load revenue data'}
        </p>
      </div>
    );
  }

  const { mrr, churn, trial_conversion, funnel, revenue_by_source } = data;

  // Determine MRR trend direction
  const trendValues = mrr.trend.map((t) => t.total);
  const prevMrr = trendValues.length >= 2 ? trendValues[trendValues.length - 2] : 0;
  const trendPct =
    prevMrr > 0 ? ((mrr.total - prevMrr) / prevMrr) * 100 : 0;
  const trendUp = trendPct >= 0;

  // Churn rate for selected window
  const churnKey = `rate_${churnWindow}` as keyof typeof churn;
  const churnRate = churn[churnKey];
  const churnedKey = `churned_${churnWindow}` as keyof typeof churn;
  const churnedCount = churn[churnedKey];

  // Sparkline points for MRR trend
  const sparkMax = Math.max(...trendValues, 1);
  const sparkPoints = trendValues
    .map((v, i) => {
      const x = (i / Math.max(trendValues.length - 1, 1)) * 120;
      const y = 30 - (v / sparkMax) * 28;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* ── Top KPI cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">payments</span>
            <span className="text-xs font-label font-medium uppercase tracking-wider">
              MRR
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="font-headline text-2xl font-extrabold text-on-surface">
              ${mrr.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <svg
              viewBox="0 0 120 32"
              className="w-20 h-8 flex-shrink-0"
              fill="none"
            >
              <polyline
                points={sparkPoints}
                stroke={trendUp ? '#16a34a' : '#dc2626'}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`material-symbols-outlined text-sm ${trendUp ? 'text-green-600' : 'text-error'}`}
            >
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            <span
              className={`text-xs font-label font-semibold ${trendUp ? 'text-green-600' : 'text-error'}`}
            >
              {trendUp ? '+' : ''}
              {trendPct.toFixed(1)}% vs prev month
            </span>
          </div>
        </div>

        {/* ARPU */}
        <KpiCard
          icon="person"
          label="ARPU"
          value={`$${data.arpu.toFixed(2)}`}
          sub="per user / month"
        />

        {/* LTV */}
        <KpiCard
          icon="diamond"
          label="Est. LTV"
          value={`$${data.ltv.toFixed(2)}`}
          sub={`~${data.avg_months_retained.toFixed(1)} months avg`}
        />

        {/* Trial Conversion */}
        <KpiCard
          icon="swap_horiz"
          label="Trial Conv."
          value={`${trial_conversion.rate.toFixed(1)}%`}
          sub={`${trial_conversion.converted} / ${trial_conversion.total_trialed} trialed`}
        />
      </div>

      {/* ── Revenue breakdown chart + Funnel ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stacked bar chart: MRR by plan over time */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            {mrr.trend.map((m) => {
              const barTotal = m.total || 1;
              return (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-label text-on-surface-variant">
                      {m.month}
                    </span>
                    <span className="text-xs font-label font-semibold text-on-surface">
                      ${m.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex h-5 rounded-full overflow-hidden bg-surface-container">
                    <div
                      className="bg-primary transition-all duration-500"
                      style={{ width: `${(m.pro / barTotal) * 100}%` }}
                      title={`Pro: $${m.pro}`}
                    />
                    <div
                      className="bg-secondary transition-all duration-500"
                      style={{ width: `${(m.therapy / barTotal) * 100}%` }}
                      title={`Therapy: $${m.therapy}`}
                    />
                    <div
                      className="bg-tertiary transition-all duration-500"
                      style={{ width: `${(m.org / barTotal) * 100}%` }}
                      title={`Org: $${m.org}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 pt-2">
            <LegendDot color="bg-primary" label="Pro" />
            <LegendDot color="bg-secondary" label="Therapy" />
            <LegendDot color="bg-tertiary" label="Org" />
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Conversion Funnel
          </h2>
          <div className="space-y-3">
            <FunnelStep
              label="Signups"
              value={funnel.signups}
              pct={100}
              isFirst
            />
            <FunnelStep
              label="Trials"
              value={funnel.trials}
              pct={
                funnel.signups > 0
                  ? (funnel.trials / funnel.signups) * 100
                  : 0
              }
            />
            <FunnelStep
              label="Paid"
              value={funnel.paid}
              pct={
                funnel.signups > 0
                  ? (funnel.paid / funnel.signups) * 100
                  : 0
              }
            />
            <FunnelStep
              label="Retained (30d+)"
              value={funnel.retained}
              pct={
                funnel.signups > 0
                  ? (funnel.retained / funnel.signups) * 100
                  : 0
              }
            />
          </div>
        </div>
      </div>

      {/* ── Churn + Revenue by source ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Business P&L ─────────────────────────────────── */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">account_balance</span>
            <h2 className="font-headline text-base font-bold text-on-surface">Monthly P&amp;L</h2>
          </div>

          {(() => {
            // Fixed costs
            const fixedCosts = {
              vercel: 20,
              supabase: 30,
              domain: 25 / 12, // $25/year → $2.08/mo
              resend: 0, // free tier
            };
            const totalFixed = Object.values(fixedCosts).reduce((a, b) => a + b, 0);

            // Variable costs (token usage estimate based on user count)
            const totalUsers = (data.subscriptions.pro + data.subscriptions.therapy + data.subscriptions.trialing + data.subscriptions.free) || 1;
            const activeUsers = Math.max(Math.round(totalUsers * 0.3), 1); // ~30% DAU estimate

            // Token cost estimates per active user/day
            const coachCostPerDay = 0.005; // hybrid: mostly static, some Haiku
            const alertCostPerDay = 0.003; // cached + Sonnet fallback
            const checkinCostPerDay = 0.001; // Haiku
            const reflectionCostPerWeek = 0.01; // Sonnet, weekly
            const startersCostPerDay = 0.001; // Haiku, cached 6h

            const dailyTokenCost = activeUsers * (coachCostPerDay + alertCostPerDay + checkinCostPerDay + startersCostPerDay);
            const weeklyTokenCost = activeUsers * reflectionCostPerWeek;
            const monthlyTokenCost = (dailyTokenCost * 30) + (weeklyTokenCost * 4.3);

            const totalCosts = totalFixed + monthlyTokenCost;
            const grossProfit = mrr.total - totalCosts;
            const grossMargin = mrr.total > 0 ? (grossProfit / mrr.total) * 100 : 0;

            const costRows = [
              { label: 'Vercel (Pro)', amount: fixedCosts.vercel, type: 'fixed' as const },
              { label: 'Supabase (Pro)', amount: fixedCosts.supabase, type: 'fixed' as const },
              { label: 'Domain (becandid.io)', amount: fixedCosts.domain, type: 'fixed' as const },
              { label: 'Resend (Email)', amount: fixedCosts.resend, type: 'fixed' as const },
              { label: `Claude API (~${activeUsers} active users)`, amount: monthlyTokenCost, type: 'variable' as const },
            ];

            return (
              <div className="space-y-4">
                {/* Revenue vs Cost summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                    <p className="text-[10px] font-label font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Gross Revenue</p>
                    <p className="font-headline text-xl font-extrabold text-emerald-800 dark:text-emerald-300">${mrr.total.toFixed(2)}</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-center">
                    <p className="text-[10px] font-label font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Total Costs</p>
                    <p className="font-headline text-xl font-extrabold text-red-800 dark:text-red-300">${totalCosts.toFixed(2)}</p>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-center ${grossProfit >= 0 ? 'bg-primary/10' : 'bg-error/10'}`}>
                    <p className={`text-[10px] font-label font-bold uppercase tracking-wider ${grossProfit >= 0 ? 'text-primary' : 'text-error'}`}>Net Profit</p>
                    <p className={`font-headline text-xl font-extrabold ${grossProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                      {grossProfit >= 0 ? '' : '-'}${Math.abs(grossProfit).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Margin indicator */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-label font-medium text-on-surface-variant">Gross Margin</span>
                  <div className="flex-1 h-3 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        grossMargin >= 70 ? 'bg-emerald-500' : grossMargin >= 50 ? 'bg-primary' : grossMargin >= 30 ? 'bg-tertiary' : 'bg-error'
                      }`}
                      style={{ width: `${Math.max(Math.min(grossMargin, 100), 0)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-headline font-extrabold ${
                    grossMargin >= 70 ? 'text-emerald-600' : grossMargin >= 50 ? 'text-primary' : 'text-error'
                  }`}>
                    {grossMargin.toFixed(1)}%
                  </span>
                </div>

                {/* Cost breakdown table */}
                <div className="border border-outline-variant/30 rounded-2xl overflow-hidden">
                  <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/30">
                    <div className="flex justify-between text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
                      <span>Expense</span>
                      <span>Monthly</span>
                    </div>
                  </div>
                  {costRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.type === 'fixed' ? 'bg-outline-variant' : 'bg-tertiary'}`} />
                        <span className="text-sm font-body text-on-surface">{row.label}</span>
                      </div>
                      <span className="text-sm font-headline font-bold text-on-surface">${row.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-low">
                    <span className="text-sm font-label font-bold text-on-surface">Total</span>
                    <span className="text-sm font-headline font-extrabold text-on-surface">${totalCosts.toFixed(2)}</span>
                  </div>
                </div>

                {/* Token usage breakdown */}
                <div className="px-4 py-3 rounded-2xl bg-tertiary-container/20 border border-tertiary/10">
                  <p className="text-[10px] font-label font-bold text-tertiary uppercase tracking-wider mb-2">Claude API Token Breakdown (estimated)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-body text-on-surface-variant">
                    <div><span className="font-semibold text-on-surface">Coach:</span> ${(activeUsers * coachCostPerDay * 30).toFixed(2)}/mo</div>
                    <div><span className="font-semibold text-on-surface">Alerts:</span> ${(activeUsers * alertCostPerDay * 30).toFixed(2)}/mo</div>
                    <div><span className="font-semibold text-on-surface">Check-ins:</span> ${(activeUsers * checkinCostPerDay * 30).toFixed(2)}/mo</div>
                    <div><span className="font-semibold text-on-surface">Reflections:</span> ${(activeUsers * reflectionCostPerWeek * 4.3).toFixed(2)}/mo</div>
                    <div><span className="font-semibold text-on-surface">Starters:</span> ${(activeUsers * startersCostPerDay * 30).toFixed(2)}/mo</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs font-label text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-outline-variant" />
                    Fixed costs
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    Variable (scales with users)
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── $7K Net MRR Growth Roadmap ──────────────────────── */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-emerald-600">rocket_launch</span>
            <h2 className="font-headline text-base font-bold text-on-surface">Path to $7K Net MRR</h2>
          </div>

          {(() => {
            // Current state
            const currentMrr = mrr.total;
            const targetNetMrr = 7000;

            // Cost model
            const fixedCostsMonthly = 52.08; // Vercel $20 + Supabase $30 + Domain $2.08
            const costPerActiveUser = 0.30; // ~$0.30/mo/active user (hybrid coach + Haiku)
            const activeUserRatio = 0.30; // 30% of total users are daily active

            // Revenue assumptions
            const proPrice = 9.99;
            const therapyPrice = 19.99;
            const orgPricePerUser = 7.00;
            const proConversionRate = 0.20; // 20% of users → Pro
            const therapyConversionRate = 0.05; // 5% → Therapy
            const orgConversionRate = 0.05; // 5% on org plans
            const freeRate = 0.70; // 70% stay free

            // Calculate: what total users needed for $7K net MRR?
            // Net MRR = Gross MRR - Fixed Costs - Variable Costs
            // Gross MRR per user = (0.20 × $9.99) + (0.05 × $19.99) + (0.05 × $7.00) = $2.00 + $1.00 + $0.35 = $3.35 ARPU
            // Variable cost per user = 0.30 × $0.30 = $0.09/user/mo
            // Net per user = $3.35 - $0.09 = $3.26/user/mo
            // $7K net = $7,000 + $52.08 fixed = $7,052.08 gross needed
            // Users = $7,052.08 / $3.26 = ~2,163 users

            const arpuBlended = (proConversionRate * proPrice) + (therapyConversionRate * therapyPrice) + (orgConversionRate * orgPricePerUser);
            const variableCostPerUser = activeUserRatio * costPerActiveUser;
            const netPerUser = arpuBlended - variableCostPerUser;
            const usersNeeded = Math.ceil((targetNetMrr + fixedCostsMonthly) / netPerUser);

            const grossAtTarget = usersNeeded * arpuBlended;
            const variableAtTarget = usersNeeded * variableCostPerUser;
            const totalCostAtTarget = fixedCostsMonthly + variableAtTarget;
            const marginAtTarget = ((grossAtTarget - totalCostAtTarget) / grossAtTarget) * 100;

            // Milestones
            const milestones = [
              { users: 100, label: 'Early Adopters', netMrr: Math.round(100 * netPerUser - fixedCostsMonthly), icon: 'group' },
              { users: 500, label: 'Product-Market Fit', netMrr: Math.round(500 * netPerUser - fixedCostsMonthly), icon: 'trending_up' },
              { users: 1000, label: 'Growth Phase', netMrr: Math.round(1000 * netPerUser - fixedCostsMonthly), icon: 'speed' },
              { users: usersNeeded, label: '$7K Net MRR', netMrr: targetNetMrr, icon: 'flag' },
              { users: 5000, label: 'Scale', netMrr: Math.round(5000 * netPerUser - fixedCostsMonthly), icon: 'rocket' },
            ];

            const totalUsers = (data.subscriptions.pro + data.subscriptions.therapy + data.subscriptions.trialing + data.subscriptions.free) || 0;
            const progressPct = Math.min((totalUsers / usersNeeded) * 100, 100);

            return (
              <div className="space-y-5">
                {/* Target summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                    <p className="text-[10px] font-label font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Target</p>
                    <p className="font-headline text-xl font-extrabold text-emerald-800 dark:text-emerald-300">${targetNetMrr.toLocaleString()}</p>
                    <p className="text-[9px] text-emerald-600">net MRR/month</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-primary/10 text-center">
                    <p className="text-[10px] font-label font-bold text-primary uppercase tracking-wider">Users Needed</p>
                    <p className="font-headline text-xl font-extrabold text-primary">{usersNeeded.toLocaleString()}</p>
                    <p className="text-[9px] text-on-surface-variant">total signups</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-surface-container text-center">
                    <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Blended ARPU</p>
                    <p className="font-headline text-xl font-extrabold text-on-surface">${arpuBlended.toFixed(2)}</p>
                    <p className="text-[9px] text-on-surface-variant">per user/month</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-surface-container text-center">
                    <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Margin at Target</p>
                    <p className="font-headline text-xl font-extrabold text-on-surface">{marginAtTarget.toFixed(0)}%</p>
                    <p className="text-[9px] text-on-surface-variant">gross margin</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-label font-medium text-on-surface-variant">
                      Progress: {totalUsers.toLocaleString()} / {usersNeeded.toLocaleString()} users
                    </span>
                    <span className="text-xs font-label font-bold text-primary">{progressPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700"
                      style={{ width: `${Math.max(progressPct, 1)}%` }}
                    />
                  </div>
                </div>

                {/* Milestone roadmap */}
                <div className="space-y-2">
                  <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Milestones</p>
                  {milestones.map((m, i) => {
                    const reached = totalUsers >= m.users;
                    const isTarget = m.label === '$7K Net MRR';
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                          isTarget
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : reached
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-surface-container-low border-outline-variant/30'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${
                          reached ? 'text-emerald-600' : isTarget ? 'text-emerald-500' : 'text-on-surface-variant/40'
                        }`} style={reached ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          {reached ? 'check_circle' : m.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-label font-bold ${reached ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              {m.users.toLocaleString()} users
                            </span>
                            {isTarget && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-label font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                TARGET
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-body ${reached ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>{m.label}</span>
                        </div>
                        <span className={`text-sm font-headline font-extrabold ${
                          isTarget ? 'text-emerald-700 dark:text-emerald-400' : reached ? 'text-on-surface' : 'text-on-surface-variant/50'
                        }`}>
                          ${m.netMrr.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Assumptions */}
                <div className="px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider mb-2">Assumptions</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs font-body text-on-surface-variant">
                    <div>Pro conversion: <span className="font-semibold text-on-surface">{(proConversionRate * 100)}%</span> at ${proPrice}/mo</div>
                    <div>Therapy conversion: <span className="font-semibold text-on-surface">{(therapyConversionRate * 100)}%</span> at ${therapyPrice}/mo</div>
                    <div>Org plans: <span className="font-semibold text-on-surface">{(orgConversionRate * 100)}%</span> at ${orgPricePerUser}/user/mo</div>
                    <div>Free users: <span className="font-semibold text-on-surface">{(freeRate * 100)}%</span></div>
                    <div>Active rate: <span className="font-semibold text-on-surface">{(activeUserRatio * 100)}%</span> DAU</div>
                    <div>API cost/active user: <span className="font-semibold text-on-surface">${costPerActiveUser}/mo</span></div>
                  </div>
                </div>

                {/* Growth levers */}
                <div className="px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-label font-bold text-primary uppercase tracking-wider mb-2">Growth Levers</p>
                  <div className="space-y-1.5 text-xs font-body text-on-surface-variant">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">church</span>
                      <span><span className="font-semibold text-on-surface">Church/Org plans</span> — 10 churches × 20 users = 200 users at $7/mo = $1,400 MRR</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">medical_services</span>
                      <span><span className="font-semibold text-on-surface">Therapist referrals</span> — 50 therapists × 5 clients = 250 users with higher Therapy conversion</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">share</span>
                      <span><span className="font-semibold text-on-surface">Referral program</span> — each user invites 1.5 partners → organic growth loop</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">search</span>
                      <span><span className="font-semibold text-on-surface">SEO blog</span> — "covenant eyes alternative" + 9 more posts targeting competitor keywords</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">campaign</span>
                      <span><span className="font-semibold text-on-surface">Annual plans</span> — $79/yr (34% off) locks in revenue, reduces churn 3-4×</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Churn */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface">
              Churn Rate
            </h2>
            <div className="flex gap-1">
              {(['30d', '60d', '90d'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setChurnWindow(w)}
                  className={`px-2.5 py-1 text-xs font-label font-medium rounded-full transition-colors ${
                    churnWindow === w
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <p className="font-headline text-4xl font-extrabold text-on-surface">
              {churnRate.toFixed(1)}%
            </p>
            <p className="text-sm text-on-surface-variant font-body pb-1">
              {churnedCount} users churned
            </p>
          </div>
          <div className="h-2 rounded-full bg-surface-container overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                churnRate > 10
                  ? 'bg-error'
                  : churnRate > 5
                    ? 'bg-tertiary'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(churnRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant font-body">
            {churnRate <= 5
              ? 'Healthy churn rate'
              : churnRate <= 10
                ? 'Moderate churn -- monitor closely'
                : 'High churn -- investigate causes'}
          </p>
        </div>

        {/* Revenue by source */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Revenue by Source
          </h2>
          <div className="space-y-3">
            <SourceRow
              label="Direct Signups"
              value={revenue_by_source.direct}
              icon="open_in_new"
            />
            <SourceRow
              label="Referrals"
              value={revenue_by_source.referral}
              icon="share"
            />
            <SourceRow
              label="Therapist Referrals"
              value={revenue_by_source.therapist_referral}
              icon="health_and_safety"
            />
            <SourceRow
              label="Org Plans"
              value={revenue_by_source.org}
              icon="corporate_fare"
            />
          </div>
          {/* Mini bar */}
          {(() => {
            const total =
              revenue_by_source.direct +
              revenue_by_source.referral +
              revenue_by_source.therapist_referral +
              revenue_by_source.org || 1;
            return (
              <div className="flex h-3 rounded-full overflow-hidden bg-surface-container">
                <div
                  className="bg-primary"
                  style={{
                    width: `${(revenue_by_source.direct / total) * 100}%`,
                  }}
                />
                <div
                  className="bg-secondary"
                  style={{
                    width: `${(revenue_by_source.referral / total) * 100}%`,
                  }}
                />
                <div
                  className="bg-tertiary"
                  style={{
                    width: `${(revenue_by_source.therapist_referral / total) * 100}%`,
                  }}
                />
                <div
                  className="bg-outline-variant"
                  style={{
                    width: `${(revenue_by_source.org / total) * 100}%`,
                  }}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-2">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="text-xs font-label font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-headline text-2xl font-extrabold text-on-surface">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-on-surface-variant font-body">{sub}</p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs font-label text-on-surface-variant">{label}</span>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  pct,
  isFirst,
}: {
  label: string;
  value: number;
  pct: number;
  isFirst?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-label text-on-surface">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-headline text-sm font-bold text-on-surface">
            {value.toLocaleString()}
          </span>
          {!isFirst && (
            <span className="text-xs font-label text-on-surface-variant">
              ({pct.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
      <div className="h-3 rounded-full bg-surface-container overflow-hidden">
        <div
          className="h-full bg-primary/70 rounded-full transition-all duration-700"
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
    </div>
  );
}

function SourceRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-on-surface-variant">
          {icon}
        </span>
        <span className="text-sm font-label text-on-surface-variant">{label}</span>
      </div>
      <span className="font-headline text-lg font-bold text-on-surface">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
