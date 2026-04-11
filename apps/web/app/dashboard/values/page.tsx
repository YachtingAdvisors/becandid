'use client';
// ============================================================
// /dashboard/values — Values Clarification Exercise
//
// A meaningful workshop, not a form. Based on Motivational
// Interviewing (Miller & Rollnick): developing discrepancy
// between core values and rival behavior creates the internal
// motivation for lasting change.
//
// Step 1: Select your values (pick 5-7 from 16)
// Step 2: Rank them (drag or arrow buttons)
// Step 3: The Conflict — how does the rival conflict with each?
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import MaterialIcon from '@/components/ui/MaterialIcon';

// ── Types & Constants ──────────────────────────────────────

interface UserValue {
  value_name: string;
  rank: number;
  rival_conflict: string;
}

const VALUE_OPTIONS = [
  { name: 'Family', icon: 'family_restroom' },
  { name: 'Honesty', icon: 'verified' },
  { name: 'Faith', icon: 'church' },
  { name: 'Health', icon: 'favorite' },
  { name: 'Career', icon: 'work' },
  { name: 'Friendship', icon: 'group' },
  { name: 'Freedom', icon: 'flight_takeoff' },
  { name: 'Creativity', icon: 'palette' },
  { name: 'Service', icon: 'volunteer_activism' },
  { name: 'Integrity', icon: 'shield' },
  { name: 'Adventure', icon: 'explore' },
  { name: 'Peace', icon: 'spa' },
  { name: 'Love', icon: 'heart_check' },
  { name: 'Knowledge', icon: 'school' },
  { name: 'Community', icon: 'diversity_3' },
  { name: 'Self-Respect', icon: 'self_improvement' },
];

// Suggested conflict text based on common rival categories
const CONFLICT_SUGGESTIONS: Record<string, Record<string, string>> = {
  Family: {
    default: 'Time spent here is time not spent being present with the people you love.',
  },
  Honesty: {
    default: 'Every session requires hiding, lying, or omitting — the opposite of honesty.',
  },
  Faith: {
    default: 'This pulls you away from the person your faith calls you to be.',
  },
  Health: {
    default: 'The shame cycle drains your energy, disrupts your sleep, and erodes your well-being.',
  },
  Career: {
    default: 'The mental fog and shame steal focus from the work that matters to you.',
  },
  Friendship: {
    default: 'Secrecy creates walls between you and the people who care about you.',
  },
  Freedom: {
    default: 'What feels like freedom is actually compulsion — true freedom is choice.',
  },
  Creativity: {
    default: 'The dopamine hijack flattens your creativity and dulls your inspiration.',
  },
  Service: {
    default: 'Hard to serve others when you are trapped in a cycle of self-focus.',
  },
  Integrity: {
    default: 'Every hidden session is a fracture between who you are and who you want to be.',
  },
  Adventure: {
    default: 'Real adventure requires presence and courage — this is the opposite of both.',
  },
  Peace: {
    default: 'The anxiety of being caught, the shame afterward — there is no peace here.',
  },
  Love: {
    default: 'Genuine love requires vulnerability and presence. This walls you off from both.',
  },
  Knowledge: {
    default: 'You know this is not leading you where you want to go.',
  },
  Community: {
    default: 'Isolation and secrecy erode your ability to show up for your community.',
  },
  'Self-Respect': {
    default: 'How you feel about yourself after — that is the truest signal.',
  },
};

const MIN_VALUES = 5;
const MAX_VALUES = 7;

// ── Page ───────────────────────────────────────────────────

