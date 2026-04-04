'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────

interface Inventory {
  id: string;
  date: string;
  went_well: string | null;
  was_dishonest: string | null;
  owe_apology: string | null;
  grateful_for: string | null;
  overall_rating: number | null;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────

const PROMPTS = [
  {
    field: 'went_well',
    label: 'What went well today?',
    placeholder: 'A small win, a good conversation, a moment of clarity...',
    accentBorder: 'border-l-emerald-400',
    accentBg: 'bg-emerald-50',
    icon: 'check_circle',
    iconColor: 'text-emerald-600',
  },
  {
    field: 'was_dishonest',
    label: 'Where was I dishonest or avoidant?',
    placeholder: 'I stretched the truth about..., I avoided...',
    accentBorder: 'border-l-amber-400',
    accentBg: 'bg-amber-50',
    icon: 'visibility',
    iconColor: 'text-amber-600',
  },
  {
    field: 'owe_apology',
    label: 'Who do I owe an apology to?',
    placeholder: 'I was short with..., I forgot to...',
    accentBorder: 'border-l-rose-400',
    accentBg: 'bg-rose-50',
    icon: 'favorite',
    iconColor: 'text-rose-500',
  },
  {
    field: 'grateful_for',
    label: 'What am I grateful for?',
    placeholder: 'My health, a friend who listened, another day of progress...',
    accentBorder: 'border-l-teal-400',
    accentBg: 'bg-teal-50',
    icon: 'spa',
    iconColor: 'text-teal-600',
  },
] as const;

const RATINGS = [
  { v: 1, label: 'Rough', emoji: '\uD83D\uDE1E' },
  { v: 2, label: 'Hard', emoji: '\uD83D\uDE15' },
  { v: 3, label: 'Okay', emoji: '\uD83D\uDE10' },
  { v: 4, label: 'Good', emoji: '\uD83D\uDE42' },
  { v: 5, label: 'Great', emoji: '\uD83D\uDE04' },
];

// ── Component ──────────────────────────────────────────────

interface DailyInventoryProps {
  /** If true, show in compact dashboard mode */
  compact?: boolean;
}

export default function DailyInventory({ compact = false }: DailyInventoryProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [wentWell, setWentWell] = useState('');
  const [wasDishonest, setWasDishonest] = useState('');
  const [oweApology, setOweApology] = useState('');
  const [gratefulFor, setGratefulFor] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  // Time-awareness: show more prominently after 8 PM
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsEvening(hour >= 20 || hour < 4);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // ── Fetch today's inventory ──────────────────────────────

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch(`/api/inventory?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        const inv = data.inventories?.[0] ?? null;
        setInventory(inv);
        if (inv) {
          setWentWell(inv.went_well || '');
          setWasDishonest(inv.was_dishonest || '');
          setOweApology(inv.owe_apology || '');
          setGratefulFor(inv.grateful_for || '');
          setRating(inv.overall_rating);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [today]);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  // ── Save ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (saving) return;
    if (!wentWell.trim() && !wasDishonest.trim() && !oweApology.trim() && !gratefulFor.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          went_well: wentWell.trim() || null,
          was_dishonest: wasDishonest.trim() || null,
          owe_apology: oweApology.trim() || null,
          grateful_for: gratefulFor.trim() || null,
          overall_rating: rating,
          date: today,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        fetchToday();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const hasContent = !!(wentWell.trim() || wasDishonest.trim() || oweApology.trim() || gratefulFor.trim());
  const isCompleted = !!inventory;
  const showForm = !isCompleted || editing;

  // Field value getters/setters map
  const fieldState: Record<string, { value: string; setter: (v: string) => void }> = {
    went_well: { value: wentWell, setter: setWentWell },
    was_dishonest: { value: wasDishonest, setter: setWasDishonest },
    owe_apology: { value: oweApology, setter: setOweApology },
    grateful_for: { value: gratefulFor, setter: setGratefulFor },
  };

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
        <div className="skeleton-shimmer h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={`bg-surface-container-lowest rounded-3xl border transition-all duration-300 ${
      isEvening && !isCompleted
        ? 'border-primary/30 ring-2 ring-primary/10 shadow-lg shadow-primary/5'
        : 'border-outline-variant'
    }`}>
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isEvening && !isCompleted ? 'bg-primary/15' : 'bg-surface-container'
            }`}>
              <span className={`material-symbols-outlined text-lg ${
                isEvening && !isCompleted ? 'text-primary' : 'text-on-surface-variant'
              }`}>self_improvement</span>
            </div>
            <div>
              <h3 className="text-sm font-headline font-bold text-on-surface">
                Daily Inventory
              </h3>
              <p className="text-[10px] text-on-surface-variant font-label">
                Step 10 — Takes about 2 minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-label font-medium text-primary hover:text-primary/80 cursor-pointer transition-colors"
              >
                Edit
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-label animate-fade-in">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Saved
              </span>
            )}
          </div>
        </div>
        {isEvening && !isCompleted && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary/80 font-label">
            <span className="material-symbols-outlined text-sm">dark_mode</span>
            Good evening — a perfect time to reflect on your day
          </div>
        )}
      </div>

      {/* Form / Read-only */}
      <div className="p-5 pt-4">
        {showForm ? (
          <div className="space-y-3">
            {PROMPTS.map((prompt) => {
              const state = fieldState[prompt.field];
              return (
                <div
                  key={prompt.field}
                  className={`border-l-3 ${prompt.accentBorder} pl-3`}
                >
                  <label className="flex items-center gap-1.5 text-xs font-label font-medium text-on-surface mb-1">
                    <span className={`material-symbols-outlined text-sm ${prompt.iconColor}`}>{prompt.icon}</span>
                    {prompt.label}
                  </label>
                  <input
                    type="text"
                    value={state.value}
                    onChange={(e) => state.setter(e.target.value)}
                    placeholder={prompt.placeholder}
                    maxLength={1000}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 ring-1 ring-outline-variant/15 text-sm text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-on-surface-variant/35 transition-all"
                  />
                </div>
              );
            })}

            {/* Rating */}
            <div className="pt-1">
              <label className="block text-xs font-label font-medium text-on-surface mb-2">
                How was your day overall?
              </label>
              <div className="flex gap-1.5">
                {RATINGS.map((r) => (
                  <button
                    key={r.v}
                    onClick={() => setRating(rating === r.v ? null : r.v)}
                    className={`flex-1 py-2 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      rating === r.v
                        ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20'
                        : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="text-base">{r.emoji}</div>
                    <div className="text-[9px] text-on-surface-variant font-label mt-0.5">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!hasContent || saving}
              className={`w-full py-3 rounded-2xl text-sm font-label font-medium transition-all duration-300 ${
                hasContent
                  ? 'bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-md shadow-primary/15'
                  : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : editing ? 'Update Inventory' : 'Save Inventory'}
            </button>
          </div>
        ) : (
          /* Read-only view */
          <div className="space-y-2.5">
            {PROMPTS.map((prompt) => {
              const value = inventory?.[prompt.field as keyof Inventory] as string | null;
              if (!value) return null;
              return (
                <div key={prompt.field} className={`border-l-3 ${prompt.accentBorder} pl-3 py-0.5`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`material-symbols-outlined text-xs ${prompt.iconColor}`}>{prompt.icon}</span>
                    <span className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                      {prompt.label.replace('?', '')}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface font-body">{value}</p>
                </div>
              );
            })}
            {inventory?.overall_rating && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-on-surface-variant font-label">Overall:</span>
                <span className="text-base">{RATINGS.find((r) => r.v === inventory.overall_rating)?.emoji}</span>
                <span className="text-xs text-on-surface-variant font-label">
                  {RATINGS.find((r) => r.v === inventory.overall_rating)?.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact footer link */}
      {compact && isCompleted && !editing && (
        <div className="px-5 pb-4 pt-0">
          <a
            href="/dashboard/inventory"
            className="text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
          >
            View history
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      )}
    </div>
  );
}
