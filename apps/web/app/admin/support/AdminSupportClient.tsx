'use client';

import { FormEvent, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface SupportUser {
  profile: Record<string, unknown>;
  partners: Array<{
    id: string;
    partner_name: string;
    partner_email: string;
    status: string;
    created_at: string;
  }>;
  therapist_connections: Array<{ id: string; created_at: string }>;
  journal_count: number;
  event_count: number;
  recent_events: Array<{
    id: string;
    category: string;
    severity: string;
    description: string;
    created_at: string;
  }>;
  streak: { current: number; longest: number };
  milestones: Array<{ milestone: string; created_at: string }>;
  audit_log: Array<{
    id: string;
    action: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
  login_count: number;
  account_age_days: number;
  last_active: string | null;
  subscription_timeline: Array<{
    action: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
}

// ─── Main Component ──────────────────────────────────────────

export default function AdminSupportClient() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<SupportUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setData(null);
    setActionMessage('');

    try {
      const res = await fetch(
        `/api/admin/support?email=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(body.error || `Error ${res.status}`);
      }
      setData(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to look up user');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string, label: string) {
    if (!data) return;
    const userId = data.profile.id as string;

    setActionLoading(action);
    setActionMessage('');

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_id: userId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Action failed');
      setActionMessage(`${label} completed successfully.`);

      // Refresh user data
      const refreshRes = await fetch(
        `/api/admin/support?email=${encodeURIComponent(email.trim())}`
      );
      if (refreshRes.ok) setData(await refreshRes.json());
    } catch (err: unknown) {
      setActionMessage(
        `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setActionLoading('');
    }
  }

  const p = data?.profile as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      {/* Search box */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="pulse-sheen px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-label font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors motion-reduce:transition-none"
        >
          {loading ? 'Searching...' : 'Look Up'}
        </button>
      </form>

      {error && (
        <div className="bg-error/10 rounded-2xl p-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-lg">
            error
          </span>
          <p className="text-sm text-error font-body">{error}</p>
        </div>
      )}

      {actionMessage && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-2 ${
            actionMessage.startsWith('Failed')
              ? 'bg-error/10'
              : 'bg-green-500/10'
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              actionMessage.startsWith('Failed')
                ? 'text-error'
                : 'text-green-600'
            }`}
          >
            {actionMessage.startsWith('Failed')
              ? 'error'
              : 'check_circle'}
          </span>
          <p
            className={`text-sm font-body ${
              actionMessage.startsWith('Failed')
                ? 'text-error'
                : 'text-green-700'
            }`}
          >
            {actionMessage}
          </p>
        </div>
      )}

      {data && p && (
        <div className="space-y-5">
          {/* User profile card */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-headline text-xl font-extrabold text-on-surface">
                  {(p.name as string) || 'Unnamed User'}
                </h2>
                <p className="text-sm text-on-surface-variant font-body">
                  {p.email as string}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-label font-semibold ${
                  statusColor(p.subscription_status as string)
                }`}
              >
                {(p.subscription_status as string) || 'active'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <InfoItem
                label="Account Age"
                value={`${data.account_age_days} days`}
              />
              <InfoItem
                label="Last Active"
                value={
                  data.last_active
                    ? formatDate(data.last_active)
                    : 'Never'
                }
              />
              <InfoItem
                label="Login Count"
                value={data.login_count.toLocaleString()}
              />
              <InfoItem
                label="Plan"
                value={
                  (p.subscription_plan as string) ||
                  (p.subscription_status as string) ||
                  'free'
                }
              />
              <InfoItem
                label="Current Streak"
                value={`${data.streak.current} days`}
              />
              <InfoItem
                label="Longest Streak"
                value={`${data.streak.longest} days`}
              />
              <InfoItem
                label="Trial Ends"
                value={
                  p.trial_ends_at
                    ? formatDate(p.trial_ends_at as string)
                    : 'N/A'
                }
              />
              <InfoItem
                label="Created"
                value={formatDate(p.created_at as string)}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
            <h3 className="font-headline text-base font-bold text-on-surface mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                icon="event_repeat"
                label="Extend Trial 30d"
                loading={actionLoading === 'extend_trial'}
                onClick={() =>
                  handleAction('extend_trial', 'Extend Trial 30 days')
                }
              />
              <ActionButton
                icon="upgrade"
                label="Upgrade to Pro"
                loading={actionLoading === 'upgrade_to_pro'}
                onClick={() =>
                  handleAction('upgrade_to_pro', 'Upgrade to Pro')
                }
              />
              <ActionButton
                icon="lock_reset"
                label="Reset Password"
                loading={actionLoading === 'reset_password'}
                onClick={() =>
                  handleAction('reset_password', 'Reset Password')
                }
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat
              icon="edit_note"
              label="Journals"
              value={data.journal_count}
            />
            <MiniStat
              icon="flag"
              label="Events"
              value={data.event_count}
            />
            <MiniStat
              icon="handshake"
              label="Partners"
              value={data.partners.length}
            />
            <MiniStat
              icon="health_and_safety"
              label="Therapists"
              value={data.therapist_connections.length}
            />
          </div>

          {/* Two columns: Recent events + Activity log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recent events */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Recent Events (Last 10)
              </h3>
              {data.recent_events.length === 0 ? (
                <p className="text-sm text-on-surface-variant font-body">
                  No events recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.recent_events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          ev.severity === 'high'
                            ? 'bg-error'
                            : ev.severity === 'medium'
                            ? 'bg-tertiary'
                            : 'bg-outline-variant'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-on-surface font-body truncate">
                          {ev.category}
                          {ev.description ? `: ${ev.description}` : ''}
                        </p>
                        <p className="text-xs text-on-surface-variant font-label">
                          {formatDate(ev.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit log */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Activity Log (Last 10)
              </h3>
              {data.audit_log.length === 0 ? (
                <p className="text-sm text-on-surface-variant font-body">
                  No audit entries.
                </p>
              ) : (
                <div className="space-y-2">
                  {data.audit_log.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-base text-on-surface-variant mt-0.5">
                        history
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-on-surface font-body font-medium">
                          {entry.action}
                        </p>
                        <p className="text-xs text-on-surface-variant font-label">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Partners */}
          {data.partners.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Partner Connections
              </h3>
              <div className="space-y-2">
                {data.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-on-surface font-body font-medium">
                        {partner.partner_name || partner.partner_email}
                      </span>
                      <span className="text-on-surface-variant font-body ml-2">
                        {partner.partner_email}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-label font-semibold ${
                        partner.status === 'active'
                          ? 'bg-green-500/10 text-green-700'
                          : 'bg-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {partner.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {data.milestones.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Milestones
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.milestones.map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-label font-semibold bg-primary/10 text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">
                      emoji_events
                    </span>
                    {m.milestone}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subscription timeline */}
          {data.subscription_timeline.length > 0 && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Subscription Timeline
              </h3>
              <div className="space-y-3">
                {data.subscription_timeline.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                      {i < data.subscription_timeline.length - 1 && (
                        <span className="w-px h-6 bg-outline-variant" />
                      )}
                    </div>
                    <div className="text-sm pb-2">
                      <p className="text-on-surface font-body font-medium">
                        {entry.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-on-surface-variant font-label">
                        {formatDate(entry.created_at)}
                      </p>
                      {entry.metadata &&
                        Object.keys(entry.metadata).length > 0 && (
                          <p className="text-xs text-on-surface-variant font-label mt-0.5 truncate max-w-sm">
                            {JSON.stringify(entry.metadata)}
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: string | null): string {
  switch (status) {
    case 'pro':
    case 'active':
      return 'bg-primary/10 text-primary';
    case 'trialing':
      return 'bg-tertiary/10 text-tertiary';
    case 'therapy':
      return 'bg-secondary/10 text-secondary';
    default:
      return 'bg-outline-variant/20 text-on-surface-variant';
  }
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-body font-medium text-on-surface">{value}</p>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="material-symbols-outlined text-base">{icon}</span>
        <span className="text-xs font-label font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-headline text-xl font-extrabold text-on-surface">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  loading,
  onClick,
}: {
  icon: string;
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm font-label font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {loading ? 'Processing...' : label}
    </button>
  );
}
