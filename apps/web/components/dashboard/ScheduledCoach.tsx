'use client';

// ============================================================
// ScheduledCoach — Recurring Coach Session Scheduler
//
// Lets users pick a recurring time to be prompted to open the
// Conversation Coach. Persists the schedule to the API and
// shows a notification banner when a scheduled session is due.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

type Frequency = 'daily' | 'every_2_days' | 'weekly';
type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface CoachSchedule {
  hour: number;
  minute: number;
  frequency: Frequency;
  day: DayOfWeek | null;
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'every_2_days', label: 'Every 2 days' },
  { value: 'weekly', label: 'Once a week' },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'sunday', label: 'Sun' },
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
];

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

function isDueNow(schedule: CoachSchedule): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();

  // Check hour and within 30-min window
  if (currentHour !== schedule.hour) return false;
  if (Math.abs(currentMinute - schedule.minute) > 15) return false;

  if (schedule.frequency === 'daily') return true;

  if (schedule.frequency === 'weekly' && schedule.day) {
    const dayIndex = DAYS.findIndex((d) => d.value === schedule.day);
    return currentDay === dayIndex;
  }

  if (schedule.frequency === 'every_2_days') {
    // Use day-of-year parity
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    return dayOfYear % 2 === 0;
  }

  return false;
}

interface ScheduledCoachProps {
  onOpenCoach?: () => void;
}

export default function ScheduledCoach({ onOpenCoach }: ScheduledCoachProps) {
  const [schedule, setSchedule] = useState<CoachSchedule | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Draft state for the form
  const [draftHour, setDraftHour] = useState(20);
  const [draftMinute, setDraftMinute] = useState(0);
  const [draftFrequency, setDraftFrequency] = useState<Frequency>('daily');
  const [draftDay, setDraftDay] = useState<DayOfWeek>('sunday');

  // Fetch existing schedule
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/coach/schedule');
        if (res.ok) {
          const json = await res.json();
          const s = json.schedule;
          if (s) {
            setSchedule(s);
            setDraftHour(s.hour);
            setDraftMinute(s.minute ?? 0);
            setDraftFrequency(s.frequency);
            if (s.day) setDraftDay(s.day);
          }
        }
      } catch {
        // Silently fail — not critical
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Check if a session is due every minute
  useEffect(() => {
    if (!schedule) return;

    const check = () => {
      if (isDueNow(schedule) && !bannerDismissed) {
        setShowBanner(true);
      }
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [schedule, bannerDismissed]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const body: CoachSchedule = {
        hour: draftHour,
        minute: draftMinute,
        frequency: draftFrequency,
        day: draftFrequency === 'weekly' ? draftDay : null,
      };

      const res = await fetch('/api/coach/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSchedule(body);
        setEditing(false);
      }
    } catch {
      // Could add toast error here
    } finally {
      setSaving(false);
    }
  }, [draftHour, draftMinute, draftFrequency, draftDay]);

  const handleRemove = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/coach/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hour: null, frequency: null, day: null }),
      });
      if (res.ok) {
        setSchedule(null);
        setEditing(false);
        setDraftHour(20);
        setDraftMinute(0);
        setDraftFrequency('daily');
        setDraftDay('sunday');
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, []);

  const handleOpenCoach = useCallback(() => {
    setShowBanner(false);
    setBannerDismissed(true);
    onOpenCoach?.();
  }, [onOpenCoach]);

  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i),
    [],
  );

  if (loading) {
    return <div className="skeleton-shimmer h-36 rounded-3xl" />;
  }

  return (
    <>
      {/* Notification banner when session is due */}
      {showBanner && !bannerDismissed && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-sm text-on-surface">
                Your scheduled coach session is now
              </p>
              <p className="text-xs text-on-surface-variant font-label mt-0.5">
                Ready to reflect?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-xs text-on-surface-variant hover:text-on-surface font-label transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleOpenCoach}
                className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-label font-bold hover:bg-primary/90 active:scale-[0.97] transition-all duration-150"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule card */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              schedule
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Scheduled Coach Sessions
            </h3>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {schedule ? 'Edit' : 'Set up'}
            </button>
          )}
        </div>

        {/* Current schedule display */}
        {!editing && schedule && (
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="font-headline font-bold text-base text-primary">
                  {formatTime(schedule.hour, schedule.minute ?? 0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-label font-medium text-on-surface">
                  {FREQUENCY_OPTIONS.find((f) => f.value === schedule.frequency)?.label ?? schedule.frequency}
                </p>
                {schedule.frequency === 'weekly' && schedule.day && (
                  <p className="text-xs text-on-surface-variant font-label mt-0.5">
                    on {schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}s
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!editing && !schedule && (
          <div className="bg-surface-container-low rounded-2xl p-6 text-center">
            <span
              className="material-symbols-outlined text-on-surface-variant/30 text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              event_available
            </span>
            <p className="text-sm text-on-surface-variant font-label mt-2">
              Schedule a recurring time for guided self-reflection.
            </p>
            <p className="text-xs text-on-surface-variant/60 font-label mt-1">
              We&apos;ll remind you when it&apos;s time.
            </p>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="space-y-4">
            {/* Time picker */}
            <div>
              <label className="text-xs font-label font-semibold text-on-surface-variant mb-1.5 block">
                What time?
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={draftHour}
                  onChange={(e) => setDraftHour(Number(e.target.value))}
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface font-label focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h}>
                      {formatTime(h, 0).replace(/:00/, '')}
                    </option>
                  ))}
                </select>
                <span className="text-on-surface-variant text-sm">:</span>
                <select
                  value={draftMinute}
                  onChange={(e) => setDraftMinute(Number(e.target.value))}
                  className="w-20 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface font-label focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-xs font-label font-semibold text-on-surface-variant mb-1.5 block">
                How often?
              </label>
              <div className="flex gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDraftFrequency(opt.value)}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-label font-medium transition-all duration-150 ${
                      draftFrequency === opt.value
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Day picker (weekly only) */}
            {draftFrequency === 'weekly' && (
              <div>
                <label className="text-xs font-label font-semibold text-on-surface-variant mb-1.5 block">
                  Which day?
                </label>
                <div className="flex gap-1.5">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDraftDay(d.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-label font-medium transition-all duration-150 ${
                        draftDay === d.value
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-xs font-label font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                {schedule && (
                  <button
                    onClick={handleRemove}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-label font-medium text-error hover:text-error/80 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-xs font-label font-bold hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {saving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
