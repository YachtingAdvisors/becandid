'use client';

import { useState, useEffect } from 'react';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory } from '@be-candid/shared';

interface StreakData {
  balance: number;
  streak: { streakDays: number; streakSegments: number };
  heatmap: Array<{ date: string; morning: string; evening: string }>;
}

export default function StreaksPage() {
  const [data, setData] = useState<StreakData | null>(null);
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/trust-points/stats').then(r => r.json()),
      fetch('/api/auth/profile').then(r => r.json()),
    ])
      .then(([stats, profileData]) => {
        setData(stats);
        setGoals(profileData.profile?.goals ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="card p-8 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>
      </div>
    );
  }

  const heatmap = data.heatmap;
  const totalDays = heatmap.filter(d => d.morning !== 'pending' || d.evening !== 'pending').length;
  const fullFocusDays = heatmap.filter(d => d.morning === 'focused' && d.evening === 'focused').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">In the Zone</h1>
        <p className="text-sm text-ink-muted">Your focus streak and category performance.</p>
      </div>

      {/* Streak hero */}
      <div className="card p-6 text-center bg-gradient-to-br from-emerald-50 to-brand-50 border-emerald-200">
        <div className="text-5xl font-display font-bold text-emerald-600 mb-1">
          {data.streak.streakDays}
        </div>
        <div className="text-sm text-emerald-700 font-medium">
          day focus streak
        </div>
        <div className="text-xs text-ink-muted mt-2">
          {fullFocusDays} full focused days out of {totalDays} tracked
        </div>

        {/* Milestone markers */}
        <div className="flex justify-center gap-2 mt-4">
          {[7, 14, 30, 60, 90].map(m => (
            <div key={m} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              data.streak.streakDays >= m
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}>
              {data.streak.streakDays >= m ? '🏅' : '○'} {m}d
            </div>
          ))}
        </div>
      </div>

      {/* Tracked categories */}
      {goals.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">Your Rivals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {goals.map(goal => (
              <div key={goal} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-muted border border-surface-border">
                <span className="text-xl">{getCategoryEmoji(goal)}</span>
                <div>
                  <div className="text-sm font-medium text-ink leading-tight">{GOAL_LABELS[goal]}</div>
                  <div className="text-[10px] text-ink-muted">Monitoring active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21-day heatmap recap */}
      <div className="card p-5">
        <h3 className="font-display text-sm font-semibold text-ink mb-3">21-Day Overview</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmap.map(day => {
            const bothFocused = day.morning === 'focused' && day.evening === 'focused';
            const anyDistracted = day.morning === 'distracted' || day.evening === 'distracted';
            const pending = day.morning === 'pending' && day.evening === 'pending';

            return (
              <div key={day.date}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                  pending ? 'bg-gray-100 text-gray-400'
                  : bothFocused ? 'bg-emerald-400 text-white'
                  : anyDistracted ? 'bg-red-400 text-white'
                  : 'bg-amber-300 text-amber-800'
                }`}
                title={`${day.date}: AM=${day.morning}, PM=${day.evening}`}
              >
                {new Date(day.date + 'T12:00:00').getDate()}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Full day focused</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> Distracted</span>
        </div>
      </div>
    </div>
  );
}
