'use client';

import { useState, useEffect } from 'react';

interface JournalData {
  balance: number;
  streak: { streakDays: number };
  heatmap: Array<{ date: string; morning: string; evening: string }>;
  milestones: Array<{ milestone: string; unlocked_at: string }>;
}

interface CheckInEntry {
  id: string;
  status: string;
  sent_at: string;
  user_mood: string | null;
}

const MOOD_VALUES: Record<string, number> = {
  great: 5, good: 4, okay: 3, struggling: 2, crisis: 1,
};

export default function GrowthJournalWidget() {
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [moods, setMoods] = useState<{ value: number; mood: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/trust-points/stats').then(r => r.json()),
      fetch('/api/check-ins?limit=21').then(r => r.json()),
    ])
      .then(([stats, ciData]) => {
        setJournal(stats);
        const completed = (ciData.checkIns ?? [])
          .filter((ci: CheckInEntry) => ci.status === 'completed' && ci.user_mood)
          .map((ci: CheckInEntry) => ({ value: MOOD_VALUES[ci.user_mood!] ?? 3, mood: ci.user_mood! }))
          .reverse();
        setMoods(completed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 animate-pulse">
        <div className="h-5 bg-surface-container rounded w-40 mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-surface-container-low rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!journal) return null;

  // Compute focus rate
  const heatmap = journal.heatmap;
  const totalSegments = heatmap.filter(d => d.morning !== 'pending' || d.evening !== 'pending').length * 2;
  const focusedSegments = heatmap.reduce((sum, d) => {
    return sum + (d.morning === 'focused' ? 1 : 0) + (d.evening === 'focused' ? 1 : 0);
  }, 0);
  const focusRate = totalSegments > 0 ? Math.round((focusedSegments / totalSegments) * 100) : 0;

  // Morning vs evening
  const morningFocused = heatmap.filter(d => d.morning === 'focused').length;
  const eveningFocused = heatmap.filter(d => d.evening === 'focused').length;
  const morningTotal = heatmap.filter(d => d.morning !== 'pending').length;
  const eveningTotal = heatmap.filter(d => d.evening !== 'pending').length;

  const avgMood = moods.length > 0
    ? (moods.reduce((sum, m) => sum + m.value, 0) / moods.length)
    : null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>book</span>
        <h3 className="font-headline text-sm font-bold text-on-surface">Growth Journal</h3>
        <span className="text-[10px] text-on-surface-variant font-label ml-auto">21-day window</span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 divide-x divide-outline-variant/10">
        <div className="p-4 text-center">
          <div className="text-xl font-headline font-bold text-primary">{focusRate}%</div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">Focus Rate</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-headline font-bold text-emerald-600 flex items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            {journal.streak.streakDays}d
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">Streak</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-headline font-bold text-primary">{journal.balance.toLocaleString()}</div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">Trust Pts</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-headline font-bold text-amber-600 flex items-center justify-center gap-0.5">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            {journal.milestones.length}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">Milestones</div>
        </div>
      </div>

      {/* Mood sparkline + morning/evening */}
      <div className="px-5 py-4 border-t border-outline-variant/10 flex gap-6">
        {/* Mood mini chart */}
        {moods.length > 0 && (
          <div className="flex-1">
            <div className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mb-2">Mood Trend</div>
            <div className="flex items-end gap-0.5 h-8">
              {moods.slice(-14).map((m, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${
                    m.value >= 4 ? 'bg-emerald-400' : m.value >= 3 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ height: `${(m.value / 5) * 100}%` }}
                  title={m.mood}
                />
              ))}
            </div>
            {avgMood && (
              <div className="text-[10px] text-on-surface-variant mt-1">
                Avg: <span className="font-medium text-on-surface">{avgMood >= 4 ? 'strong' : avgMood >= 3 ? 'steady' : 'work in progress'}</span>
              </div>
            )}
          </div>
        )}

        {/* Morning vs evening */}
        {morningTotal > 0 && eveningTotal > 0 && (
          <div className="flex-1">
            <div className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mb-2">AM vs PM Focus</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-on-surface-variant">Morning</span>
                  <span className="text-[10px] font-medium text-on-surface">{Math.round((morningFocused / morningTotal) * 100)}%</span>
                </div>
                <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(morningFocused / morningTotal) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-on-surface-variant">Evening</span>
                  <span className="text-[10px] font-medium text-on-surface">{Math.round((eveningFocused / eveningTotal) * 100)}%</span>
                </div>
                <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(eveningFocused / eveningTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
