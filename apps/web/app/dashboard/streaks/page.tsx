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
        <div className="h-8 bg-surface-container rounded w-48 animate-pulse" />
        <div className="card p-8 animate-pulse"><div className="h-40 bg-surface-container-low rounded" /></div>
      </div>
    );
  }

  const heatmap = data.heatmap;
  const totalDays = heatmap.filter(d => d.morning !== 'pending' || d.evening !== 'pending').length;
  const fullFocusDays = heatmap.filter(d => d.morning === 'focused' && d.evening === 'focused').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Streaks</h1>
          <p className="text-sm text-on-surface-variant font-body">Your focus streak and category performance.</p>
        </div>
      </div>

      {/* Streak hero */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 text-center bg-gradient-to-br from-emerald-50 to-primary-container">
        <div className="text-5xl font-headline font-bold text-primary mb-1">
          {data.streak.streakDays}
        </div>
        <div className="text-sm text-primary font-medium font-label">
          day focus streak
        </div>
        <div className="text-xs text-on-surface-variant mt-2 font-body">
          {fullFocusDays} full focused days out of {totalDays} tracked
        </div>

        {/* Milestone markers */}
        <div className="flex justify-center gap-2 mt-4">
          {[7, 14, 30, 60, 90].map(m => (
            <div key={m} className={`px-2.5 py-1 rounded-full text-xs font-label font-semibold border ${
              data.streak.streakDays >= m
                ? 'bg-primary-container text-on-primary-container border-primary-container'
                : 'bg-surface-container text-on-surface-variant border-outline-variant'
            }`}>
              {data.streak.streakDays >= m ? <span className="material-symbols-outlined text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> : <span className="material-symbols-outlined text-sm align-middle">radio_button_unchecked</span>} {m}d
            </div>
          ))}
        </div>
      </div>

      {/* Tracked categories */}
      {goals.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
          <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">Your Rivals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {goals.map(goal => (
              <div key={goal} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-xl">track_changes</span>
                <div>
                  <div className="text-sm font-medium text-on-surface font-label leading-tight">{GOAL_LABELS[goal]}</div>
                  <div className="text-[10px] text-on-surface-variant font-label">Monitoring active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21-day heatmap recap */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
        <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">21-Day Overview</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmap.map(day => {
            const bothFocused = day.morning === 'focused' && day.evening === 'focused';
            const anyDistracted = day.morning === 'distracted' || day.evening === 'distracted';
            const pending = day.morning === 'pending' && day.evening === 'pending';

            return (
              <div key={day.date}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                  pending ? 'bg-surface-container text-on-surface-variant'
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
        <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant font-label">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Full day focused</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> Distracted</span>
        </div>
      </div>
    </div>
  );
}
