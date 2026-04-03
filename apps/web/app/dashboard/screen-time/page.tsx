import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ScreenTimeDashboardClient from './ScreenTimeDashboardClient';

export const metadata: Metadata = {
  title: 'Screen Time',
  description: 'Monitor and manage your screen time usage across categories.',
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  pornography: '🔞',
  sexting: '💬',
  social_media: '📱',
  binge_watching: '📺',
  gambling: '🎰',
  gaming: '🎮',
  dating_apps: '💘',
  substances: '🍺',
  doom_scrolling: '📜',
  custom: '⚙️',
  all: '📊',
};

const CATEGORY_COLORS: Record<string, string> = {
  pornography: '#a83836',
  sexting: '#845500',
  social_media: '#226779',
  binge_watching: '#47636d',
  gambling: '#c9553a',
  gaming: '#5b7a3d',
  dating_apps: '#b5457a',
  substances: '#6d5c47',
  doom_scrolling: '#5a6378',
  custom: '#767676',
  all: '#226779',
};

export default async function ScreenTimePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const db = createServiceClient();

  const today = new Date().toISOString().split('T')[0];

  // Compute the last 7 days (Mon-Sun aligned to actual calendar days)
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().split('T')[0]);
  }
  const weekStart = days[0];
  const weekEnd = days[6];

  // Previous week for trend comparison
  const prevDays: string[] = [];
  for (let i = 13; i >= 7; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    prevDays.push(d.toISOString().split('T')[0]);
  }
  const prevWeekStart = prevDays[0];
  const prevWeekEnd = prevDays[6];

  // Fetch all data in parallel
  const [todayUsageRes, weekUsageRes, prevWeekUsageRes, limitsRes, rulesRes] = await Promise.all([
    db.from('screen_time_usage')
      .select('category, minutes_used')
      .eq('user_id', user.id)
      .eq('date', today),
    db.from('screen_time_usage')
      .select('category, minutes_used, date')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    db.from('screen_time_usage')
      .select('category, minutes_used')
      .eq('user_id', user.id)
      .gte('date', prevWeekStart)
      .lte('date', prevWeekEnd),
    db.from('category_time_limits')
      .select('*')
      .eq('user_id', user.id)
      .order('category'),
    db.from('screen_time_rules')
      .select('category, daily_limit_minutes')
      .eq('user_id', user.id),
  ]);

  const todayUsage = todayUsageRes?.data ?? [];
  const weekUsage = weekUsageRes?.data ?? [];
  const prevWeekUsage = prevWeekUsageRes?.data ?? [];
  const categoryLimits = limitsRes?.data ?? [];
  const rules = rulesRes?.data ?? [];

  // Build limit map from both category_time_limits and screen_time_rules
  const limitMap = new Map<string, number | null>();
  for (const rule of rules) {
    limitMap.set(rule.category, rule.daily_limit_minutes);
  }
  for (const cl of categoryLimits) {
    if (cl.enabled) {
      limitMap.set(cl.category, cl.daily_limit_minutes);
    }
  }

  // ── Today's usage summary ──────────────────────────
  const todayTotal = todayUsage.reduce((sum: number, r: any) => sum + (r.minutes_used ?? 0), 0);
  const todayByCategory = new Map<string, number>();
  for (const row of todayUsage) {
    todayByCategory.set(row.category, (todayByCategory.get(row.category) ?? 0) + row.minutes_used);
  }
  const todayCategories = Array.from(todayByCategory.entries())
    .map(([category, minutes]) => ({
      category,
      minutes,
      limit: limitMap.get(category) ?? null,
      overLimit: limitMap.has(category) && limitMap.get(category) !== null && minutes > (limitMap.get(category) as number),
      emoji: CATEGORY_EMOJIS[category] ?? '📊',
      color: CATEGORY_COLORS[category] ?? '#226779',
    }))
    .sort((a, b) => b.minutes - a.minutes);

  // ── Weekly trend ───────────────────────────────────
  // Group usage by date and category
  const weekByDate = new Map<string, Map<string, number>>();
  for (const day of days) {
    weekByDate.set(day, new Map());
  }
  for (const row of weekUsage) {
    const dayMap = weekByDate.get(row.date);
    if (dayMap) {
      dayMap.set(row.category, (dayMap.get(row.category) ?? 0) + row.minutes_used);
    }
  }

  // Get all categories that appear this week
  const allWeekCategories = new Set<string>();
  for (const dayMap of weekByDate.values()) {
    for (const cat of dayMap.keys()) {
      allWeekCategories.add(cat);
    }
  }
  const sortedCategories = Array.from(allWeekCategories).sort();

  // Build weekly chart data
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyChart = days.map((date) => {
    const dayMap = weekByDate.get(date)!;
    const total = Array.from(dayMap.values()).reduce((s, v) => s + v, 0);
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const dailyLimit = limitMap.get('all') ?? null;
    return {
      date,
      label: DAY_LABELS[dayOfWeek],
      total,
      overLimit: dailyLimit !== null && total > dailyLimit,
      categories: sortedCategories.map((cat) => ({
        category: cat,
        minutes: dayMap.get(cat) ?? 0,
        color: CATEGORY_COLORS[cat] ?? '#226779',
      })),
    };
  });
  const maxDailyMinutes = Math.max(...weeklyChart.map((d) => d.total), 60);

  // ── Previous week totals for trend arrows ──────────
  const prevByCategory = new Map<string, number>();
  for (const row of prevWeekUsage) {
    prevByCategory.set(row.category, (prevByCategory.get(row.category) ?? 0) + row.minutes_used);
  }
  const thisWeekByCategory = new Map<string, number>();
  for (const row of weekUsage) {
    thisWeekByCategory.set(row.category, (thisWeekByCategory.get(row.category) ?? 0) + row.minutes_used);
  }

  // ── Top categories (ranked) ────────────────────────
  const weekTotal = Array.from(thisWeekByCategory.values()).reduce((s, v) => s + v, 0);
  const topCategories = Array.from(thisWeekByCategory.entries())
    .map(([category, minutes]) => {
      const prevMinutes = prevByCategory.get(category) ?? 0;
      const pctOfTotal = weekTotal > 0 ? (minutes / weekTotal) * 100 : 0;
      const trend: 'up' | 'down' | 'stable' =
        prevMinutes === 0 ? 'stable' : minutes > prevMinutes * 1.1 ? 'up' : minutes < prevMinutes * 0.9 ? 'down' : 'stable';
      return {
        category,
        minutes,
        pctOfTotal,
        trend,
        emoji: CATEGORY_EMOJIS[category] ?? '📊',
        color: CATEGORY_COLORS[category] ?? '#226779',
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  // Serialize limits for client component
  const limitsForClient = categoryLimits.map((l: any) => ({
    id: l.id,
    category: l.category,
    daily_limit_minutes: l.daily_limit_minutes,
    enabled: l.enabled,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="stagger">
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">
          Monitoring
        </p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">
          Screen Time
        </h1>
        <p className="text-sm text-on-surface-variant font-body">
          Monitor and manage your screen time across categories.
        </p>
      </div>

      {/* ── Today's Usage Summary ─────────────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4 stagger">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface">Today</h2>
          {todayCategories.some((c) => c.overLimit) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/10 text-error text-[10px] font-label font-bold uppercase">
              <span className="material-symbols-outlined text-sm">warning</span>
              Over limit
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-headline text-4xl font-extrabold text-on-surface">
            {formatMinutes(todayTotal)}
          </span>
          <span className="text-sm text-on-surface-variant font-body">total</span>
        </div>

        {todayCategories.length > 0 ? (
          <div className="space-y-3">
            {todayCategories.map((cat) => {
              const maxVal = cat.limit ?? (todayTotal || 1);
              const pct = Math.min((cat.minutes / maxVal) * 100, 100);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-label font-medium text-on-surface">
                      {cat.emoji} {cat.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-label ${
                        cat.overLimit ? 'text-error font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {formatMinutes(cat.minutes)}
                      {cat.limit !== null && ` / ${formatMinutes(cat.limit)}`}
                      {cat.overLimit && ' ⚠️'}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.overLimit ? '#a83836' : cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant font-body">
            No screen time data recorded yet today.
          </p>
        )}
      </section>

      {/* ── Weekly Trend (7-day bar chart) ────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4 stagger">
        <h2 className="font-headline text-lg font-bold text-on-surface">Weekly Trend</h2>

        {weeklyChart.some((d) => d.total > 0) ? (
          <>
            <div className="flex items-end gap-2 h-48">
              {weeklyChart.map((day) => {
                const heightPct = (day.total / maxDailyMinutes) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
                    {/* Time label */}
                    <span className="text-[9px] text-on-surface-variant font-label whitespace-nowrap">
                      {day.total > 0 ? formatMinutes(day.total) : ''}
                    </span>

                    {/* Stacked bar */}
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-lg overflow-hidden transition-all ${
                          day.overLimit ? 'ring-2 ring-error' : ''
                        }`}
                        style={{ height: `${Math.max(heightPct, 3)}%` }}
                      >
                        {day.categories.map((cat) => {
                          const catPct = day.total > 0 ? (cat.minutes / day.total) * 100 : 0;
                          if (catPct === 0) return null;
                          return (
                            <div
                              key={cat.category}
                              style={{
                                height: `${catPct}%`,
                                backgroundColor: cat.color,
                                minHeight: catPct > 0 ? '2px' : '0',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[10px] font-label font-medium ${
                        day.overLimit ? 'text-error font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {sortedCategories.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {sortedCategories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#226779' }}
                    />
                    <span className="text-[10px] font-label text-on-surface-variant capitalize">
                      {cat.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-on-surface-variant font-body">
            No screen time data from the past 7 days.
          </p>
        )}
      </section>

      {/* ── Category Limits (interactive client component) ── */}
      <ScreenTimeDashboardClient limits={limitsForClient} />

      {/* ── Top Categories ────────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3 stagger">
        <h2 className="font-headline text-lg font-bold text-on-surface">Top Categories This Week</h2>

        {topCategories.length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {topCategories.map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3 py-3">
                {/* Rank */}
                <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="text-xs font-headline font-bold text-on-surface-variant">
                    {i + 1}
                  </span>
                </div>

                {/* Emoji + Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-label font-medium text-sm text-on-surface capitalize">
                      {cat.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-on-surface-variant font-label">
                      {formatMinutes(cat.minutes)} this week
                    </span>
                    <span className="text-[10px] text-on-surface-variant/60 font-label">
                      ({Math.round(cat.pctOfTotal)}% of total)
                    </span>
                  </div>
                </div>

                {/* Trend arrow */}
                <div className="shrink-0">
                  {cat.trend === 'up' && (
                    <span className="material-symbols-outlined text-error text-lg">trending_up</span>
                  )}
                  {cat.trend === 'down' && (
                    <span className="material-symbols-outlined text-emerald-600 text-lg">trending_down</span>
                  )}
                  {cat.trend === 'stable' && (
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">trending_flat</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant font-body">
            No category data from this week yet.
          </p>
        )}
      </section>

      {/* Back link */}
      <div className="text-center pb-4 stagger">
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
