'use client';

import { useState, useEffect } from 'react';

interface AppUsage {
  app_name: string;
  minutes: number;
  category: string;
}

interface UsageData {
  total_minutes_today: number;
  total_minutes_yesterday: number;
  total_minutes_last_week_avg: number;
  categories: { category: string; minutes: number; color: string }[];
  top_apps: AppUsage[];
}

const DEFAULT_COLORS = ['#226779', '#47636d', '#845500', '#a4e4f8', '#c9e8f3', '#fdbe66'];

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function UsageBreakdown() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/screen-time/breakdown')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-container-low rounded w-40" />
          <div className="h-6 bg-surface-container-low rounded" />
          <div className="h-20 bg-surface-container-low rounded" />
        </div>
      </div>
    );
  }

  const today = data?.total_minutes_today ?? 0;
  const yesterday = data?.total_minutes_yesterday ?? 0;
  const weekAvg = data?.total_minutes_last_week_avg ?? 0;
  const categories = (data?.categories ?? []).map((c, i) => ({
    ...c,
    color: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  const topApps = data?.top_apps ?? [];
  const totalCatMinutes = categories.reduce((sum, c) => sum + c.minutes, 0) || 1;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-5">
      <h3 className="font-headline text-sm font-bold text-on-surface">Usage Breakdown</h3>

      {/* Stacked bar */}
      {categories.length > 0 && (
        <div>
          <div className="h-4 rounded-full overflow-hidden flex">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="h-full transition-all"
                style={{
                  width: `${(cat.minutes / totalCatMinutes) * 100}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.category}: ${formatMinutes(cat.minutes)}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {categories.map((cat) => (
              <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-on-surface-variant font-label capitalize">
                  {cat.category.replace(/_/g, ' ')}
                </span>
                <span className="text-on-surface font-label font-medium">
                  {formatMinutes(cat.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Apps */}
      {topApps.length > 0 && (
        <div>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mb-2">
            Top Apps
          </p>
          <div className="space-y-2">
            {topApps.slice(0, 5).map((app, i) => (
              <div key={app.app_name} className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-label w-4 text-right">
                  {i + 1}
                </span>
                <span className="text-sm font-body text-on-surface flex-1 truncate">
                  {app.app_name}
                </span>
                <span className="text-xs text-on-surface-variant font-label">
                  {formatMinutes(app.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="flex gap-4 pt-2 border-t border-outline-variant/50">
        <div className="text-center flex-1">
          <div className="text-lg font-headline font-bold text-on-surface">
            {formatMinutes(today)}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label">Today</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-lg font-headline font-bold text-on-surface-variant">
            {formatMinutes(yesterday)}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label">Yesterday</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-lg font-headline font-bold text-on-surface-variant">
            {formatMinutes(weekAvg)}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label">Week Avg</div>
        </div>
      </div>
    </div>
  );
}
