'use client';

import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────

interface DauPoint {
  date: string;
  count: number;
}

interface FeatureUsage {
  name: string;
  count: number;
  icon: string;
  pct: number;
  trend: number;
}

interface Rival {
  category: string;
  count: number;
  pct: number;
}

interface Cohort {
  week: string;
  total: number;
  retained: number[];
}

interface EngagementData {
  dau: DauPoint[];
  wau: number;
  mau: number;
  stickiness: number;
  feature_usage: FeatureUsage[];
  top_rivals: Rival[];
  retention_cohorts: Cohort[];
  avg_focused_pct: number;
  total_users: number;
}

// ── Component ───────────────────────────────────────────────

export default function EngagementClient() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/engagement')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load engagement data');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-64 rounded-3xl" />
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
          {error || 'Failed to load engagement data'}
        </p>
      </div>
    );
  }

  const { dau, stickiness, feature_usage, top_rivals, retention_cohorts } = data;

  // ── DAU chart dimensions ──────────────────────────────────
  const chartW = 600;
  const chartH = 160;
  const padX = 36;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;
  const maxDau = Math.max(...dau.map((d) => d.count), 1);

  const dauPoints = dau.map((d, i) => ({
    x: padX + (i / Math.max(dau.length - 1, 1)) * plotW,
    y: padY + plotH - (d.count / maxDau) * plotH,
    ...d,
  }));

  const linePathD = dauPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPathD = `${linePathD} L ${dauPoints[dauPoints.length - 1]?.x ?? padX} ${padY + plotH} L ${padX} ${padY + plotH} Z`;

  // Stickiness benchmark: typical SaaS is 10-20%
  const stickinessColor =
    stickiness >= 20
      ? 'text-green-600'
      : stickiness >= 10
        ? 'text-tertiary'
        : 'text-error';

  const stickinessLabel =
    stickiness >= 20
      ? 'Excellent'
      : stickiness >= 10
        ? 'Average'
        : 'Below average';

  return (
    <div className="space-y-6">
      {/* ── DAU Chart ────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Daily Active Users (30d)
          </h2>
          <div className="flex items-center gap-4">
            <MetricPill label="WAU" value={data.wau.toLocaleString()} />
            <MetricPill label="MAU" value={data.mau.toLocaleString()} />
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-40"
          preserveAspectRatio="none"
        >
          {/* Y-axis labels */}
          <text
            x={padX - 4}
            y={padY + 4}
            textAnchor="end"
            className="fill-on-surface-variant text-[9px] font-label"
          >
            {maxDau}
          </text>
          <text
            x={padX - 4}
            y={padY + plotH + 4}
            textAnchor="end"
            className="fill-on-surface-variant text-[9px] font-label"
          >
            0
          </text>

          {/* Grid lines */}
          <line
            x1={padX}
            y1={padY}
            x2={padX + plotW}
            y2={padY}
            stroke="currentColor"
            className="text-outline-variant"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={padY + plotH / 2}
            x2={padX + plotW}
            y2={padY + plotH / 2}
            stroke="currentColor"
            className="text-outline-variant"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <line
            x1={padX}
            y1={padY + plotH}
            x2={padX + plotW}
            y2={padY + plotH}
            stroke="currentColor"
            className="text-outline-variant"
            strokeWidth="0.5"
          />

          {/* Area fill */}
          <path d={areaPathD} className="fill-primary/10" />

          {/* Line */}
          <path
            d={linePathD}
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots for first, last, and max */}
          {dauPoints
            .filter(
              (p, i) =>
                i === 0 ||
                i === dauPoints.length - 1 ||
                p.count === maxDau,
            )
            .map((p) => (
              <circle
                key={p.date}
                cx={p.x}
                cy={p.y}
                r="3"
                className="fill-primary"
              />
            ))}

          {/* X-axis labels (every 7 days) */}
          {dauPoints
            .filter((_, i) => i % 7 === 0)
            .map((p) => (
              <text
                key={p.date}
                x={p.x}
                y={chartH - 2}
                textAnchor="middle"
                className="fill-on-surface-variant text-[8px] font-label"
              >
                {new Date(p.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            ))}
        </svg>
      </div>

      {/* ── Stickiness + Feature Usage ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stickiness */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Stickiness (DAU/MAU)
          </h2>
          <div className="flex items-end gap-3">
            <p
              className={`font-headline text-4xl font-extrabold ${stickinessColor}`}
            >
              {stickiness.toFixed(1)}%
            </p>
            <p className="text-sm text-on-surface-variant font-body pb-1">
              {stickinessLabel}
            </p>
          </div>
          {/* Gauge bar */}
          <div className="relative h-3 rounded-full bg-surface-container overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(stickiness, 100)}%` }}
            />
            {/* 20% benchmark marker */}
            <div
              className="absolute inset-y-0 w-px bg-on-surface-variant/40"
              style={{ left: '20%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-label text-on-surface-variant">
            <span>0%</span>
            <span>20% (benchmark)</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-on-surface-variant font-body">
            Focused sessions: {data.avg_focused_pct}% of all segments
          </p>
        </div>

        {/* Feature usage */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Feature Usage (7d)
          </h2>
          <div className="space-y-2.5">
            {feature_usage.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-on-surface-variant w-5 text-center">
                  {f.icon}
                </span>
                <span className="text-sm font-label text-on-surface w-20 flex-shrink-0">
                  {f.name}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-500"
                    style={{ width: `${f.trend}%` }}
                  />
                </div>
                <span className="text-xs font-label font-semibold text-on-surface w-12 text-right">
                  {f.count.toLocaleString()}
                </span>
                <span className="text-xs font-label text-on-surface-variant w-14 text-right">
                  {f.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Rivals + Retention ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top rivals */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Top Rivals (Categories)
          </h2>
          <div className="space-y-2.5">
            {top_rivals.map((r, i) => {
              const maxCount = top_rivals[0]?.count || 1;
              return (
                <div key={r.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-label text-on-surface capitalize">
                      {i + 1}. {r.category}
                    </span>
                    <span className="text-xs font-label text-on-surface-variant">
                      {r.count} ({r.pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary/70 transition-all duration-500"
                      style={{
                        width: `${(r.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {top_rivals.length === 0 && (
              <p className="text-sm text-on-surface-variant font-body">
                No goal categories found.
              </p>
            )}
          </div>
        </div>

        {/* Retention cohorts */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Weekly Retention Cohorts
          </h2>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs font-label">
              <thead>
                <tr className="text-on-surface-variant">
                  <th className="text-left py-1.5 px-1 font-medium">Cohort</th>
                  <th className="text-center py-1.5 px-1 font-medium">Users</th>
                  <th className="text-center py-1.5 px-1 font-medium">W0</th>
                  <th className="text-center py-1.5 px-1 font-medium">W1</th>
                  <th className="text-center py-1.5 px-1 font-medium">W2</th>
                  <th className="text-center py-1.5 px-1 font-medium">W3</th>
                  <th className="text-center py-1.5 px-1 font-medium">W4</th>
                </tr>
              </thead>
              <tbody>
                {retention_cohorts.map((c) => (
                  <tr key={c.week} className="border-t border-outline-variant/50">
                    <td className="py-1.5 px-1 text-on-surface font-medium">
                      {c.week}
                    </td>
                    <td className="text-center py-1.5 px-1 text-on-surface">
                      {c.total}
                    </td>
                    {Array.from({ length: 5 }).map((_, wi) => {
                      const val = c.retained[wi];
                      if (val === undefined) {
                        return (
                          <td
                            key={wi}
                            className="text-center py-1.5 px-1 text-on-surface-variant/40"
                          >
                            --
                          </td>
                        );
                      }
                      const intensity = Math.min(val / 100, 1);
                      return (
                        <td
                          key={wi}
                          className="text-center py-1.5 px-1 rounded"
                          style={{
                            backgroundColor: `oklch(0.85 0.12 145 / ${intensity * 0.6 + 0.05})`,
                          }}
                        >
                          <span className="font-semibold text-on-surface">
                            {val.toFixed(0)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {retention_cohorts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-4 text-on-surface-variant"
                    >
                      Not enough data for cohort analysis yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container">
      <span className="text-[10px] font-label font-medium text-on-surface-variant uppercase">
        {label}
      </span>
      <span className="text-xs font-headline font-bold text-on-surface">
        {value}
      </span>
    </div>
  );
}
