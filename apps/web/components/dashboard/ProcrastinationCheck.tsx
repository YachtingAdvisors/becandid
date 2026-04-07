'use client';

// ============================================================
// components/dashboard/ProcrastinationCheck.tsx
//
// "What are you avoiding?" card for users with 'procrastination'
// in their goals. Lets users name the hard thing, log that they
// started it (positive event), or open the Conversation Coach
// for deeper exploration. Tracks a 7-day streak of facing the
// hard thing. Warm, encouraging, never naggy.
// ============================================================

import { useState, useEffect, useCallback } from 'react';

interface ProcrastinationDay {
  date: string;
  started: boolean;
}

export default function ProcrastinationCheck() {
  const [weekData, setWeekData] = useState<ProcrastinationDay[]>([]);
  const [taskText, setTaskText] = useState('');
  const [todayStarted, setTodayStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCoachLink, setShowCoachLink] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/procrastination-events');
      if (res.ok) {
        const data = await res.json();
        setWeekData(data.week ?? []);
        setTodayStarted(data.todayStarted ?? false);
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

  const logStarted = async () => {
    if (submitting || !taskText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/procrastination-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'started', task: taskText.trim() }),
      });
      if (res.ok) {
        setTodayStarted(true);
        await fetchData();
      }
    } catch {
      // fail silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvoiding = () => {
    setShowCoachLink(true);
  };

  const streakDays = weekData.filter(d => d.started).length;

  if (loading) {
    return <div className="skeleton-shimmer h-48 rounded-2xl" />;
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-tertiary/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-tertiary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
        <div>
          <h3 className="font-headline font-bold text-sm text-on-surface">
            What are you avoiding?
          </h3>
          <p className="text-[10px] text-on-surface-variant font-label">
            Name the hard thing. Then face it.
          </p>
        </div>
      </div>

      {/* Task input */}
      {!todayStarted && (
        <div className="mb-4">
          <label htmlFor="procrastination-task" className="sr-only">
            The thing I most need to do today
          </label>
          <input
            id="procrastination-task"
            type="text"
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            placeholder="The thing I most need to do today..."
            className="w-full px-4 py-3 rounded-xl bg-surface-container ring-1 ring-outline-variant/10 text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-tertiary/30 transition-all"
          />
        </div>
      )}

      {/* Action buttons */}
      {!todayStarted && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={logStarted}
            disabled={submitting || !taskText.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-label font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 hover:bg-emerald-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
            I started it
          </button>
          <button
            onClick={handleAvoiding}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-label font-medium bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/10 hover:bg-tertiary/10 hover:text-tertiary transition-all duration-200 cursor-pointer disabled:cursor-default"
          >
            <span className="material-symbols-outlined text-base">
              pause_circle
            </span>
            I&rsquo;m avoiding it
          </button>
        </div>
      )}

      {/* Today completed state */}
      {todayStarted && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/30 flex items-start gap-3 mb-5">
          <span
            className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-xs text-emerald-900 font-body leading-relaxed">
            You faced the hard thing today. That took courage.
          </p>
        </div>
      )}

      {/* Coach link (shown after "I'm avoiding it") */}
      {showCoachLink && !todayStarted && (
        <div className="px-4 py-3 rounded-xl bg-tertiary-container/20 ring-1 ring-tertiary-container/30 flex items-start gap-3 mb-5">
          <span
            className="material-symbols-outlined text-tertiary text-lg mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            sentiment_calm
          </span>
          <div className="flex-1">
            <p className="text-xs text-on-surface font-body leading-relaxed mb-2">
              That&rsquo;s honest. Let&rsquo;s figure out what&rsquo;s underneath the avoidance.
            </p>
            <a
              href="/dashboard/conversations?context=procrastination"
              className="inline-flex items-center gap-1.5 text-xs font-label font-semibold text-tertiary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              Talk to your coach
            </a>
          </div>
        </div>
      )}

      {/* 7-day tracker */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-on-surface-variant/60">
            Last 7 days
          </span>
          <span className="text-xs font-label font-bold text-tertiary">
            {streakDays}/7 faced
          </span>
        </div>
        <div className="flex gap-1.5">
          {weekData.map(day => {
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
                    day.started
                      ? 'bg-emerald-500/80'
                      : 'bg-surface-container'
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

      {/* Encouraging summary */}
      {streakDays >= 3 && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/30 flex items-start gap-3">
          <span
            className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            thumb_up
          </span>
          <p className="text-xs text-emerald-900 font-body leading-relaxed">
            You&rsquo;ve faced the hard thing {streakDays} out of 7 days this week. That&rsquo;s momentum.
          </p>
        </div>
      )}
    </section>
  );
}
