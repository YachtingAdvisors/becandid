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
  pending: 'bg-gray-200',
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
      <div className="card p-4 animate-pulse">
        <div className="h-16 bg-gray-100 rounded" />
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
    <Link href="/dashboard/focus" className="card p-4 hover:shadow-md transition-shadow block">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-ink">
          Focus Board
        </h3>
        <span className="text-xs text-brand-600 font-medium">View full →</span>
      </div>

      {/* Top stats row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="text-xl font-bold text-brand-600">{stats.balance.toLocaleString()}</div>
          <div className="text-[10px] text-ink-muted">Trust Pts</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-600">{stats.streak.streakDays}</div>
          <div className="text-[10px] text-ink-muted">Day Streak</div>
        </div>
        <div className="text-center flex-1">
          <span className="material-symbols-outlined text-xl">{todayIcon}</span>
          <div className="text-[10px] text-ink-muted">{todayLabel}</div>
        </div>
      </div>

      {/* 7-day mini heatmap */}
      <div className="grid grid-cols-7 gap-1">
        {last7.map((day) => (
          <div key={day.date} className="text-center">
            <div className="text-[9px] text-ink-muted mb-0.5">{getDayLabel(day.date)}</div>
            <div className={`h-3 rounded-t-sm ${STATUS_COLORS[day.morning]}`} />
            <div className={`h-3 rounded-b-sm mt-px ${STATUS_COLORS[day.evening]}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-2 text-[9px] text-ink-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> Focused
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Distracted
        </span>
      </div>
    </Link>
  );
}
