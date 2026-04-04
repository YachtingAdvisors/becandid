'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';

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

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  label: string;
  durationHours: number | null; // null = custom
  scheduledStart?: () => Date;
  scheduledEnd?: () => Date;
}

/* ── Challenge Templates ─────────────────────────────────── */

function nextFriday6pm(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilFri = (5 - day + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(d.getDate() + daysUntilFri);
  d.setHours(18, 0, 0, 0);
  return d;
}

function nextMonday6am(fromFriday: Date): Date {
  const d = new Date(fromFriday);
  d.setDate(d.getDate() + 3);
  d.setHours(6, 0, 0, 0);
  return d;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: '24h',
    name: '24-Hour Digital Fast',
    description: 'No rival category activity for 24 hours',
    icon: 'timer',
    category: 'digital',
    label: '24-Hour Digital Fast',
    durationHours: 24,
  },
  {
    id: 'weekend',
    name: 'Weekend Unplugged',
    description: 'Friday 6pm to Monday 6am — full weekend off',
    icon: 'weekend',
    category: 'digital',
    label: 'Weekend Unplugged',
    durationHours: null,
    scheduledStart: nextFriday6pm,
    scheduledEnd: () => nextMonday6am(nextFriday6pm()),
  },
  {
    id: 'social-sunset',
    name: 'Social Media Sunset',
    description: 'No social media after 8pm for 7 days',
    icon: 'nights_stay',
    category: 'social-media',
    label: 'Social Media Sunset',
    durationHours: 7 * 24,
  },
  {
    id: 'screen-free-morning',
    name: 'Screen-Free Morning',
    description: 'No screens before 9am for 7 days',
    icon: 'wb_sunny',
    category: 'screens',
    label: 'Screen-Free Morning',
    durationHours: 7 * 24,
  },
  {
    id: 'one-week-focus',
    name: 'One Week Focus',
    description: 'Zero flags for 7 consecutive days',
    icon: 'target',
    category: 'focus',
    label: 'One Week Focus',
    durationHours: 7 * 24,
  },
  {
    id: 'custom',
    name: 'Custom Challenge',
    description: 'Define your own duration and category',
    icon: 'edit',
    category: '',
    label: '',
    durationHours: null,
  },
];

/* ── Helpers ─────────────────────────────────────────────── */

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
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

/* ── Countdown Ring SVG ──────────────────────────────────── */

