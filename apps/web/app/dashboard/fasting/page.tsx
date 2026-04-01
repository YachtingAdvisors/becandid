'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Types ───────────────────────────────────────────────── */

interface Fast {
  id: string;
  user_id: string;
  category: string;
  label: string;
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  broken_at: string | null;
  notes: string | null;
  created_at: string;
}

type DurationPreset = '1d' | '3d' | '1w' | '2w' | '30d' | 'custom';

const DURATION_OPTIONS: { key: DurationPreset; label: string; days?: number }[] = [
  { key: '1d', label: '1 Day', days: 1 },
  { key: '3d', label: '3 Days', days: 3 },
  { key: '1w', label: '1 Week', days: 7 },
  { key: '2w', label: '2 Weeks', days: 14 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: 'custom', label: 'Custom' },
];

/* ── Helpers ─────────────────────────────────────────────── */

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function progressPercent(started: string, ends: string): number {
  const now = Date.now();
  const start = new Date(started).getTime();
  const end = new Date(ends).getTime();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

function isExpired(ends: string): boolean {
  return new Date(ends).getTime() <= Date.now();
}

/* ── Page ────────────────────────────────────────────────── */

export default function FastingPage() {
  const [fasts, setFasts] = useState<Fast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState<DurationPreset>('1w');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Confirmation modal
  const [confirmBreak, setConfirmBreak] = useState<string | null>(null);

  const fetchFasts = useCallback(async () => {
    try {
      const res = await fetch('/api/fasts');
      if (res.ok) {
        const data = await res.json();
        setFasts(data.fasts ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFasts();
  }, [fetchFasts]);

  /* ── Create fast ───────────────────────────────────────── */

  async function handleCreate() {
    setFormError('');
    if (!label.trim()) {
      setFormError('Please enter what you are fasting from.');
      return;
    }

    let endsAt: Date;
    if (duration === 'custom') {
      if (!customDate) {
        setFormError('Please pick a custom end date.');
        return;
      }
      endsAt = new Date(customDate + 'T23:59:59');
      if (endsAt <= new Date()) {
        setFormError('End date must be in the future.');
        return;
      }
    } else {
      const opt = DURATION_OPTIONS.find((d) => d.key === duration);
      endsAt = addDays(new Date(), opt?.days ?? 7);
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          category: label.trim().toLowerCase().replace(/\s+/g, '-'),
          ends_at: endsAt.toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setFormError(d.error ?? 'Failed to create fast.');
        setSubmitting(false);
        return;
      }

      // Reset form and reload
      setLabel('');
      setDuration('1w');
      setCustomDate('');
      setNotes('');
      setShowForm(false);
      await fetchFasts();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Break fast ────────────────────────────────────────── */

  async function handleBreak(id: string) {
    try {
      await fetch(`/api/fasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broken_at: new Date().toISOString() }),
      });
      setConfirmBreak(null);
      await fetchFasts();
    } catch {
      // silently fail
    }
  }

  /* ── Complete fast ─────────────────────────────────────── */

  async function handleComplete(id: string) {
    try {
      await fetch(`/api/fasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_at: new Date().toISOString() }),
      });
      await fetchFasts();
    } catch {
      // silently fail
    }
  }

  /* ── Delete fast ───────────────────────────────────────── */

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/fasts/${id}`, { method: 'DELETE' });
      await fetchFasts();
    } catch {
      // silently fail
    }
  }

  /* ── Derived data ──────────────────────────────────────── */

  const activeFasts = fasts.filter((f) => !f.completed_at && !f.broken_at);
  const pastFasts = fasts.filter((f) => f.completed_at || f.broken_at);

  // Minimum date for custom picker (tomorrow)
  const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
  const maxDate = addDays(new Date(), 90).toISOString().split('T')[0];

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              self_improvement
            </span>
            Fasting
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Intentionally step away from something for a season.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Start a Fast
          </button>
        )}
      </div>

      {/* ── Create Form ──────────────────────────────────── */}
      {showForm && (
        <section className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">Start a Fast</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setFormError('');
              }}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
              What are you fasting from?
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Reading the news, Reddit, Twitter, YouTube"
              maxLength={200}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-label font-medium text-on-surface-variant mb-2">
              How long?
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDuration(opt.key)}
                  className={`px-4 py-2 rounded-full text-sm font-label font-medium transition-all cursor-pointer ${
                    duration === opt.key
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant/20 hover:ring-primary/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {duration === 'custom' && (
              <div className="mt-3">
                <input
                  type="date"
                  value={customDate}
                  min={tomorrow}
                  max={maxDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl border border-outline-variant text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
              Notes <span className="text-on-surface-variant/50">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you doing this fast? What do you hope to gain?"
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Error */}
          {formError && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 ring-1 ring-red-200/50 text-red-700 text-sm font-body">
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full py-3 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Starting...' : 'Begin Fast'}
          </button>
        </section>
      )}

      {/* ── Loading ──────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* ── Active Fasts ─────────────────────────────────── */}
      {!loading && activeFasts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
            Active Fasts
          </h2>

          <div className="space-y-3">
            {activeFasts.map((fast) => {
              const totalDays = daysBetween(new Date(fast.started_at), new Date(fast.ends_at));
              const daysLeft = daysBetween(new Date(), new Date(fast.ends_at));
              const pct = progressPercent(fast.started_at, fast.ends_at);
              const expired = isExpired(fast.ends_at);

              return (
                <div
                  key={fast.id}
                  className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-md p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-headline text-base font-bold text-on-surface">
                        {fast.label}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        {formatDate(fast.started_at)} &mdash; {formatDate(fast.ends_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-label font-bold ring-1 ring-emerald-200/50">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Time&apos;s up!
                        </span>
                      ) : (
                        <div className="font-label text-sm font-bold text-primary">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </div>
                      )}
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {totalDays} day{totalDays !== 1 ? 's' : ''} total
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-label text-on-surface-variant">
                    <span>{pct}% complete</span>
                    <span>Day {Math.min(totalDays - daysLeft, totalDays)} of {totalDays}</span>
                  </div>

                  {/* Notes */}
                  {fast.notes && (
                    <div className="px-3 py-2 rounded-xl bg-surface-container-low text-xs font-body text-on-surface-variant italic">
                      {fast.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {expired ? (
                      <button
                        onClick={() => handleComplete(fast.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-label font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">celebration</span>
                        Complete Fast
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmBreak(fast.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-red-600 text-sm font-label font-medium ring-1 ring-red-200 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">heart_broken</span>
                        I Broke My Fast
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(fast.id)}
                      className="p-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                      title="Delete fast"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {!loading && activeFasts.length === 0 && !showForm && (
        <section className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-md p-8 text-center space-y-3">
          <span
            className="material-symbols-outlined text-4xl text-primary/40"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            self_improvement
          </span>
          <h3 className="font-headline text-base font-bold text-on-surface">No active fasts</h3>
          <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto">
            Start a fast to intentionally step away from a habit or activity for a set period of time.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer mt-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Start Your First Fast
          </button>
        </section>
      )}

      {/* ── Past Fasts ───────────────────────────────────── */}
      {!loading && pastFasts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">history</span>
            Past Fasts
          </h2>

          <div className="space-y-2">
            {pastFasts.map((fast) => {
              const succeeded = !!fast.completed_at;
              const totalDays = daysBetween(new Date(fast.started_at), new Date(fast.ends_at));

              return (
                <div
                  key={fast.id}
                  className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      succeeded
                        ? 'bg-emerald-50 ring-1 ring-emerald-200/50'
                        : 'bg-red-50 ring-1 ring-red-200/50'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${
                        succeeded ? 'text-emerald-600' : 'text-red-500'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {succeeded ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-label text-sm font-bold text-on-surface truncate">
                      {fast.label}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant">
                      {totalDays} day{totalDays !== 1 ? 's' : ''} &middot;{' '}
                      {succeeded ? 'Completed' : 'Broken'}{' '}
                      {formatDate(succeeded ? fast.completed_at! : fast.broken_at!)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(fast.id)}
                    className="p-2 rounded-full text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer flex-shrink-0"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Break Confirmation Modal ─────────────────────── */}
      {confirmBreak && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setConfirmBreak(null)}
        >
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div
            className="relative bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">heart_broken</span>
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Break this fast?</h3>
                <p className="text-xs text-on-surface-variant">This cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm font-body text-on-surface-variant">
              It takes courage to be honest. Breaking a fast is not failure &mdash; it is self-awareness. You can always start again.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBreak(null)}
                className="flex-1 py-2.5 text-sm font-label font-medium text-on-surface-variant rounded-full ring-1 ring-outline-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200"
              >
                Keep Going
              </button>
              <button
                onClick={() => handleBreak(confirmBreak)}
                className="flex-1 py-2.5 text-sm font-label font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/20 hover:brightness-110 cursor-pointer transition-all duration-200"
              >
                Break Fast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
