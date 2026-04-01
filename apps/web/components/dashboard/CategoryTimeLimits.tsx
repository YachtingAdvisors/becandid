'use client';

import { useState, useEffect, useCallback } from 'react';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory } from '@be-candid/shared';

interface CategoryLimit {
  id?: string;
  category: string;
  daily_limit_minutes: number;
  warning_minutes: number;
  sequential_limit_minutes: number | null;
  enabled: boolean;
}

interface LimitDraft {
  daily_limit_minutes: number;
  warning_minutes: number;
  enabled: boolean;
  dirty: boolean;
  saving: boolean;
}

export default function CategoryTimeLimits() {
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [drafts, setDrafts] = useState<Record<string, LimitDraft>>({});
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState<GoalCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Fetch profile goals and existing limits on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/auth/profile').then(r => r.json()),
      fetch('/api/category-limits').then(r => r.json()),
    ])
      .then(([profileData, limitsData]) => {
        const userGoals: GoalCategory[] = profileData.profile?.goals ?? [];
        setGoals(userGoals);
        const existingLimits: CategoryLimit[] = limitsData.limits ?? [];
        setLimits(existingLimits);

        // Initialize drafts from existing limits
        const initialDrafts: Record<string, LimitDraft> = {};
        existingLimits.forEach((lim: CategoryLimit) => {
          initialDrafts[lim.category] = {
            daily_limit_minutes: lim.daily_limit_minutes,
            warning_minutes: lim.warning_minutes,
            enabled: lim.enabled,
            dirty: false,
            saving: false,
          };
        });
        setDrafts(initialDrafts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateDraft = useCallback((category: string, updates: Partial<LimitDraft>) => {
    setDrafts(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
        dirty: true,
      },
    }));
  }, []);

  const saveLimit = useCallback(async (category: string) => {
    const draft = drafts[category];
    if (!draft) return;

    setDrafts(prev => ({
      ...prev,
      [category]: { ...prev[category], saving: true },
    }));

    try {
      const res = await fetch('/api/category-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          daily_limit_minutes: draft.daily_limit_minutes,
          warning_minutes: draft.warning_minutes,
          enabled: draft.enabled,
        }),
      });

      if (res.ok) {
        setDrafts(prev => ({
          ...prev,
          [category]: { ...prev[category], dirty: false, saving: false },
        }));
        // Add to limits if it was a new entry
        setLimits(prev => {
          const exists = prev.some(l => l.category === category);
          if (!exists) {
            return [
              ...prev,
              {
                category,
                daily_limit_minutes: draft.daily_limit_minutes,
                warning_minutes: draft.warning_minutes,
                sequential_limit_minutes: null,
                enabled: draft.enabled,
              },
            ];
          }
          return prev.map(l =>
            l.category === category
              ? { ...l, daily_limit_minutes: draft.daily_limit_minutes, warning_minutes: draft.warning_minutes, enabled: draft.enabled }
              : l,
          );
        });
      }
    } catch (err) {
      console.error('Failed to save limit:', err);
    } finally {
      setDrafts(prev => ({
        ...prev,
        [category]: { ...prev[category], saving: false },
      }));
    }
  }, [drafts]);

  const deleteLimit = useCallback(async (category: string) => {
    setDeletingCategory(category);
    try {
      const res = await fetch(`/api/category-limits?category=${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLimits(prev => prev.filter(l => l.category !== category));
        setDrafts(prev => {
          const next = { ...prev };
          delete next[category];
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to delete limit:', err);
    } finally {
      setDeletingCategory(null);
    }
  }, []);

  const addLimit = useCallback((category: GoalCategory) => {
    setDrafts(prev => ({
      ...prev,
      [category]: {
        daily_limit_minutes: 60,
        warning_minutes: 5,
        enabled: true,
        dirty: true,
        saving: false,
      },
    }));
    setAddingCategory(null);
  }, []);

  // Categories that already have a limit configured (or a draft)
  const configuredCategories = new Set([
    ...limits.map(l => l.category),
    ...Object.keys(drafts),
  ]);

  // Goals that don't yet have a limit
  const unconfiguredGoals = goals.filter(g => !configuredCategories.has(g));

  // Categories to display cards for (configured ones that are in goals, plus any with drafts)
  const displayCategories = Array.from(configuredCategories).filter(
    cat => goals.includes(cat as GoalCategory) || limits.some(l => l.category === cat),
  );

  if (loading) {
    return (
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-4 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Daily Time Limits</h2>
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined text-on-surface-variant animate-spin text-2xl">progress_activity</span>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-4 ring-1 ring-outline-variant/10 shadow-sm">
      <div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Daily Time Limits</h2>
        <p className="text-xs text-on-surface-variant font-body mt-1">
          Set how much time you want to allow per category each day. You&apos;ll get a warning notification when you&apos;re close to your limit, and a flag when you exceed it.
        </p>
      </div>

      {displayCategories.length === 0 && unconfiguredGoals.length === 0 && (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-on-surface-variant text-3xl mb-2 block">timer_off</span>
          <p className="text-sm text-on-surface-variant font-body">
            No categories configured. Add goals in your profile settings first.
          </p>
        </div>
      )}

      {/* Configured limit cards */}
      <div className="space-y-3">
        {displayCategories.map(category => {
          const cat = category as GoalCategory;
          const draft = drafts[category];
          const label = GOAL_LABELS[cat] ?? category;
          const emoji = getCategoryEmoji(cat);
          const isDeleting = deletingCategory === category;

          if (!draft) return null;

          return (
            <div
              key={category}
              className={`bg-surface-container-low rounded-2xl ring-1 ring-outline-variant/10 p-4 space-y-3 transition-opacity duration-200 ${
                !draft.enabled ? 'opacity-60' : ''
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label={label}>{emoji}</span>
                  <span className="font-label font-bold text-sm text-on-surface">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Enable/disable toggle */}
                  <button
                    type="button"
                    onClick={() => updateDraft(category, { enabled: !draft.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                      draft.enabled ? 'bg-primary' : 'bg-outline-variant/30'
                    }`}
                    aria-label={draft.enabled ? 'Disable limit' : 'Enable limit'}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                        draft.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => deleteLimit(category)}
                    disabled={isDeleting}
                    className="p-1 text-on-surface-variant hover:text-error transition-colors duration-200 cursor-pointer disabled:opacity-50"
                    aria-label="Remove limit"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isDeleting ? 'progress_activity' : 'delete'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Daily limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-label font-medium text-on-surface-variant">
                  Daily limit
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={480}
                    step={5}
                    value={draft.daily_limit_minutes}
                    onChange={e => updateDraft(category, { daily_limit_minutes: Number(e.target.value) })}
                    className="flex-1 h-1.5 accent-primary cursor-pointer"
                    disabled={!draft.enabled}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={draft.daily_limit_minutes}
                      onChange={e => updateDraft(category, { daily_limit_minutes: Math.max(1, Math.min(1440, Number(e.target.value))) })}
                      className="w-16 text-center text-sm font-label font-bold text-on-surface bg-surface-container-lowest rounded-lg px-2 py-1 ring-1 ring-outline-variant/10 focus:ring-primary focus:outline-none"
                      disabled={!draft.enabled}
                    />
                    <span className="text-xs text-on-surface-variant font-body">min</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant font-body">
                  {draft.daily_limit_minutes >= 60
                    ? `${Math.floor(draft.daily_limit_minutes / 60)}h ${draft.daily_limit_minutes % 60 > 0 ? `${draft.daily_limit_minutes % 60}m` : ''}`
                    : `${draft.daily_limit_minutes} minutes`}{' '}
                  per day
                </p>
              </div>

              {/* Warning threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-label font-medium text-on-surface-variant">
                  Warning before limit
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={draft.warning_minutes}
                    onChange={e => updateDraft(category, { warning_minutes: Number(e.target.value) })}
                    disabled={!draft.enabled}
                    className="text-sm font-label text-on-surface bg-surface-container-lowest rounded-lg px-3 py-1.5 ring-1 ring-outline-variant/10 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value={2}>2 minutes before</option>
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                  </select>
                </div>
              </div>

              {/* Save button */}
              {draft.dirty && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => saveLimit(category)}
                    disabled={draft.saving}
                    className="bg-primary text-on-primary rounded-full font-label font-bold text-xs px-5 py-2 min-h-[36px] hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {draft.saving ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        Saving
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add limit section */}
      {unconfiguredGoals.length > 0 && (
        <div className="pt-2">
          {addingCategory ? (
            <div className="bg-surface-container-low rounded-2xl ring-1 ring-outline-variant/10 p-4 space-y-3">
              <p className="text-xs font-label font-medium text-on-surface-variant">Select a category</p>
              <div className="flex flex-wrap gap-2">
                {unconfiguredGoals.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addLimit(cat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-label font-medium text-on-surface bg-surface-container-lowest rounded-full ring-1 ring-outline-variant/10 hover:bg-primary-container hover:text-primary transition-all duration-200 cursor-pointer"
                  >
                    <span>{getCategoryEmoji(cat)}</span>
                    {GOAL_LABELS[cat]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAddingCategory(null)}
                className="text-xs font-label font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingCategory(unconfiguredGoals[0])}
              className="inline-flex items-center gap-1.5 text-xs font-label font-bold text-primary hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add time limit
            </button>
          )}
        </div>
      )}
    </section>
  );
}
