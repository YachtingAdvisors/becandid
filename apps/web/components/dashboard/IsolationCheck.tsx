'use client';

// ============================================================
// components/dashboard/IsolationCheck.tsx
//
// Connection Check card for users with 'isolation' in their goals.
// Lets users log daily connections and tracks a 7-day streak.
// Warm, encouraging — never naggy.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

type ConnectionType = 'text' | 'call' | 'in_person';

interface ConnectionDay {
  date: string;
  hasConnection: boolean;
}

const CONNECTION_BUTTONS: { type: ConnectionType; label: string; icon: string }[] = [
  { type: 'text', label: 'Texted someone', icon: 'chat' },
  { type: 'call', label: 'Called someone', icon: 'call' },
  { type: 'in_person', label: 'Spent time in person', icon: 'handshake' },
];

export default function IsolationCheck() {
  const [weekData, setWeekData] = useState<ConnectionDay[]>([]);
  const [todayLogged, setTodayLogged] = useState<ConnectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<ConnectionType | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/connection-events');
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        setTodayLogged(data.todayTypes ?? []);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const logConnection = async (type: ConnectionType) => {
    if (submitting) return;
    setSubmitting(type);
    try {
      const res = await fetch('/api/connection-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        setTodayLogged(prev => [...prev, type]);
        await fetchData();
      }
    } catch {
      // fail silently
    } finally {
      setSubmitting(null);
    }
  };

  // Calculate streak
  const streakDays = weekData.filter(d => d.hasConnection).length;
  const daysWithoutConnection = weekData.filter(d => !d.hasConnection).length;
  const consecutiveGap = (() => {
    let gap = 0;
    // weekData is sorted newest-first
    for (const day of weekData) {
      if (!day.hasConnection) gap++;
      else break;
    }
    return gap;
  })();

  if (loading) {
    return <div className="skeleton-shimmer h-48 rounded-2xl" />;
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            group
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm text-on-surface">
            Connection Check
          </h3>
          <p className="text-[10px] text-on-surface-variant font-label">
            Who did you connect with today?
          </p>
        </div>
      </div>

      {/* Quick-tap buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CONNECTION_BUTTONS.map(btn => {
          const alreadyLogged = todayLogged.includes(btn.type);
          return (
            <button
              key={btn.type}
              onClick={() => !alreadyLogged && logConnection(btn.type)}
              disabled={!!submitting || alreadyLogged}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-label font-medium transition-all duration-200 cursor-pointer disabled:cursor-default ${
                alreadyLogged
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                  : 'bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant ring-1 ring-outline-variant/10'
              } ${submitting === btn.type ? 'animate-pulse' : ''}`}
            >
              <span className="material-symbols-outlined text-base" style={alreadyLogged ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {alreadyLogged ? 'check_circle' : btn.icon}
              </span>
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 7-day streak visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-on-surface-variant/60">
            Last 7 days
          </span>
          <span className="text-xs font-label font-bold text-primary">
            {streakDays}/7 connected
          </span>
        </div>
        <div className="flex gap-1.5">
          {weekData.map((day, i) => {
            const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-8 rounded-lg transition-colors ${
                    day.hasConnection
                      ? 'bg-emerald-500/80'
                      : 'bg-surface-container'
                  }`}
                />
                <span className="text-[9px] font-label text-on-surface-variant/50">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual banner */}
      {consecutiveGap >= 3 && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            sentiment_calm
          </span>
          <p className="text-xs text-amber-900 font-body leading-relaxed">
            You&rsquo;ve been quiet for a while. Isolation is your rival, remember? Even one text counts.
          </p>
        </div>
      )}
      {consecutiveGap < 3 && streakDays >= 3 && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/30 flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            thumb_up
          </span>
          <p className="text-xs text-emerald-900 font-body leading-relaxed">
            {streakDays} days of connection. Your rival doesn&rsquo;t stand a chance.
          </p>
        </div>
      )}
    </section>
  );
}
