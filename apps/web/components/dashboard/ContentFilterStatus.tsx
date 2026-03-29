'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type FilterLevel = 'off' | 'standard' | 'strict' | 'custom';

interface ContentFilterData {
  level: FilterLevel;
  blocked_today: number;
  flagged_today: number;
  recent_blocked_domains: string[];
}

const LEVEL_STYLES: Record<FilterLevel, { label: string; className: string }> = {
  off: { label: 'Off', className: 'bg-surface-container-low text-on-surface-variant' },
  standard: { label: 'Standard', className: 'bg-primary-container text-primary' },
  strict: { label: 'Strict', className: 'bg-tertiary-container text-on-tertiary-container' },
  custom: { label: 'Custom', className: 'bg-secondary-container text-on-secondary-container' },
};

export default function ContentFilterStatus() {
  const [data, setData] = useState<ContentFilterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content-filter/status')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() =>
        setData({
          level: 'standard',
          blocked_today: 0,
          flagged_today: 0,
          recent_blocked_domains: [],
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-container-low rounded w-32" />
          <div className="h-6 bg-surface-container-low rounded w-20" />
        </div>
      </div>
    );
  }

  const level = data?.level ?? 'standard';
  const style = LEVEL_STYLES[level];
  const blockedToday = data?.blocked_today ?? 0;
  const flaggedToday = data?.flagged_today ?? 0;
  const recentDomains = data?.recent_blocked_domains ?? [];

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-bold text-on-surface">Content Filter</h3>
        <Link
          href="/dashboard/content-filter"
          className="text-xs text-primary font-label font-medium hover:underline"
        >
          Manage
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold ${style.className}`}
        >
          {style.label}
        </span>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant font-label">
          <span>
            <strong className="text-on-surface">{blockedToday}</strong> blocked
          </span>
          <span>
            <strong className="text-on-surface">{flaggedToday}</strong> flagged
          </span>
        </div>
      </div>

      {recentDomains.length > 0 && (
        <div>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mb-1.5">
            Recently blocked
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recentDomains.slice(0, 3).map((domain) => (
              <span
                key={domain}
                className="inline-flex px-2 py-0.5 rounded-lg bg-error/5 text-error text-[11px] font-label font-medium"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
