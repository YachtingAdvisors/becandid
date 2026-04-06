'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface ActivityEntry {
  id: string;
  type: 'signup' | 'plan_change' | 'partner_invite' | 'therapist_connection';
  description: string;
  created_at: string;
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      }),
      fetch('/api/admin/activity?limit=8')
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((d) => d.items || []),
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
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
      <div className="bg-error/10 rounded-3xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-error mb-2 block">error</span>
        <p className="text-sm text-error font-body">{error || 'Failed to load stats'}</p>
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
    <div className="space-y-6">
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

      {/* Quick Actions: Announcement */}
      <AnnouncementCard />

      {/* Recent Activity + System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold text-on-surface">Recent Activity</h2>
            <Link
              href="/admin/activity"
              className="text-xs font-label font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-on-surface-variant font-body">No recent activity.</p>
          ) : (
            <div className="space-y-2.5">
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-base text-on-surface-variant mt-0.5">
                    {activityIcon(entry.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-on-surface truncate">{entry.description}</p>
                    <p className="text-xs text-on-surface-variant font-label">
                      {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
          <h2 className="font-headline text-base font-bold text-on-surface">System Health</h2>
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}

function activityIcon(type: string): string {
  switch (type) {
    case 'signup': return 'person_add';
    case 'plan_change': return 'credit_card';
    case 'partner_invite': return 'mail';
    case 'therapist_connection': return 'health_and_safety';
    default: return 'circle';
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SystemHealth() {
  const [health, setHealth] = useState<{
    db_connected: boolean;
    recent_errors: number;
    last_cron_runs: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/health')
      .then((r) => (r.ok ? r.json() : null))
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  if (!health) {
    return <div className="skeleton-shimmer h-24 rounded-2xl" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-on-surface-variant">storage</span>
          <span className="text-sm font-label text-on-surface-variant">Database</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-label font-semibold ${health.db_connected ? 'text-green-600' : 'text-error'}`}>
          <span className={`w-2 h-2 rounded-full ${health.db_connected ? 'bg-green-500' : 'bg-error'}`} />
          {health.db_connected ? 'Connected' : 'Error'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-on-surface-variant">error_outline</span>
          <span className="text-sm font-label text-on-surface-variant">Errors (24h)</span>
        </div>
        <span className={`font-headline text-sm font-bold ${health.recent_errors > 0 ? 'text-error' : 'text-on-surface'}`}>
          {health.recent_errors}
        </span>
      </div>
      {Object.entries(health.last_cron_runs).map(([name, lastRun]) => (
        <div key={name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-on-surface-variant">schedule</span>
            <span className="text-sm font-label text-on-surface-variant capitalize">{name.replace(/-/g, ' ')}</span>
          </div>
          <span className="text-xs font-label text-on-surface-variant">
            {lastRun ? formatRelativeTime(lastRun) : 'Never'}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnnouncementCard() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const send = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }
      const data = await res.json();
      setResult(data);
      setSubject('');
      setMessage('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
      <h2 className="font-headline text-base font-bold text-on-surface">Send Announcement</h2>
      <input
        type="text"
        placeholder="Subject..."
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-body text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30"
        maxLength={200}
      />
      <textarea
        placeholder="Message to all users..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-body text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        maxLength={5000}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={send}
          disabled={sending || !subject.trim() || !message.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-label font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          {sending ? 'Sending...' : 'Send to All Users'}
        </button>
        {result && (
          <span className="text-xs font-label text-green-600">
            Sent to {result.sent} users{result.failed > 0 ? ` (${result.failed} failed)` : ''}
          </span>
        )}
        {error && <span className="text-xs font-label text-error">{error}</span>}
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
