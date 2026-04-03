'use client';

import { useEffect, useState } from 'react';

interface Stats {
  total_users: number;
  active_users_7d: number;
  new_users_7d: number;
  subscriptions: { free: number; trialing: number; pro: number; therapy: number };
  mrr: number;
  total_journal_entries: number;
  total_events: number;
  total_conversations: number;
  active_partners: number;
  avg_streak: number;
  avg_mood_30d: number;
  journal_entries_7d: number;
  conversations_7d: number;
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Admin Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-error/10 rounded-3xl p-6 text-center">
          <span className="material-symbols-outlined text-3xl text-error mb-2 block">error</span>
          <p className="text-sm text-error font-body">{error || 'Failed to load stats'}</p>
        </div>
      </div>
    );
  }

  const totalSub = stats.subscriptions.free + stats.subscriptions.trialing + stats.subscriptions.pro + stats.subscriptions.therapy;
  const barSegments = [
    { label: 'Free', count: stats.subscriptions.free, color: 'bg-outline-variant' },
    { label: 'Trial', count: stats.subscriptions.trialing, color: 'bg-tertiary' },
    { label: 'Pro', count: stats.subscriptions.pro, color: 'bg-primary' },
    { label: 'Therapy', count: stats.subscriptions.therapy, color: 'bg-secondary' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Admin Dashboard
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-semibold bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
          Admin
        </span>
      </div>

      {/* Top stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="group"
          label="Total Users"
          value={stats.total_users.toLocaleString()}
        />
        <StatCard
          icon="trending_up"
          label="Active (7d)"
          value={stats.active_users_7d.toLocaleString()}
          sub={`${totalSub > 0 ? Math.round((stats.active_users_7d / totalSub) * 100) : 0}% of total`}
        />
        <StatCard
          icon="attach_money"
          label="MRR"
          value={`$${stats.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          icon="local_fire_department"
          label="Avg Streak"
          value={`${stats.avg_streak} days`}
        />
      </div>

      {/* Three cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subscription breakdown */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">Subscriptions</h2>

          {/* Horizontal bar */}
          <div className="flex h-3 rounded-full overflow-hidden bg-surface-container">
            {barSegments.map((seg) => (
              <div
                key={seg.label}
                className={`${seg.color} transition-all duration-500`}
                style={{ width: totalSub > 0 ? `${(seg.count / totalSub) * 100}%` : '0%' }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {barSegments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                <span className="text-xs font-label text-on-surface-variant">
                  {seg.label}: <span className="font-semibold text-on-surface">{seg.count.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth metrics */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">Growth (7d)</h2>
          <div className="space-y-3">
            <GrowthRow icon="person_add" label="New Users" value={stats.new_users_7d} />
            <GrowthRow icon="edit_note" label="Journal Entries" value={stats.journal_entries_7d} />
            <GrowthRow icon="forum" label="Conversations" value={stats.conversations_7d} />
          </div>
        </div>

        {/* User health */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">User Health</h2>
          <div className="space-y-3">
            <GrowthRow
              icon="mood"
              label="Avg Mood (30d)"
              value={stats.avg_mood_30d}
              suffix="/10"
            />
            <GrowthRow icon="flag" label="Total Events" value={stats.total_events} />
            <GrowthRow icon="handshake" label="Active Partners" value={stats.active_partners} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-2">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="text-xs font-label font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-headline text-2xl font-extrabold text-on-surface">{value}</p>
      {sub && (
        <p className="text-xs text-on-surface-variant font-body">{sub}</p>
      )}
    </div>
  );
}

function GrowthRow({
  icon,
  label,
  value,
  suffix,
}: {
  icon: string;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-on-surface-variant">{icon}</span>
        <span className="text-sm font-label text-on-surface-variant">{label}</span>
      </div>
      <span className="font-headline text-lg font-bold text-on-surface">
        {value.toLocaleString()}{suffix || ''}
      </span>
    </div>
  );
}
