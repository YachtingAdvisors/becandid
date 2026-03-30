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

const STATUS_STYLES: Record<string, { label: string; icon: string; className: string }> = {
  active: { label: 'Active', icon: 'check_circle', className: 'bg-primary-container text-primary' },
  paused: { label: 'Paused', icon: 'pause_circle', className: 'bg-tertiary-container text-on-tertiary-container' },
  pending: { label: 'Pending', icon: 'schedule', className: 'bg-surface-container-low text-on-surface-variant' },
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
      <div className="max-w-5xl mx-auto space-y-6 px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded-2xl w-64" />
          <div className="h-40 bg-surface-container-low rounded-[2rem]" />
          <div className="h-40 bg-surface-container-low rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Guardian Dashboard
            </h1>
            <p className="text-sm text-on-surface-variant font-body mt-1">
              Monitor and support your teens&apos; digital wellness.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/partner"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-label font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite Teen
        </Link>
      </div>

      {teens.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[2rem] p-12 text-center shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]">
          <span className="material-symbols-outlined text-[48px] text-primary/40 mb-4 block">
            family_restroom
          </span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            No teens connected yet
          </h3>
          <p className="text-sm text-on-surface-variant font-body mb-6 max-w-md mx-auto leading-relaxed">
            Invite your teen to Be Candid to help them align their screen time
            with who they want to be &mdash; with care and transparency.
          </p>
          <Link
            href="/dashboard/partner"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm font-label font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
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
                className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : teen.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-surface-container-low/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="font-headline font-bold text-primary text-sm">
                      {teen.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-headline font-bold text-on-surface text-base">
                        {teen.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${status.className}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {status.icon}
                        </span>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant font-label mt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatMinutes(teen.screen_time_today_minutes)} today
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {teen.alerts_today} alerts
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">target</span>
                        {teen.focus_score_7d}% focus
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-outline-variant/30">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
                        <span className="material-symbols-outlined text-primary text-[20px] mb-1 block">
                          schedule
                        </span>
                        <div className="text-lg font-headline font-bold text-on-surface">
                          {formatMinutes(teen.screen_time_today_minutes)}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5 uppercase tracking-wider">
                          Screen Time
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
                        <span className="material-symbols-outlined text-primary text-[20px] mb-1 block">
                          notifications
                        </span>
                        <div
                          className={`text-lg font-headline font-bold ${
                            teen.alerts_today > 0 ? 'text-error' : 'text-on-surface'
                          }`}
                        >
                          {teen.alerts_today}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5 uppercase tracking-wider">
                          Alerts Today
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
                        <span className="material-symbols-outlined text-primary text-[20px] mb-1 block">
                          target
                        </span>
                        <div className="text-lg font-headline font-bold text-primary">
                          {teen.focus_score_7d}%
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5 uppercase tracking-wider">
                          Focus (7d)
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
                        <span className="material-symbols-outlined text-primary text-[20px] mb-1 block">
                          filter_alt
                        </span>
                        <div className="text-lg font-headline font-bold text-on-surface">
                          {FILTER_LABELS[teen.filter_level]}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-label mt-0.5 uppercase tracking-wider">
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
