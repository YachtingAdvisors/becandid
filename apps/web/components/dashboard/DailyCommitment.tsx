'use client';
// ============================================================
// DailyCommitment.tsx — Morning intention + evening review
//
// Implementation intentions (Gollwitzer, 1999): specific plans
// increase goal follow-through by 2-3x. The morning ritual
// sets the plan; the evening review builds metacognition.
//
// States:
//  - Morning (no intention set): sunrise card with input
//  - Daytime (intention set): subtle reminder card
//  - Evening (after 6 PM): expandable review card
// ============================================================

import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface Commitment {
  id: string;
  date: string;
  morning_intention: string | null;
  evening_reflection: string | null;
  intention_met: boolean | null;
}

interface CommitmentData {
  today: Commitment | null;
  history: Commitment[];
  streak: number;
  todayDate: string;
}

const QUICK_SUGGESTIONS = [
  'Being present with my family',
  'Staying honest with my partner',
  'Choosing rest over escape',
  'Asking for help when I need it',
  'Responding to urges with curiosity, not shame',
  'Moving my body when stress builds',
];

type TimeOfDay = 'morning' | 'daytime' | 'evening';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'daytime';
  return 'evening';
}

export default function DailyCommitment() {
  const { data, error, isLoading: loading, mutate } = useSWR<CommitmentData>('/api/commitments');
  const [intention, setIntention] = useState('');
  const [reflection, setReflection] = useState('');
  const [intentionMet, setIntentionMet] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    // Update time of day every minute
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Set morning intention ─────────────────────────────────
  const handleSetIntention = async () => {
    if (!intention.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention: intention.trim() }),
      });
      if (res.ok) {
        await mutate();
        setIntention('');
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // ── Save evening reflection ───────────────────────────────
  const handleSaveReflection = async () => {
    if (intentionMet === null) return;
    setSaving(true);
    try {
      const res = await fetch('/api/commitments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflection: reflection.trim() || undefined,
          intention_met: intentionMet,
        }),
      });
      if (res.ok) {
        await mutate();
        setShowReview(false);
        setReflection('');
        setIntentionMet(null);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return <div className="skeleton-shimmer h-36 rounded-3xl" />;
  }

  const todayCommitment = data?.today;
  const hasIntention = !!todayCommitment?.morning_intention;
  const hasReflection = todayCommitment?.evening_reflection != null || todayCommitment?.intention_met != null;
  const streak = data?.streak ?? 0;
  const isEvening = timeOfDay === 'evening';

  // ── Morning: no intention set yet ─────────────────────────
  if (!hasIntention) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-outline-variant">
        {/* Sunrise gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50/40" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -translate-y-8 translate-x-8" />

        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                wb_twilight
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Morning Intention
              </h3>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                Start with purpose
              </p>
            </div>
            {streak > 0 && (
              <div className="ml-auto inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-label text-xs font-bold">{streak}-day streak</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="space-y-3">
            <label className="block">
              <span className="font-body text-sm text-on-surface-variant">
                Today I commit to...
              </span>
              <input
                type="text"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetIntention()}
                placeholder="What will guide your choices today?"
                className="mt-2 w-full rounded-xl bg-white/80 border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                maxLength={500}
              />
            </label>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => setIntention(s)}
                  className="text-[10px] font-label text-on-surface-variant bg-white/60 hover:bg-white/90 border border-outline-variant/20 rounded-full px-2.5 py-1 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={handleSetIntention}
              disabled={!intention.trim() || saving}
              className="w-full rounded-xl bg-primary text-on-primary font-label text-sm font-medium py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 shadow-sm shadow-primary/15"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  Setting...
                </span>
              ) : (
                'Set Intention'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Daytime/Evening: intention is set ────────────────────
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-outline-variant transition-all ${
      isEvening && !hasReflection ? 'ring-1 ring-primary/20' : ''
    }`}>
      {/* Background gradient based on time */}
      <div className={`absolute inset-0 ${
        isEvening
          ? 'bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-surface-container-lowest'
          : 'bg-gradient-to-br from-sky-50/40 via-surface-container-lowest to-surface-container-lowest'
      }`} />

      <div className="relative p-5 space-y-4">
        {/* Intention display */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isEvening ? 'bg-indigo-100' : 'bg-sky-100'
          }`}>
            <span className={`material-symbols-outlined ${isEvening ? 'text-indigo-700' : 'text-sky-700'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}>
              {isEvening ? 'nights_stay' : 'light_mode'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Your commitment today
            </p>
            <p className="font-body text-sm text-on-surface leading-relaxed">
              &ldquo;{todayCommitment?.morning_intention}&rdquo;
            </p>
          </div>
          {streak > 0 && (
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full px-2.5 py-1 shrink-0">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-label text-[10px] font-bold">{streak}</span>
            </div>
          )}
        </div>

        {/* Already reflected */}
        {hasReflection && (
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-3">
            <span className={`material-symbols-outlined text-lg ${
              todayCommitment?.intention_met ? 'text-emerald-600' : 'text-amber-600'
            }`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {todayCommitment?.intention_met ? 'check_circle' : 'pending'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-label text-xs font-semibold text-on-surface">
                {todayCommitment?.intention_met ? 'Intention met' : 'Still working on it'}
              </p>
              {todayCommitment?.evening_reflection && (
                <p className="font-body text-[11px] text-on-surface-variant mt-0.5 truncate">
                  {todayCommitment.evening_reflection}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Evening review prompt */}
        {isEvening && !hasReflection && !showReview && (
          <button
            onClick={() => setShowReview(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary font-label text-sm font-medium py-3 transition-all"
          >
            <span className="material-symbols-outlined text-sm">rate_review</span>
            Evening Reflection
          </button>
        )}

        {/* Evening review form */}
        {showReview && (
          <div className="space-y-4 bg-white/50 rounded-xl p-4">
            <p className="font-body text-sm text-on-surface font-medium">
              Did you live your intention today?
            </p>

            <div className="flex gap-2">
              {[
                { label: 'Yes', value: true, icon: 'check_circle', color: 'emerald' },
                { label: 'No', value: false, icon: 'cancel', color: 'red' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setIntentionMet(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-label text-sm font-medium transition-all ${
                    intentionMet === opt.value
                      ? opt.color === 'emerald'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : 'border-outline-variant/30 bg-white hover:border-outline-variant/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What happened? (optional)"
              rows={3}
              className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
              maxLength={2000}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowReview(false); setIntentionMet(null); setReflection(''); }}
                className="flex-1 rounded-xl bg-surface-container text-on-surface font-label text-sm py-2.5 hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReflection}
                disabled={intentionMet === null || saving}
                className="flex-1 rounded-xl bg-primary text-on-primary font-label text-sm font-medium py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
              >
                {saving ? 'Saving...' : 'Save Reflection'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
