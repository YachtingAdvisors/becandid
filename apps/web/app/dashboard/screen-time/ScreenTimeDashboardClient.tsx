'use client';

import { useState, useCallback } from 'react';

interface CategoryLimit {
  id: string;
  category: string;
  daily_limit_minutes: number;
  enabled: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  pornography: '🔞',
  sexting: '💬',
  social_media: '📱',
  binge_watching: '📺',
  gambling: '🎰',
  gaming: '🎮',
  dating_apps: '💘',
  substances: '🍺',
  doom_scrolling: '📜',
  custom: '⚙️',
  all: '📊',
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface ScreenTimeDashboardClientProps {
  limits: CategoryLimit[];
}

export default function ScreenTimeDashboardClient({ limits: initialLimits }: ScreenTimeDashboardClientProps) {
  const [limits, setLimits] = useState<CategoryLimit[]>(initialLimits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const startEdit = useCallback((limit: CategoryLimit) => {
    setEditingId(limit.id);
    setEditHours(Math.floor(limit.daily_limit_minutes / 60));
    setEditMinutes(limit.daily_limit_minutes % 60);
    setMessage(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setMessage(null);
  }, []);

  const saveLimit = useCallback(async (limit: CategoryLimit) => {
    const totalMinutes = editHours * 60 + editMinutes;
    if (totalMinutes < 1) {
      setMessage({ type: 'error', text: 'Limit must be at least 1 minute.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/category-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: limit.category,
          daily_limit_minutes: totalMinutes,
          enabled: limit.enabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setLimits((prev) =>
        prev.map((l) =>
          l.id === limit.id ? { ...l, daily_limit_minutes: totalMinutes } : l
        )
      );
      setEditingId(null);
      setMessage({ type: 'success', text: 'Limit saved.' });
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save limit. Try again.' });
    } finally {
      setSaving(false);
    }
  }, [editHours, editMinutes]);

  const toggleEnabled = useCallback(async (limit: CategoryLimit) => {
    const newEnabled = !limit.enabled;
    // Optimistic update
    setLimits((prev) =>
      prev.map((l) => (l.id === limit.id ? { ...l, enabled: newEnabled } : l))
    );

    try {
      const res = await fetch('/api/category-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: limit.category,
          daily_limit_minutes: limit.daily_limit_minutes,
          enabled: newEnabled,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setLimits((prev) =>
        prev.map((l) => (l.id === limit.id ? { ...l, enabled: !newEnabled } : l))
      );
      setMessage({ type: 'error', text: 'Failed to toggle. Try again.' });
    }
  }, []);

  return (
    <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4 stagger">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-on-surface">Category Limits</h2>
        {message && (
          <span
            className={`text-xs font-label font-medium px-2.5 py-1 rounded-full ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-error/10 text-error'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      {limits.length > 0 ? (
        <div className="space-y-3">
          {limits.map((limit) => {
            const isEditing = editingId === limit.id;
            const emoji = CATEGORY_EMOJIS[limit.category] ?? '📊';

            return (
              <div
                key={limit.id}
                className={`rounded-2xl p-4 transition-all duration-200 ${
                  isEditing
                    ? 'bg-primary/[0.04] ring-1 ring-primary/20'
                    : 'bg-surface-container-low hover:ring-1 hover:ring-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleEnabled(limit)}
                    className="relative shrink-0 cursor-pointer"
                    aria-label={`${limit.enabled ? 'Disable' : 'Enable'} ${limit.category} limit`}
                  >
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        limit.enabled ? 'bg-primary' : 'bg-on-surface-variant/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${
                          limit.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Category info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <span className="font-label font-medium text-sm text-on-surface capitalize">
                        {limit.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-label ${
                        limit.enabled ? 'text-on-surface-variant' : 'text-on-surface-variant/40'
                      }`}
                    >
                      {formatMinutes(limit.daily_limit_minutes)} / day
                    </span>
                  </div>

                  {/* Edit button */}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(limit)}
                      className="p-2 rounded-xl hover:bg-primary/[0.08] cursor-pointer transition-colors"
                      aria-label={`Edit ${limit.category} limit`}
                    >
                      <span className="material-symbols-outlined text-primary text-lg">edit</span>
                    </button>
                  )}
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={editHours}
                          onChange={(e) => setEditHours(Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
                          className="w-16 px-3 py-2 text-sm font-label text-on-surface bg-surface-container-lowest border border-outline-variant rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-xs font-label text-on-surface-variant">hrs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                          className="w-16 px-3 py-2 text-sm font-label text-on-surface bg-surface-container-lowest border border-outline-variant rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-xs font-label text-on-surface-variant">min</span>
                      </div>

                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-xs font-label font-medium text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveLimit(limit)}
                          disabled={saving}
                          className="px-4 py-1.5 text-xs font-label font-bold text-on-primary bg-primary rounded-full hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar showing current limit visually */}
                {limit.enabled && !isEditing && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/40"
                        style={{
                          width: `${Math.min((limit.daily_limit_minutes / 480) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] font-label text-on-surface-variant/50">0h</span>
                      <span className="text-[9px] font-label text-on-surface-variant/50">8h</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">timer_off</span>
          <p className="text-sm text-on-surface-variant font-body mb-1">
            No category limits configured.
          </p>
          <p className="text-xs text-on-surface-variant/60 font-body">
            Set time limits for rival categories in{' '}
            <a href="/dashboard/settings" className="text-primary hover:underline">
              Settings
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
}
