'use client';

// ============================================================
// components/dashboard/SleepCheck.tsx
//
// Sleep Check card for users with 'sleep_avoidance' in goals.
// Tracks bedtime, reasons for staying up, and shows a 7-day
// bedtime trend. Warm, encouraging — never judgmental.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

type StayUpReason =
  | 'scrolling'
  | 'streaming'
  | 'gaming'
  | 'working'
  | 'worrying'
  | 'other';

interface NightEntry {
  date: string;
  bedtime: string | null; // HH:MM or null
  reason: StayUpReason | null;
}

const REASON_OPTIONS: { value: StayUpReason; label: string; icon: string }[] = [
  { value: 'scrolling', label: 'Scrolling', icon: 'phone_android' },
  { value: 'streaming', label: 'Streaming', icon: 'play_circle' },
  { value: 'gaming', label: 'Gaming', icon: 'sports_esports' },
  { value: 'working', label: 'Working', icon: 'work' },
  { value: 'worrying', label: 'Worrying', icon: 'psychology' },
  { value: 'other', label: 'Other', icon: 'more_horiz' },
];

/**
 * Parse an "HH:MM" string into total minutes since midnight.
 * Handles times past midnight by treating 00:00–05:59 as next-day.
 */
function bedtimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m;
  // Treat early morning hours (0-5) as past midnight (add 24h)
  return h < 6 ? totalMinutes + 24 * 60 : totalMinutes;
}

function formatBedtimeAvg(avgMinutes: number): string {
  // Convert back from 24h+ to normal time
  const normalizedMinutes = avgMinutes >= 24 * 60 ? avgMinutes - 24 * 60 : avgMinutes;
  const h = Math.floor(normalizedMinutes / 60);
  const m = Math.round(normalizedMinutes % 60);
  const period = h >= 12 ? 'AM' : 'PM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function SleepCheck() {
  const [weekData, setWeekData] = useState<NightEntry[]>([]);
  const [bedtime, setBedtime] = useState('');
  const [reason, setReason] = useState<StayUpReason | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/nudges/sleep');
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        setTodayLogged(data.todayLogged ?? false);
        if (data.today) {
          setBedtime(data.today.bedtime ?? '');
          setReason(data.today.reason ?? null);
        }
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

  const handleSubmit = async () => {
    if (submitting || !bedtime) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/nudges/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedtime, reason }),
      });
      if (res.ok) {
        setTodayLogged(true);
        await fetchData();
      }
    } catch {
      // fail silently
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average bedtime
  const loggedNights = weekData.filter(d => d.bedtime !== null);
  const avgBedtimeMinutes =
    loggedNights.length > 0
      ? loggedNights.reduce((sum, d) => sum + bedtimeToMinutes(d.bedtime!), 0) /
        loggedNights.length
      : 0;
  // Midnight = 24*60 = 1440 minutes
  const isLateAverage = avgBedtimeMinutes > 24 * 60; // after midnight

  if (loading) {
    return <div className="skeleton-shimmer h-48 rounded-2xl" />;
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-indigo-700 text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bedtime
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm text-on-surface">
            Sleep Check
          </h3>
          <p className="text-[10px] text-on-surface-variant font-label">
            Rest is how you recharge for the fight
          </p>
        </div>
      </div>

      {!todayLogged ? (
        <div className="space-y-4">
          {/* Bedtime input */}
          <div>
            <label
              htmlFor="bedtime"
              className="block text-xs font-label font-semibold text-on-surface mb-1.5"
            >
              What time did you go to bed last night?
            </label>
            <input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container ring-1 ring-outline-variant/20 text-sm font-label text-on-surface focus:ring-primary/40 focus:outline-none transition-all"
            />
          </div>

          {/* Reason quick-tap */}
          <div>
            <p className="text-xs font-label font-semibold text-on-surface mb-2">
              What kept you up?
            </p>
            <div className="flex flex-wrap gap-2">
              {REASON_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setReason(prev => (prev === opt.value ? null : opt.value))
                  }
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-label font-medium transition-all duration-200 cursor-pointer ${
                    reason === opt.value
                      ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300/50'
                      : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-primary/5'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={
                      reason === opt.value
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !bedtime}
            className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-label font-bold transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Saving...' : 'Log last night'}
          </button>
        </div>
      ) : (
        <>
          {/* Bedtime trend visualization */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-on-surface-variant/60">
                Bedtime trend — 7 nights
              </span>
              {loggedNights.length > 0 && (
                <span className="text-xs font-label font-bold text-primary">
                  avg {formatBedtimeAvg(avgBedtimeMinutes)}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {weekData.map(day => {
                const dayLabel = new Date(day.date)
                  .toLocaleDateString('en-US', { weekday: 'short' })
                  .charAt(0);
                const isLate =
                  day.bedtime !== null && bedtimeToMinutes(day.bedtime) > 24 * 60;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full h-8 rounded-lg transition-colors ${
                        day.bedtime === null
                          ? 'bg-surface-container'
                          : isLate
                            ? 'bg-amber-400/70'
                            : 'bg-indigo-400/70'
                      }`}
                    />
                    <span className="text-[9px] font-label text-on-surface-variant/50">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual banner */}
          {isLateAverage && loggedNights.length >= 3 && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200/30 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bedtime_off
              </span>
              <p className="text-xs text-amber-900 font-body leading-relaxed">
                Your average bedtime this week is{' '}
                {formatBedtimeAvg(avgBedtimeMinutes)}. Your body needs rest to
                fight your other rivals.
              </p>
            </div>
          )}
          {!isLateAverage && loggedNights.length >= 3 && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/30 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                thumb_up
              </span>
              <p className="text-xs text-emerald-900 font-body leading-relaxed">
                Lights out by {formatBedtimeAvg(avgBedtimeMinutes)} average. Your
                future self thanks you.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
