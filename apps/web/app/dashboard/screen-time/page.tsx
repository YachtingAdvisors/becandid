'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryUsage {
  category: string;
  minutes: number;
  limit_minutes: number | null;
  color: string;
}

interface DailyUsage {
  date: string;
  minutes: number;
}

interface DowntimeSchedule {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  days: string[];
  enabled: boolean;
}

interface ScreenTimePageData {
  total_minutes_today: number;
  categories: CategoryUsage[];
  weekly_trend: DailyUsage[];
  downtime_schedules: DowntimeSchedule[];
  is_teen: boolean;
}

const DEFAULT_COLORS = ['#226779', '#47636d', '#845500', '#a4e4f8', '#c9e8f3', '#fdbe66'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ScreenTimePage() {
  const [data, setData] = useState<ScreenTimePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/screen-time/details')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() =>
        setData({
          total_minutes_today: 0,
          categories: [],
          weekly_trend: [],
          downtime_schedules: [],
          is_teen: false,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded w-48" />
          <div className="h-40 bg-surface-container-low rounded-3xl" />
          <div className="h-60 bg-surface-container-low rounded-3xl" />
        </div>
      </div>
    );
  }

  const totalMinutes = data?.total_minutes_today ?? 0;
  const categories = (data?.categories ?? []).map((c, i) => ({
    ...c,
    color: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));
  const weeklyTrend = data?.weekly_trend ?? [];
  const maxWeekly = Math.max(...weeklyTrend.map((d) => d.minutes), 1);
  const downtimeSchedules = data?.downtime_schedules ?? [];
  const isTeen = data?.is_teen ?? false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Monitoring</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Screen Time</h1>
        <p className="text-sm text-on-surface-variant font-body">
          Monitor and manage screen time usage.
        </p>
      </div>

      {isTeen && (
        <div className="bg-tertiary-container/40 rounded-2xl px-4 py-3 text-xs text-on-tertiary-container font-body">
          Some screen time rules are set by your guardian and cannot be changed here.
        </div>
      )}

      {/* Today's Overview */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Today</h2>
        <div className="flex items-baseline gap-2">
          <span className="font-headline text-4xl font-extrabold text-on-surface">
            {formatMinutes(totalMinutes)}
          </span>
          <span className="text-sm text-on-surface-variant font-body">total</span>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const maxVal = cat.limit_minutes ?? (totalMinutes || 1);
              const pct = Math.min((cat.minutes / maxVal) * 100, 100);
              const overLimit = cat.limit_minutes !== null && cat.minutes > cat.limit_minutes;

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
                  <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
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
      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
          <h2 className="font-headline text-lg font-bold text-on-surface">Weekly Trend</h2>
          <div className="flex items-end gap-2 h-40">
            {weeklyTrend.map((day, i) => {
              const pct = (day.minutes / maxWeekly) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-on-surface-variant font-label">
                    {formatMinutes(day.minutes)}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-label">
                    {DAY_LABELS[i % 7]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Downtime Schedule */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Downtime Schedule</h2>
        {downtimeSchedules.length === 0 ? (
          <p className="text-sm text-on-surface-variant font-body">
            No downtime schedules configured.
          </p>
        ) : (
          <div className="space-y-3">
            {downtimeSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between bg-surface-container-low rounded-2xl px-4 py-3 hover:ring-1 hover:ring-primary/20 transition-all duration-200"
              >
                <div>
                  <div className="text-sm font-label font-medium text-on-surface">
                    {schedule.label}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">
                    {schedule.start_time} &ndash; {schedule.end_time} &middot;{' '}
                    {schedule.days.join(', ')}
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold ${
                    schedule.enabled
                      ? 'bg-primary-container text-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {schedule.enabled ? 'Active' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-sm text-primary font-label font-medium hover:underline cursor-pointer transition-colors duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
