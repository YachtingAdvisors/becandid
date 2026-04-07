'use client';

// ============================================================
// components/dashboard/DoomscrollCheck.tsx
//
// News Check card for users with 'doomscrolling' in their goals.
// Lets users log daily news consumption, mood after reading,
// and reflects a 7-day trend. Encourages intentional news diets.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

type NewsMood = 'informed' | 'anxious' | 'angry';

interface NewsDay {
  date: string;
  hours: number;
  mood: NewsMood | null;
}

const MOOD_OPTIONS: { value: NewsMood; label: string; icon: string }[] = [
  { value: 'informed', label: 'Informed', icon: 'auto_stories' },
  { value: 'anxious', label: 'Anxious', icon: 'psychology_alt' },
  { value: 'angry', label: 'Angry', icon: 'sentiment_very_dissatisfied' },
];

const HOUR_LABELS = ['0h', '1h', '2h', '3h', '4h+'];

export default function DoomscrollCheck() {
  const [weekData, setWeekData] = useState<NewsDay[]>([]);
  const [hours, setHours] = useState(0);
  const [mood, setMood] = useState<NewsMood | null>(null);
  const [actionableNote, setActionableNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/news-consumption');
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        if (data.today) {
          setHours(data.today.hours ?? 0);
          setMood(data.today.mood ?? null);
          setSubmitted(true);
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
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/news-consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, mood, actionableNote }),
      });
      if (res.ok) {
        setSubmitted(true);
        await fetchData();
      }
    } catch {
      // fail silently
    } finally {
      setSubmitting(false);
    }
  };

  // Compute weekly average
  const weekHours = weekData.filter(d => d.hours > 0);
  const weeklyAvg =
    weekHours.length > 0
      ? weekHours.reduce((sum, d) => sum + d.hours, 0) / weekHours.length
      : 0;

  if (loading) {
    return <div className="skeleton-shimmer h-48 rounded-2xl" />;
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            newspaper
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm text-on-surface">
            News Check
          </h3>
          <p className="text-[10px] text-on-surface-variant font-label">
            How much news did you consume today?
          </p>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-5">
          {/* Hours slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-label font-medium text-on-surface-variant">
                Time spent
              </span>
              <span className="text-xs font-label font-bold text-primary">
                {hours >= 4 ? '4+ hours' : `${hours} hour${hours !== 1 ? 's' : ''}`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-lg appearance-none bg-surface-container cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              {HOUR_LABELS.map(label => (
                <span
                  key={label}
                  className="text-[9px] font-label text-on-surface-variant/50"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Mood after reading */}
          <div>
            <span className="text-xs font-label font-medium text-on-surface-variant block mb-2">
              How do you feel after reading the news?
            </span>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMood(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-label font-medium transition-all duration-200 cursor-pointer ${
                    mood === opt.value
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-primary/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actionable question */}
          <div>
            <label
              htmlFor="actionable-note"
              className="text-xs font-label font-medium text-on-surface-variant block mb-2"
            >
              What can you actually do about what you read?
            </label>
            <input
              id="actionable-note"
              type="text"
              value={actionableNote}
              onChange={e => setActionableNote(e.target.value)}
              placeholder="e.g., Vote, donate, volunteer, or nothing — and that's okay"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container ring-1 ring-outline-variant/10 text-sm text-on-surface placeholder:text-on-surface-variant/40 font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label font-bold text-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
          >
            {submitting ? 'Saving...' : 'Log Today'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary of today */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container ring-1 ring-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <div className="text-xs font-body text-on-surface">
              <span className="font-bold">{hours >= 4 ? '4+' : hours} hour{hours !== 1 ? 's' : ''}</span>
              {' '}of news today
              {mood && (
                <span className="text-on-surface-variant">
                  {' '}&middot; Feeling {mood}
                </span>
              )}
            </div>
          </div>

          {/* 7-day trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-on-surface-variant/60">
                Last 7 days
              </span>
              <span className="text-xs font-label font-bold text-primary">
                Avg {weeklyAvg.toFixed(1)}h/day
              </span>
            </div>
            <div className="flex gap-1.5 items-end h-16">
              {weekData.map(day => {
                const barHeight = Math.max(8, (day.hours / 4) * 100);
                const dayLabel = new Date(day.date)
                  .toLocaleDateString('en-US', { weekday: 'short' })
                  .charAt(0);
                const isHigh = day.hours > 2;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full rounded-lg transition-colors ${
                        isHigh
                          ? 'bg-error/60'
                          : day.hours > 0
                            ? 'bg-primary/40'
                            : 'bg-surface-container'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-[9px] font-label text-on-surface-variant/50">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual nudge */}
          {hours > 2 && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200/30 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <p className="text-xs text-amber-900 font-body leading-relaxed">
                You spent more time consuming news than you can act on.
                Consider a news diet.
              </p>
            </div>
          )}

          {/* Suggestion */}
          <div className="px-4 py-3 rounded-xl bg-primary/5 ring-1 ring-primary/10 flex items-start gap-3">
            <span
              className="material-symbols-outlined text-primary text-lg mt-0.5 shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lightbulb
            </span>
            <p className="text-xs text-on-surface font-body leading-relaxed">
              Try checking news once in the morning and once in the evening
              &mdash; max 15 minutes each.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