function CountdownRing({ pct, size = 160, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-surface-container-low"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000"
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#226779" />
          <stop offset="100%" stopColor="#226779" stopOpacity={0.5} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export default function FastingChallenge() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customDays, setCustomDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmBreak, setConfirmBreak] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every second for countdown
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const { data: fastsData, isLoading: loading, mutate } = useSWR<{ fasts: Fast[] }>('/api/fasts');
  const fasts = fastsData?.fasts ?? [];

  const activeFasts = fasts.filter(f => !f.completed_at && !f.broken_at);
  const pastFasts = fasts.filter(f => f.completed_at || f.broken_at);
  const completedFasts = pastFasts.filter(f => f.completed_at);

  /* ── Start Challenge ───────────────────────────────────── */

  async function startChallenge(templateId: string) {
    setError('');
    const template = CHALLENGE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    let label = template.label;
    let category = template.category;
    let endsAt: Date;

    if (templateId === 'custom') {
      if (!customLabel.trim()) { setError('Please name your challenge.'); return; }
      if (!customCategory.trim()) { setError('Please enter a category.'); return; }
      label = customLabel.trim();
      category = customCategory.trim().toLowerCase().replace(/\s+/g, '-');
      endsAt = new Date(Date.now() + customDays * 24 * 60 * 60 * 1000);
    } else if (template.scheduledStart && template.scheduledEnd) {
      endsAt = template.scheduledEnd();
    } else {
      endsAt = new Date(Date.now() + (template.durationHours ?? 24) * 60 * 60 * 1000);
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, category, ends_at: endsAt.toISOString() }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Failed to start challenge' }));
        setError(d.error ?? 'Failed to start challenge.');
        setSubmitting(false);
        return;
      }

      setSelectedTemplate(null);
      setCustomLabel('');
      setCustomCategory('');
      setCustomDays(7);
      await fetchFasts();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Break / Complete ──────────────────────────────────── */

  async function handleBreak(id: string) {
    try {
      await fetch(`/api/fasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broken_at: new Date().toISOString() }),
      });
      setConfirmBreak(null);
      await fetchFasts();
    } catch { /* silently fail */ }
  }

  async function handleComplete(id: string) {
    try {
      await fetch(`/api/fasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_at: new Date().toISOString() }),
      });
      await fetchFasts();
    } catch { /* silently fail */ }
  }

  /* ── Render ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface-container rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            self_improvement
          </span>
          Fasting Challenges
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Pick a challenge to intentionally step away from digital distractions.
        </p>
      </div>

      {/* ── Active Fasts with Countdown ─────────────────── */}
      {activeFasts.length > 0 && (
        <div className="space-y-4">
          {activeFasts.map(fast => {
            const start = new Date(fast.started_at).getTime();
            const end = new Date(fast.ends_at).getTime();
            const remaining = Math.max(0, end - now);
            const elapsed = Math.max(0, now - start);
            const total = end - start;
            const pct = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 100;
            const expired = remaining <= 0;

            return (
              <div key={fast.id} className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Countdown Ring */}
                  <div className="relative flex-shrink-0">
                    <CountdownRing pct={pct} size={160} stroke={10} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-headline font-bold text-on-surface">
                        {expired ? '100%' : `${pct}%`}
                      </span>
                      <span className="text-xs font-label text-on-surface-variant">
                        {expired ? 'Complete!' : 'progress'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <h3 className="font-headline text-lg font-bold text-on-surface">{fast.label}</h3>

                    {!expired && (
                      <div className="space-y-1">
                        <p className="text-2xl font-headline font-bold text-primary">
                          {formatDuration(remaining)}
                        </p>
                        <p className="text-xs font-label text-on-surface-variant">remaining</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-xs font-label text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        {formatDate(fast.started_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">flag</span>
                        {formatDate(fast.ends_at)}
                      </span>
                    </div>

                    <p className="text-xs font-body text-on-surface-variant">
                      Elapsed: {formatDuration(elapsed)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 justify-center sm:justify-start pt-1">
                      {expired ? (
                        <button
                          onClick={() => handleComplete(fast.id)}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-label font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">celebration</span>
                          Complete Challenge
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmBreak(fast.id)}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-red-600 text-sm font-label font-medium ring-1 ring-red-200 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">heart_broken</span>
                          Break Fast
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Challenge Templates Grid ─────────────────────── */}
      {!selectedTemplate && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CHALLENGE_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-left hover:ring-primary/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-xl">{template.icon}</span>
              </div>
              <h3 className="font-label text-sm font-bold text-on-surface mb-1">{template.name}</h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">{template.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Selected Template Confirmation ────────────────── */}
      {selectedTemplate && (
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {CHALLENGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
            </h3>
            <button
              onClick={() => { setSelectedTemplate(null); setError(''); }}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="font-body text-sm text-on-surface-variant">
            {CHALLENGE_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
          </p>

          {selectedTemplate === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
                  Challenge Name
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  placeholder="e.g. No Instagram for a week"
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="e.g. social media, news, gaming"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={e => setCustomDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={90}
                  className="w-24 px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-50 ring-1 ring-red-200/50 text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <button
            onClick={() => startChallenge(selectedTemplate)}
            disabled={submitting}
            className="w-full py-3 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Starting...' : 'Start Challenge'}
          </button>
        </div>
      )}

      {/* ── Completed Fasts ──────────────────────────────── */}
      {completedFasts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
            Completed Challenges
          </h3>

          <div className="space-y-2">
            {completedFasts.map(fast => {
              const totalMs = new Date(fast.ends_at).getTime() - new Date(fast.started_at).getTime();
              return (
                <div key={fast.id} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 ring-1 ring-emerald-200/50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-emerald-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label text-sm font-bold text-on-surface truncate">{fast.label}</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      {formatDuration(totalMs)} &middot; {fast.category} &middot; {formatShortDate(fast.completed_at!)}
                    </p>
                  </div>
                  {/* Shareable completion badge */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200/50 text-xs font-label font-bold text-emerald-700 flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Completed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Past (Broken) Fasts ──────────────────────────── */}
      {pastFasts.filter(f => f.broken_at).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">history</span>
            Past Attempts
          </h3>
          <div className="space-y-2">
            {pastFasts.filter(f => f.broken_at).map(fast => {
              const totalMs = new Date(fast.ends_at).getTime() - new Date(fast.started_at).getTime();
              const elapsedMs = new Date(fast.broken_at!).getTime() - new Date(fast.started_at).getTime();
              return (
                <div key={fast.id} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 ring-1 ring-red-200/50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      cancel
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label text-sm font-bold text-on-surface truncate">{fast.label}</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      Lasted {formatDuration(elapsedMs)} of {formatDuration(totalMs)} &middot; {formatShortDate(fast.broken_at!)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Break Confirmation Modal ─────────────────────── */}
      {confirmBreak && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setConfirmBreak(null)}>
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div
            className="relative bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">heart_broken</span>
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Break this challenge?</h3>
                <p className="text-xs text-on-surface-variant">This cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm font-body text-on-surface-variant">
              It takes courage to be honest. Breaking a fast is not failure &mdash; it is self-awareness. You can always start again.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBreak(null)}
                className="flex-1 py-2.5 text-sm font-label font-medium text-on-surface-variant rounded-full ring-1 ring-outline-variant hover:bg-surface-container-low cursor-pointer transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={() => handleBreak(confirmBreak)}
                className="flex-1 py-2.5 text-sm font-label font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/20 hover:brightness-110 cursor-pointer transition-all"
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
