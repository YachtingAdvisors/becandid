'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GuardianData {
  teen_name: string;
  account_status: 'active' | 'paused' | 'pending';
  screen_time_today_minutes: number;
  alerts_today: number;
  focus_score_7d: number;
  filter_level: 'off' | 'standard' | 'strict' | 'custom';
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-primary-container text-primary' },
  paused: { label: 'Paused', className: 'bg-tertiary-container text-on-tertiary-container' },
  pending: { label: 'Pending Setup', className: 'bg-surface-container-low text-on-surface-variant' },
};

const FILTER_LABELS: Record<string, string> = {
  off: 'Off',
  standard: 'Standard',
  strict: 'Strict',
  custom: 'Custom',
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function GuardianOverview() {
  const [data, setData] = useState<GuardianData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/guardian/overview')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-surface-container-low rounded w-40" />
          <div className="h-16 bg-surface-container-low rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const status = STATUS_STYLES[data.account_status] ?? STATUS_STYLES.active;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-base font-bold text-on-surface">
            {data.teen_name}
          </h3>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold mt-1 ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <Link
          href="/guardian"
          className="text-xs text-primary font-label font-medium hover:underline"
        >
          View Full Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
          <div className="text-lg font-headline font-bold text-on-surface">
            {formatMinutes(data.screen_time_today_minutes)}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
            Screen Time
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
          <div
            className={`text-lg font-headline font-bold ${data.alerts_today > 0 ? 'text-error' : 'text-on-surface'}`}
          >
            {data.alerts_today}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
            Alerts Today
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
          <div className="text-lg font-headline font-bold text-primary">
            {data.focus_score_7d}%
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
            Focus (7d)
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
          <div className="text-lg font-headline font-bold text-on-surface">
            {FILTER_LABELS[data.filter_level]}
          </div>
          <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
            Filter
          </div>
        </div>
      </div>
    </div>
  );
}
