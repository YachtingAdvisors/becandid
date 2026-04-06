'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface CronInfo {
  last_run: string | null;
  result: string | null;
  users_processed: number | null;
}

interface HealthData {
  db_connected: boolean;
  recent_errors: number;
  cron_status: Record<string, CronInfo>;
  table_sizes: Record<string, number>;
  cost_estimate: { daily: number; monthly: number };
  uptime_since: string | null;
}

// ─── Main Component ──────────────────────────────────────────

export default function AdminHealthClient() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/health')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load health data');
        return r.json();
      })
      .then(setHealth)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton-shimmer h-64 rounded-3xl" />
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="bg-error/10 rounded-3xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-error mb-2 block">
          error
        </span>
        <p className="text-sm text-error font-body">
          {error || 'Failed to load health data'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          icon="storage"
          label="Database"
          value={health.db_connected ? 'Connected' : 'Error'}
          ok={health.db_connected}
        />
        <StatusCard
          icon="error_outline"
          label="Errors (24h)"
          value={health.recent_errors.toString()}
          ok={health.recent_errors === 0}
        />
        <StatusCard
          icon="payments"
          label="Est. Cost Today"
          value={`$${health.cost_estimate.daily.toFixed(2)}`}
          ok={true}
          sub={`~$${health.cost_estimate.monthly.toFixed(2)}/mo`}
        />
        <StatusCard
          icon="schedule"
          label="Last Deploy"
          value={
            health.uptime_since
              ? formatRelative(health.uptime_since)
              : 'Unknown'
          }
          ok={true}
        />
      </div>

      {/* Cron jobs status */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
        <h2 className="font-headline text-base font-bold text-on-surface mb-4">
          Cron Job Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(health.cron_status).map(([name, info]) => (
            <CronCard key={name} name={name} info={info} />
          ))}
        </div>
      </div>

      {/* Table sizes */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
        <h2 className="font-headline text-base font-bold text-on-surface mb-4">
          Database Table Sizes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(health.table_sizes).map(([table, count]) => (
            <div
              key={table}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-container"
            >
              <span className="text-sm font-label text-on-surface-variant">
                {formatTableName(table)}
              </span>
              <span className="font-headline text-sm font-bold text-on-surface">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function StatusCard({
  icon,
  label,
  value,
  ok,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  ok: boolean;
  sub?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            ok ? 'bg-green-500' : 'bg-error'
          }`}
        />
        <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`font-headline text-xl font-extrabold ${
          ok ? 'text-on-surface' : 'text-error'
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-on-surface-variant font-body">{sub}</p>
      )}
    </div>
  );
}

function CronCard({ name, info }: { name: string; info: CronInfo }) {
  const isStale = isCronStale(name, info.last_run);
  const ok = info.last_run !== null && !isStale && info.result !== 'fail';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            ok ? 'bg-green-500' : info.last_run === null ? 'bg-outline-variant' : 'bg-error'
          }`}
        />
        <div>
          <p className="text-sm font-label font-medium text-on-surface capitalize">
            {name.replace(/-/g, ' ')}
          </p>
          <p className="text-xs text-on-surface-variant font-label">
            {info.last_run ? formatRelative(info.last_run) : 'Never run'}
            {info.users_processed !== null &&
              ` · ${info.users_processed} users`}
          </p>
        </div>
      </div>
      <span
        className={`text-xs font-label font-semibold px-2 py-0.5 rounded-full ${
          ok
            ? 'bg-green-500/10 text-green-700'
            : info.last_run === null
            ? 'bg-outline-variant/20 text-on-surface-variant'
            : 'bg-error/10 text-error'
        }`}
      >
        {info.last_run === null
          ? 'No data'
          : isStale
          ? 'Stale'
          : info.result === 'fail'
          ? 'Failed'
          : 'OK'}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isCronStale(name: string, lastRun: string | null): boolean {
  if (!lastRun) return false;
  const age = Date.now() - new Date(lastRun).getTime();
  // Most crons run daily; consider stale after 26 hours
  const thresholdMs = 26 * 60 * 60 * 1000;
  return age > thresholdMs;
}

function formatTableName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
