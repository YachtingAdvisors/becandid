'use client';
// ============================================================
// /dashboard/commitments — Daily Commitment History
//
// Full page showing:
// - Today's commitment form (morning/evening)
// - Last 7 days as timeline cards
// - Streak counter + patterns
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import DailyCommitment from '@/components/dashboard/DailyCommitment';
import MaterialIcon from '@/components/ui/MaterialIcon';

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

export default function CommitmentsPage() {
  const [data, setData] = useState<CommitmentData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/commitments');
      if (res.ok) setData(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const history = data?.history ?? [];
  const streak = data?.streak ?? 0;
  const metCount = history.filter((c) => c.intention_met === true).length;
  const totalWithReflection = history.filter((c) => c.intention_met !== null).length;

  // Collect most common words from intentions
  const intentionWords = history
    .map((c) => c.morning_intention || '')
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const wordCounts: Record<string, number> = {};
  intentionWords.forEach((w) => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .filter(([, count]) => count > 1);

  return (
    <div className="max-w-2xl mx-auto space-y-8 page-enter pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5">
          <MaterialIcon name="wb_twilight" filled className="text-sm" />
          <span className="font-label text-xs font-semibold uppercase tracking-wider">Daily Commitment</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Start Each Day with Purpose
        </h1>
        <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Research shows that setting a specific daily intention increases
          follow-through by 2-3x. This is your sacred morning practice.
        </p>
      </div>

      {/* Today's commitment card */}
      <DailyCommitment />

      {/* Stats row */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MaterialIcon name="local_fire_department" filled className="text-amber-500 text-lg" />
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface">{streak}</div>
            <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Streak</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MaterialIcon name="check_circle" filled className="text-emerald-500 text-lg" />
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface">
              {totalWithReflection > 0 ? metCount : 0}
              <span className="text-sm text-on-surface-variant font-normal">/{totalWithReflection || 0}</span>
            </div>
            <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Met</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MaterialIcon name="calendar_month" filled className="text-primary text-lg" />
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface">{history.length}</div>
            <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">This Week</div>
          </div>
        </div>
      )}

      {/* History timeline */}
      {!loading && history.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Recent Commitments
          </h2>
          <div className="space-y-3">
            {history
              .filter((c) => c.date !== data?.todayDate)
              .map((c) => {
                const date = new Date(c.date + 'T12:00:00');
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={c.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-label text-xs font-semibold text-on-surface">{dayName}</span>
                        <span className="font-label text-[10px] text-on-surface-variant">{dateStr}</span>
                      </div>
                      {c.intention_met !== null && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-label font-bold ${
                          c.intention_met
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          <MaterialIcon name={c.intention_met ? 'check_circle' : 'cancel'} filled className="text-xs" />
                          {c.intention_met ? 'Met' : 'Missed'}
                        </span>
                      )}
                    </div>
                    {c.morning_intention && (
                      <p className="font-body text-sm text-on-surface">
                        &ldquo;{c.morning_intention}&rdquo;
                      </p>
                    )}
                    {c.evening_reflection && (
                      <p className="font-body text-xs text-on-surface-variant italic">
                        {c.evening_reflection}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Patterns */}
      {topWords.length > 0 && (
        <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4">
          <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Your Intention Themes
          </h2>
          <div className="flex flex-wrap gap-2">
            {topWords.map(([word, count]) => (
              <span
                key={word}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1.5 font-label text-xs font-medium"
              >
                {word}
                <span className="text-primary/50 text-[10px]">{count}x</span>
              </span>
            ))}
          </div>
          <p className="font-body text-xs text-on-surface-variant">
            These are the themes that keep showing up in your intentions.
            They reveal what matters most to you right now.
          </p>
        </section>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">wb_twilight</span>
          <p className="font-body text-sm text-on-surface-variant">
            Set your first morning intention above to begin your commitment practice.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>
      )}
    </div>
  );
}
