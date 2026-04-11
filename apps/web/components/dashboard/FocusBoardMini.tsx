'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeatmapDay {
  date: string;
  morning: 'focused' | 'distracted' | 'pending';
  evening: 'focused' | 'distracted' | 'pending';
}

interface MiniStats {
  balance: number;
  streak: { streakDays: number; streakSegments: number };
  heatmap: HeatmapDay[];
}

const STATUS_COLORS = {
  focused: 'bg-emerald-400',
  distracted: 'bg-red-400',
  pending: 'bg-surface-container',
};

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'narrow' });
}

export default function FocusBoardMini() {
  const [stats, setStats] = useState<MiniStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trust-points/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 animate-pulse">
        <div className="h-16 bg-surface-container-low rounded" />
      </div>
    );
  }

  if (!stats) return null;

  // Show last 7 days from the heatmap
  const last7 = stats.heatmap.slice(-7);
  const today = last7[last7.length - 1];

  const todayMorning = today?.morning || 'pending';
  const todayEvening = today?.evening || 'pending';

  const todayLabel =
    todayMorning === 'focused' && todayEvening === 'focused'
      ? 'Fully Focused'
      : todayMorning === 'pending' && todayEvening === 'pending'
        ? 'Day Starting'
        : todayMorning === 'focused' || todayEvening === 'focused'
          ? 'Partially Focused'
          : 'Distracted';

  const todayIcon =
    todayMorning === 'focused' && todayEvening === 'focused'
      ? 'check_circle'
      : todayMorning === 'pending' && todayEvening === 'pending'
        ? 'remove'
        : todayMorning === 'focused' || todayEvening === 'focused'
          ? 'bolt'
          : 'warning';

  return (
    <Link href="/dashboard/focus" className="group relative bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/25 hover:shadow-lg hover:shadow-primary/[0.06] transition-all duration-300 block">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-semibold text-on-surface tracking-tight">
          Focus Board
        </h3>
        <span className="text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform duration-300">View full &rarr;</span>
      </div>

      {/* Top stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center px-2">
          <div className="text-xl font-bold text-primary tabular-nums">{stats.balance.toLocaleString()}</div>
          <div className="text-[10px] text-on-surface-variant/70 font-label uppercase tracking-wider mt-0.5">Trust Pts</div>
        </div>
        <div className="w-px h-8 bg-outline-variant/15" />
        <div className="text-center px-2">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.streak.streakDays}</div>
          <div className="text-[10px] text-on-surface-variant/70 font-label uppercase tracking-wider mt-0.5">Day Streak</div>
        </div>
        <div className="w-px h-8 bg-outline-variant/15" />
        <div className="text-center flex-1 px-2">
          <span className="material-symbols-outlined text-xl text-on-surface-variant">{todayIcon}</span>
          <div className="text-[10px] text-on-surface-variant/70 font-label mt-0.5">{todayLabel}</div>
        </div>
      </div>

      {/* 7-day mini heatmap */}
      <div className="grid grid-cols-7 gap-1.5">
        {last7.map((day) => (
          <div key={day.date} className="text-center">
            <div className="text-[9px] text-on-surface-variant/60 font-label mb-1">{getDayLabel(day.date)}</div>
            <div className={`h-3.5 rounded-t-sm transition-colors duration-300 ${STATUS_COLORS[day.morning]}`} />
            <div className={`h-3.5 rounded-b-sm mt-px transition-colors duration-300 ${STATUS_COLORS[day.evening]}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline-variant/10 text-[10px] text-on-surface-variant/60 font-label">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Focused
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Distracted
        </span>
      </div>
    </Link>
  );
}
