'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeenSummary {
  id: string;
  name: string;
  screen_time_today_minutes: number;
  alerts_today: number;
  focus_score_7d: number;
  filter_level: 'off' | 'standard' | 'strict' | 'custom';
  status: 'active' | 'paused' | 'pending';
}

const FILTER_LABELS: Record<string, string> = {
  off: 'Off',
  standard: 'Standard',
  strict: 'Strict',
  custom: 'Custom',
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-primary-container text-primary' },
  paused: { label: 'Paused', className: 'bg-tertiary-container text-on-tertiary-container' },
  pending: { label: 'Pending', className: 'bg-surface-container-low text-on-surface-variant' },
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function GuardianPage() {
  const [teens, setTeens] = useState<TeenSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/guardian/teens')
      .then((r) => r.json())
      .then((d) => setTeens(d.teens ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded w-64" />
          <div className="h-40 bg-surface-container-low rounded-3xl" />
          <div className="h-40 bg-surface-container-low rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">
            Guardian Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant font-body">
            Monitor and support your teens&apos; digital wellness.
          </p>
        </div>
        <Link
          href="/dashboard/partner"
          className="px-4 py-2 bg-primary text-on-primary text-sm font-label font-medium rounded-2xl hover:opacity-90 transition-opacity"
        >
          Invite Teen
        </Link>
      </div>

      {teens.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
          <div className="text-4xl mb-4">{'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67'}</div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
            No teens connected yet
          </h3>
          <p className="text-sm text-on-surface-variant font-body mb-4 max-w-md mx-auto">
            Invite your teen to Be Candid to help them align their screen time with who they want to be \u2014 with care and transparency.
          </p>
          <Link
            href="/dashboard/partner"
            className="inline-flex px-6 py-2.5 bg-primary text-on-primary text-sm font-label font-medium rounded-2xl hover:opacity-90 transition-opacity"
          >
            Send Invite
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {teens.map((teen) => {
            const status = STATUS_STYLES[teen.status] ?? STATUS_STYLES.active;
            const isExpanded = expandedId === teen.id;

            return (
              <div
                key={teen.id}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : teen.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface-container-low/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="font-headline font-bold text-primary text-sm">
                      {teen.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-on-surface text-base">
                        {teen.name}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant font-label mt-0.5">
                      <span>{formatMinutes(teen.screen_time_today_minutes)} today</span>
                      <span>{teen.alerts_today} alerts</span>
                      <span>{teen.focus_score_7d}% focus</span>
                    </div>
                  </div>
                  <span className="text-on-surface-variant text-sm">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-outline-variant/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
                        <div className="text-lg font-headline font-bold text-on-surface">
                          {formatMinutes(teen.screen_time_today_minutes)}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
                          Screen Time
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
                        <div
                          className={`text-lg font-headline font-bold ${
                            teen.alerts_today > 0 ? 'text-error' : 'text-on-surface'
                          }`}
                        >
                          {teen.alerts_today}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
                          Alerts Today
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
                        <div className="text-lg font-headline font-bold text-primary">
                          {teen.focus_score_7d}%
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
                          Focus (7d)
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-3 py-3 text-center">
                        <div className="text-lg font-headline font-bold text-on-surface">
                          {FILTER_LABELS[teen.filter_level]}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5">
                          Filter
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
