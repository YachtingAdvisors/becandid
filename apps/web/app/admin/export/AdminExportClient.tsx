'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface ExportCard {
  type: 'users' | 'revenue' | 'engagement';
  title: string;
  description: string;
  icon: string;
}

const EXPORTS: ExportCard[] = [
  {
    type: 'users',
    title: 'Users',
    description: 'All users with plan, status, streak, and join date.',
    icon: 'group',
  },
  {
    type: 'revenue',
    title: 'Revenue',
    description: 'Subscription data including plan, trial end, and Stripe ID.',
    icon: 'attach_money',
  },
  {
    type: 'engagement',
    title: 'Engagement',
    description: 'Weekly engagement metrics: streaks, check-ins, and activity.',
    icon: 'trending_up',
  },
];

// ─── Component ───────────────────────────────────────────────

export default function AdminExportClient() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch row counts from stats
  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, unknown>) => {
        const subs = (data.subscriptions ?? {}) as Record<string, number>;
        const total = (data.total_users as number) ?? 0;
        setCounts({
          users: total,
          revenue: (subs.pro ?? 0) + (subs.therapy ?? 0) + (subs.trialing ?? 0) + (subs.free ?? 0),
          engagement: total,
        });
      })
      .catch(() => setCounts({}))
      .finally(() => setLoadingCounts(false));
  }, []);

  const handleDownload = async (type: string) => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `becandid-${type}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — the browser will show a network error if needed
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">download</span>
        <h2 className="font-headline text-lg font-bold text-on-surface">
          Data Export
        </h2>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EXPORTS.map((exp) => (
          <div
            key={exp.type}
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6
                       flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {exp.icon}
                </span>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  {exp.title}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                {exp.description}
              </p>
              <p className="text-xs text-on-surface-variant font-body mt-2">
                {loadingCounts ? (
                  <span className="skeleton-shimmer inline-block w-16 h-4 rounded" />
                ) : (
                  <>
                    <span className="font-semibold text-on-surface">
                      {(counts[exp.type] ?? 0).toLocaleString()}
                    </span>{' '}
                    rows
                  </>
                )}
              </p>
            </div>

            <button
              onClick={() => handleDownload(exp.type)}
              disabled={downloading === exp.type}
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-full
                         text-sm font-label font-semibold
                         bg-primary text-on-primary hover:bg-primary/90 shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {downloading === exp.type ? 'hourglass_top' : 'download'}
              </span>
              {downloading === exp.type ? 'Generating...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
