'use client';

// ============================================================
// Accountability Report — Printable Weekly Summary
//
// A clean, print-friendly page users can bring to recovery
// groups, church leaders, or therapists. Fetches real data from
// the existing API endpoints and renders a minimal report
// optimised for @media print.
// ============================================================

import { useEffect, useState, useCallback } from 'react';

interface ReportData {
  name: string;
  streak: number;
  journalCount: number;
  checkinsCompleted: number;
  moodAverage: number | null;
  moodTrend: 'up' | 'down' | 'stable' | null;
  focusSummary: string;
  milestones: string[];
  momentumScore: number;
  dateRange: { start: string; end: string };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function moodLabel(avg: number): string {
  if (avg >= 4) return 'Great';
  if (avg >= 3) return 'Good';
  if (avg >= 2) return 'Okay';
  if (avg >= 1) return 'Low';
  return 'Struggling';
}

export default function AccountabilityReport() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dateRange = {
        start: weekAgo.toISOString(),
        end: now.toISOString(),
      };

      // Fetch all data in parallel
      const [momentumRes, profileRes] = await Promise.all([
        fetch('/api/momentum').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/account').then((r) => (r.ok ? r.json() : null)),
      ]);

      const momentum = momentumRes?.data ?? momentumRes;
      const profile = profileRes?.data ?? profileRes;

      setData({
        name: profile?.name ?? 'User',
        streak: momentum?.breakdown?.streak ?? momentum?.streak ?? 0,
        journalCount: momentum?.breakdown?.journal ?? 0,
        checkinsCompleted: momentum?.breakdown?.checkin ?? 0,
        moodAverage: momentum?.breakdown?.mood ?? null,
        moodTrend: momentum?.trend ?? null,
        focusSummary: momentum?.focusSummary ?? 'No focus board data this week.',
        milestones: momentum?.recentMilestones ?? [],
        momentumScore: momentum?.score ?? 0,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load report data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="space-y-6">
          <div className="skeleton-shimmer h-12 rounded-2xl" />
          <div className="skeleton-shimmer h-32 rounded-2xl" />
          <div className="skeleton-shimmer h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-error-container text-on-error-container rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-3xl mb-2">error</span>
          <p className="font-label text-sm">{error}</p>
          <button
            onClick={fetchReport}
            className="mt-4 px-4 py-2 bg-error text-on-error rounded-full text-sm font-label font-bold hover:bg-error/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          /* Hide all navigation, sidebars, and non-report UI */
          nav,
          header,
          aside,
          footer,
          .no-print,
          [data-no-print] {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
            font-size: 12pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .report-card {
            break-inside: avoid;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }

          .stat-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto p-6 report-container">
        {/* Print button — hidden when printing */}
        <div className="no-print mb-6 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-label font-bold hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print Report
          </button>
        </div>

        {/* Report header */}
        <div className="report-card bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-headline font-bold text-2xl text-on-surface">
                Accountability Report
              </h1>
              <p className="text-on-surface-variant text-sm font-label mt-1">
                {data.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant font-label">
                {formatDate(data.dateRange.start)}
              </p>
              <p className="text-xs text-on-surface-variant font-label">
                to {formatDate(data.dateRange.end)}
              </p>
            </div>
          </div>

          {/* Momentum score banner */}
          <div className="bg-primary/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="font-headline font-bold text-2xl text-primary">
                {data.momentumScore}
              </span>
            </div>
            <div>
              <p className="font-headline font-bold text-sm text-on-surface">
                Momentum Score
              </p>
              <p className="text-xs text-on-surface-variant font-label mt-0.5">
                Based on streak, journaling, check-ins, and mood
                {data.moodTrend && (
                  <span className="ml-1">
                    &middot; Trend:{' '}
                    <span className={
                      data.moodTrend === 'up'
                        ? 'text-emerald-600 font-bold'
                        : data.moodTrend === 'down'
                          ? 'text-red-600 font-bold'
                          : 'text-on-surface-variant'
                    }>
                      {data.moodTrend === 'up' ? 'Rising' : data.moodTrend === 'down' ? 'Falling' : 'Stable'}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stat-grid grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="report-card bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">
              {data.streak}
            </div>
            <p className="text-xs text-on-surface-variant font-label mt-1">
              Day Streak
            </p>
          </div>

          <div className="report-card bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">
              {data.journalCount}
            </div>
            <p className="text-xs text-on-surface-variant font-label mt-1">
              Journal Entries
            </p>
          </div>

          <div className="report-card bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">
              {data.checkinsCompleted}
            </div>
            <p className="text-xs text-on-surface-variant font-label mt-1">
              Check-ins Done
            </p>
          </div>

          <div className="report-card bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 text-center">
            <div className="text-3xl font-headline font-bold text-primary">
              {data.moodAverage != null ? moodLabel(data.moodAverage) : '—'}
            </div>
            <p className="text-xs text-on-surface-variant font-label mt-1">
              Avg. Mood
            </p>
          </div>
        </div>

        {/* Focus Board Summary */}
        <div className="report-card bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Focus Board Summary
            </h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed font-label">
            {data.focusSummary}
          </p>
        </div>

        {/* Recent Milestones */}
        {data.milestones.length > 0 && (
          <div className="report-card bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <h3 className="font-headline font-bold text-sm text-on-surface">
                Recent Milestones
              </h3>
            </div>
            <ul className="space-y-2">
              {data.milestones.map((ms) => (
                <li
                  key={ms}
                  className="flex items-center gap-2 text-sm text-on-surface font-label"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {ms}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-outline-variant/20">
          <p className="text-xs text-on-surface-variant/60 font-label">
            Prepared by Be Candid &mdash; becandid.io
          </p>
          <p className="text-[10px] text-on-surface-variant/40 font-label mt-1">
            Generated {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </>
  );
}