export default function ValuesPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 'complete'>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  // ── Load existing values ──────────────────────────────────
  useEffect(() => {
    fetch('/api/values')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.values?.length) {
          const vals: UserValue[] = data.values;
          setSelected(vals.map((v) => v.value_name));
          setRanked(vals.map((v) => v.value_name));
          const c: Record<string, string> = {};
          vals.forEach((v) => { if (v.rival_conflict) c[v.value_name] = v.rival_conflict; });
          setConflicts(c);
          setHasExisting(true);
          setStep('complete');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────────

  const toggleValue = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      if (prev.length >= MAX_VALUES) return prev;
      return [...prev, name];
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setRanked((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setRanked((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const getSuggestion = (valueName: string): string => {
    return CONFLICT_SUGGESTIONS[valueName]?.default || 'How does your rival conflict with this value?';
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const values = ranked.map((name, i) => ({
        value_name: name,
        rank: i + 1,
        rival_conflict: conflicts[name] || '',
      }));

      const res = await fetch('/api/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });

      if (res.ok) {
        setStep('complete');
        setHasExisting(true);
      }
    } catch {
      // handled by UI
    } finally {
      setSaving(false);
    }
  }, [ranked, conflicts]);

  const startOver = () => {
    setStep(1);
    setSelected([]);
    setRanked([]);
    setConflicts({});
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 page-enter pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5">
          <MaterialIcon name="diamond" filled className="text-sm" />
          <span className="font-label text-xs font-semibold uppercase tracking-wider">Values Clarification</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          What Matters Most to You
        </h1>
        <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          When your actions align with your values, change becomes natural.
          When they conflict, that tension is what drives growth.
        </p>
      </div>

      {/* Step Indicator */}
      {step !== 'complete' && (
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-label font-bold transition-all ${
                step === s
                  ? 'bg-primary text-on-primary'
                  : step > s
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-container text-on-surface-variant'
              }`}>
                {(typeof step === 'number' && step > s) ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 transition-colors ${
                  typeof step === 'number' && step > s ? 'bg-primary/30' : 'bg-surface-container'
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Step 1: Select Values ───────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-headline text-lg font-bold text-on-surface">Select Your Values</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              Pick the values that matter most to you. Not what <em>should</em> matter — what actually does.
            </p>
            <p className="font-label text-xs text-primary mt-2">
              {selected.length} of {MIN_VALUES}-{MAX_VALUES} selected
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VALUE_OPTIONS.map((v) => {
              const isSelected = selected.includes(v.name);
              const isDisabled = !isSelected && selected.length >= MAX_VALUES;
              return (
                <button
                  key={v.name}
                  onClick={() => toggleValue(v.name)}
                  disabled={isDisabled}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : isDisabled
                        ? 'border-outline-variant/20 bg-surface-container/30 opacity-40 cursor-not-allowed'
                        : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30 hover:bg-primary/[0.02]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <MaterialIcon name="check_circle" filled className="text-primary text-sm" />
                    </div>
                  )}
                  <MaterialIcon name={v.icon} filled className={`text-2xl ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className={`font-label text-xs font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {v.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => { setRanked(selected); setStep(2); }}
              disabled={selected.length < MIN_VALUES}
              className="rounded-full bg-primary text-on-primary font-label text-sm font-medium py-3 px-10 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              Continue to Ranking
              <span className="material-symbols-outlined text-sm align-middle ml-1">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Rank Values ─────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-headline text-lg font-bold text-on-surface">Rank Your Values</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              If you could only keep one, which would it be? Put it first.
            </p>
          </div>

          <div className="space-y-2">
            {ranked.map((name, index) => {
              const option = VALUE_OPTIONS.find((v) => v.name === name);
              return (
                <div
                  key={name}
                  className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-4 py-3 transition-all"
                >
                  {/* Rank number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-headline font-bold text-sm ${
                    index === 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Icon + name */}
                  <MaterialIcon name={option?.icon ?? ''} filled className="text-primary text-lg" />
                  <span className="font-label text-sm font-semibold text-on-surface flex-1">{name}</span>

                  {/* Arrow buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-surface-container disabled:opacity-20 transition-colors"
                      aria-label={`Move ${name} up`}
                    >
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">keyboard_arrow_up</span>
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === ranked.length - 1}
                      className="p-1 rounded-lg hover:bg-surface-container disabled:opacity-20 transition-colors"
                      aria-label={`Move ${name} down`}
                    >
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-full bg-surface-container text-on-surface font-label text-sm font-medium py-3 px-8 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
              Back
            </button>
            <button
              onClick={() => {
                // Pre-fill suggestions for any values that do not have conflicts yet
                const c = { ...conflicts };
                ranked.forEach((name) => {
                  if (!c[name]) c[name] = getSuggestion(name);
                });
                setConflicts(c);
                setStep(3);
              }}
              className="rounded-full bg-primary text-on-primary font-label text-sm font-medium py-3 px-10 hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
            >
              Continue to Conflicts
              <span className="material-symbols-outlined text-sm align-middle ml-1">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: The Conflict ────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-headline text-lg font-bold text-on-surface">The Conflict</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1 max-w-md mx-auto leading-relaxed">
              This is the heart of the exercise. For each value, describe how your rival conflicts with it.
              This dissonance is what drives real change.
            </p>
          </div>

          <div className="space-y-4">
            {ranked.map((name, index) => {
              const option = VALUE_OPTIONS.find((v) => v.name === name);
              return (
                <div
                  key={name}
                  className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-headline font-bold text-xs ${
                      index === 0
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {index + 1}
                    </div>
                    <MaterialIcon name={option?.icon ?? ''} filled className="text-primary" />
                    <span className="font-label text-sm font-semibold text-on-surface">{name}</span>
                  </div>

                  <label className="block">
                    <span className="font-body text-xs text-on-surface-variant">
                      How does your rival conflict with <span className="font-semibold text-on-surface">{name}</span>?
                    </span>
                    <textarea
                      value={conflicts[name] || ''}
                      onChange={(e) => setConflicts((prev) => ({ ...prev, [name]: e.target.value }))}
                      rows={3}
                      className="mt-2 w-full rounded-xl bg-surface-container/50 border border-outline-variant/30 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all"
                      placeholder={getSuggestion(name)}
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-full bg-surface-container text-on-surface font-label text-sm font-medium py-3 px-8 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-primary text-on-primary font-label text-sm font-medium py-3 px-10 hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <>
                  Save My Values
                  <span className="material-symbols-outlined text-sm align-middle ml-1">check</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Completion State ────────────────────────────────── */}
      {step === 'complete' && (
        <div className="space-y-8">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <MaterialIcon name="diamond" filled className="text-3xl text-emerald-600" />
            </div>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Your values are set.
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              They will appear in your pause screen, weekly reflections,
              and conversation coach prompts — gentle reminders of who you want to be.
            </p>
          </div>

          {/* Show current values */}
          <div className="space-y-3">
            {ranked.map((name, index) => {
              const option = VALUE_OPTIONS.find((v) => v.name === name);
              return (
                <div key={name} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-5 py-4 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-headline font-bold text-sm ${
                    index === 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={option?.icon ?? ''} filled className="text-primary text-lg" />
                      <span className="font-label text-sm font-semibold text-on-surface">{name}</span>
                    </div>
                    {conflicts[name] && (
                      <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed italic">
                        &ldquo;{conflicts[name]}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={startOver}
              className="rounded-full bg-surface-container text-on-surface font-label text-sm font-medium py-2.5 px-6 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">refresh</span>
              Redo Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
