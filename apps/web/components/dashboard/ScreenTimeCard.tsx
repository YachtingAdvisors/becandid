'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryUsage {
  category: string;
  minutes: number;
  limit_minutes: number | null;
  color: string;
}

interface ScreenTimeData {
  total_minutes: number;
  categories: CategoryUsage[];
}

const DEFAULT_COLORS = ['#226779', '#47636d', '#845500', '#a4e4f8', '#c9e8f3', '#fdbe66'];

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ScreenTimeCard() {
  const [data, setData] = useState<ScreenTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/screen-time/usage')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="space-y-3">
          <div className="h-4 skeleton-shimmer rounded w-32" />
          <div className="h-8 skeleton-shimmer rounded w-20" />
          <div className="space-y-2">
            <div className="h-3 skeleton-shimmer rounded" />
            <div className="h-3 skeleton-shimmer rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const totalMinutes = data?.total_minutes ?? 0;
  const categories = (data?.categories ?? []).map((c, i) => ({
    ...c,
    color: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  const hasOverLimit = categories.some(
    (c) => c.limit_minutes !== null && c.minutes > c.limit_minutes
  );

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-bold text-on-surface">Screen Time Today</h3>
        <Link
          href="/dashboard/screen-time"
          className="text-xs text-primary font-label font-medium hover:underline"
        >
          View Details
        </Link>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-headline text-3xl font-extrabold text-on-surface">
          {formatMinutes(totalMinutes)}
        </span>
        {hasOverLimit && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-label font-semibold">
            Over limit
          </span>
        )}
      </div>

      {categories.length > 0 && (
        <div className="space-y-2.5">
          {categories.map((cat) => {
            const maxVal = cat.limit_minutes ?? totalMinutes;
            const pct = maxVal > 0 ? Math.min((cat.minutes / maxVal) * 100, 100) : 0;
            const overLimit =
              cat.limit_minutes !== null && cat.minutes > cat.limit_minutes;

            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-label font-medium text-on-surface capitalize">
                    {cat.category.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`font-label ${overLimit ? 'text-error font-semibold' : 'text-on-surface-variant'}`}
                  >
                    {formatMinutes(cat.minutes)}
                    {cat.limit_minutes !== null && ` / ${formatMinutes(cat.limit_minutes)}`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: overLimit ? '#a83836' : cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-xs text-on-surface-variant font-body">
          No screen time data available yet.
        </p>
      )}
    </div>
  );
}
