'use client';

// ============================================================
// components/dashboard/WorkLifeCheck.tsx
//
// Work-Life Check card for users with 'overworking' in goals.
// Tracks daily work stop time, email habits, and presence
// rating. Shows a 7-day pattern of evening protection.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

interface DayEntry {
  date: string;
  stopTime: string | null;  // HH:MM or null
  emailAfterDinner: boolean | null;
  presenceRating: number | null;
  clockedOutOnTime: boolean;
}

export default function WorkLifeCheck() {
  const [weekData, setWeekData] = useState<DayEntry[]>([]);
  const [stopTime, setStopTime] = useState('');
  const [emailAfterDinner, setEmailAfterDinner] = useState<boolean | null>(null);
  const [presenceRating, setPresenceRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/nudges/worklife');
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        setTodayLogged(data.todayLogged ?? false);
        if (data.today) {
          setStopTime(data.today.stopTime ?? '');
          setEmailAfterDinner(data.today.emailAfterDinner ?? null);
          setPresenceRating(data.today.presenceRating ?? null);
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
    if (submitting || !stopTime) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/nudges/worklife', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopTime,
          emailAfterDinner,
          presenceRating,
        }),
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

  // Calculate stats
  const daysOnTime = weekData.filter(d => d.clockedOutOnTime).length;
  const lateWorkDays = weekData.filter(d => !d.clockedOutOnTime && d.stopTime !== null).length;

  if (loading) {
    return <div className="skeleton-shimmer h-48 rounded-2xl" />;
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-amber-700 text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            work_off
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm text-on-surface">
            Work-Life Check
          </h3>
          <p className="text-[10px] text-on-surface-variant font-label">
            Protect your evenings from overwork
          </p>
        </div>
      </div>

      {!todayLogged ? (
        <div className="space-y-4">
          {/* Stop time input */}
          <div>
            <label
              htmlFor="stop-time"
              className="block text-xs font-label font-semibold text-on-surface mb-1.5"
            >
              When did you stop working today?
            </label>
            <input
              id="stop-time"
              type="time"
              value={stopTime}
              onChange={e => setStopTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container ring-1 ring-outline-variant/20 text-sm font-label text-on-surface focus:ring-primary/40 focus:outline-none transition-all"
            />
          </div>

          {/* Email after dinner toggle */}
          <div>
            <p className="text-xs font-label font-semibold text-on-surface mb-2">
              Did you check email after dinner?
            </p>
            <div className="flex gap-2">
              {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setEmailAfterDinner(opt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-label font-medium transition-all duration-200 cursor-pointer ${
                    emailAfterDinner === opt.value
                      ? opt.value
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300/50'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                      : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-primary/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presence rating */}
          <div>
            <p className="text-xs font-label font-semibold text-on-surface mb-2">
              Rate your presence with family/friends today
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setPresenceRating(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-headline font-bold transition-all duration-200 cursor-pointer ${
                    presenceRating === n
                      ? 'bg-primary text-on-primary shadow-sm'
                      : presenceRating !== null && n <= presenceRating
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-primary/5'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-on-surface-variant/50 font-label">Distracted</span>
              <span className="text-[9px] text-on-surface-variant/50 font-label">Fully present</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !stopTime}
            className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-label font-bold transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? 'Saving...' : 'Log today'}
          </button>
        </div>
      ) : (
        <>
          {/* 7-day pattern */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-on-surface-variant/60">
                Last 7 days
              </span>
              <span className="text-xs font-label font-bold text-primary">
                {daysOnTime}/7 on time
              </span>
            </div>
            <div className="flex gap-1.5">
              {weekData.map((day) => {
                const dayLabel = new Date(day.date)
                  .toLocaleDateString('en-US', { weekday: 'short' })
                  .charAt(0);
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full h-8 rounded-lg transition-colors ${
                        day.stopTime === null
                          ? 'bg-surface-container'
                          : day.clockedOutOnTime
                            ? 'bg-emerald-500/80'
                            : 'bg-amber-400/70'
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
          {lateWorkDays >= 3 && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200/30 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                schedule
              </span>
              <p className="text-xs text-amber-900 font-body leading-relaxed">
                You&rsquo;ve worked past 8 PM {lateWorkDays} days this week. Your rival is winning.
              </p>
            </div>
          )}
          {lateWorkDays < 3 && daysOnTime >= 5 && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/30 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                thumb_up
              </span>
              <p className="text-xs text-emerald-900 font-body leading-relaxed">
                You protected your evening {daysOnTime} out of 7 days. That&rsquo;s integrity.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
