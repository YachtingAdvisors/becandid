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

const FIELD_CONFIG = [
  { field: 'went_well', label: 'What went well', icon: 'check_circle', iconColor: 'text-emerald-600', border: 'border-l-emerald-400' },
  { field: 'was_dishonest', label: 'Where I was dishonest', icon: 'visibility', iconColor: 'text-amber-600', border: 'border-l-amber-400' },
  { field: 'owe_apology', label: 'Who I owe an apology', icon: 'favorite', iconColor: 'text-rose-500', border: 'border-l-rose-400' },
  { field: 'grateful_for', label: 'What I am grateful for', icon: 'spa', iconColor: 'text-teal-600', border: 'border-l-teal-400' },
] as const;

const RATINGS = [
  { v: 1, label: 'Rough', emoji: '\uD83D\uDE1E' },
  { v: 2, label: 'Hard', emoji: '\uD83D\uDE15' },
  { v: 3, label: 'Okay', emoji: '\uD83D\uDE10' },
  { v: 4, label: 'Good', emoji: '\uD83D\uDE42' },
  { v: 5, label: 'Great', emoji: '\uD83D\uDE04' },
];

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function fmtDateShort(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// ── Dynamic import of DailyInventory for today's form ──────

import DailyInventory from '@/components/dashboard/DailyInventory';

// ── Page Component ─────────────────────────────────────────

export default function InventoryPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // ── Fetch recent inventories ─────────────────────────────

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory?limit=30');
      if (res.ok) {
        const data = await res.json();
        setInventories(data.inventories || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Compute stats ────────────────────────────────────────

  const last7 = inventories.filter((inv) => {
    const d = new Date(inv.date + 'T12:00:00');
    const ago = Date.now() - d.getTime();
    return ago < 7 * 24 * 60 * 60 * 1000;
  });

  const streak = (() => {
    let count = 0;
    const sorted = [...inventories].sort((a, b) => b.date.localeCompare(a.date));
    const todayDate = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - i);
      const expStr = expected.toISOString().split('T')[0];
      if (sorted[i]?.date === expStr) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  const gratitudeDays = last7.filter((inv) => inv.grateful_for).length;
  const pastEntries = inventories.filter((inv) => inv.date !== today);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Daily Inventory
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant font-body">
          Step 10 — A daily practice of honest self-reflection
        </p>
      </div>

      {/* Intro */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
          </div>
          <div>
            <p className="text-sm text-on-surface font-body leading-relaxed">
              &ldquo;Continued to take personal inventory and when we were wrong promptly admitted it.&rdquo;
              This quick daily reflection takes just 2 minutes but builds lasting self-awareness.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {inventories.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 text-center">
            <div className="text-2xl font-headline font-bold text-primary">{streak}</div>
            <div className="text-[10px] text-on-surface-variant font-label mt-0.5">day streak</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 text-center">
            <div className="text-2xl font-headline font-bold text-on-surface">{last7.length}<span className="text-sm text-on-surface-variant">/7</span></div>
            <div className="text-[10px] text-on-surface-variant font-label mt-0.5">this week</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 text-center">
            <div className="text-2xl font-headline font-bold text-teal-600">{gratitudeDays}</div>
            <div className="text-[10px] text-on-surface-variant font-label mt-0.5">gratitude days</div>
          </div>
        </div>
      )}

      {/* Weekly insight */}
      {gratitudeDays > 0 && (
        <div className="bg-teal-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-600">lightbulb</span>
          <p className="text-sm text-teal-800 font-body">
            You mentioned gratitude {gratitudeDays} out of {Math.min(last7.length, 7)} day{last7.length !== 1 ? 's' : ''} this week.
            {gratitudeDays >= 5 ? ' That is a wonderful practice to maintain.' : ' Keep building this habit — it grows with practice.'}
          </p>
        </div>
      )}

      {/* Today's form */}
      <div className="mb-8">
        <DailyInventory compact={false} />
      </div>

      {/* History */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : pastEntries.length > 0 ? (
        <div>
          <h2 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest mb-4">
            Recent History
          </h2>
          <div className="space-y-3">
            {pastEntries.map((inv) => {
              const isExpanded = expandedId === inv.id;
              const ratingInfo = RATINGS.find((r) => r.v === inv.overall_rating);
              return (
                <div
                  key={inv.id}
                  className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                    className="w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">calendar_today</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-label font-medium text-on-surface">{fmtDate(inv.date)}</p>
                      <p className="text-[10px] text-on-surface-variant font-label mt-0.5">
                        {[
                          inv.went_well ? 'wins' : null,
                          inv.was_dishonest ? 'honest' : null,
                          inv.owe_apology ? 'apology' : null,
                          inv.grateful_for ? 'gratitude' : null,
                        ].filter(Boolean).join(' + ')}
                      </p>
                    </div>
                    {ratingInfo && (
                      <span className="text-base shrink-0" title={ratingInfo.label}>{ratingInfo.emoji}</span>
                    )}
                    <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-outline-variant/20 animate-fade-in">
                      <div className="space-y-2.5 mt-4">
                        {FIELD_CONFIG.map((fc) => {
                          const value = inv[fc.field as keyof Inventory] as string | null;
                          if (!value) return null;
                          return (
                            <div key={fc.field} className={`border-l-3 ${fc.border} pl-3 py-0.5`}>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`material-symbols-outlined text-xs ${fc.iconColor}`}>{fc.icon}</span>
                                <span className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                                  {fc.label}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface font-body">{value}</p>
                            </div>
                          );
                        })}
                        {ratingInfo && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-on-surface-variant font-label">Overall:</span>
                            <span className="text-base">{ratingInfo.emoji}</span>
                            <span className="text-xs text-on-surface-variant font-label">{ratingInfo.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : inventories.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">history</span>
          <p className="text-sm text-on-surface-variant font-body">
            Your history will appear here after your first inventory. Start above — it only takes 2 minutes.
          </p>
        </div>
      ) : null}
    </div>
  );
}
