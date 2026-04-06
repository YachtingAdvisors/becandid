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
