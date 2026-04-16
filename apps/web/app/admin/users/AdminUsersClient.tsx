'use client';

import { useCallback, useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string;
  goals: string[] | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  monitoring_enabled: boolean;
  created_at: string;
  last_active_at: string | null;
  trial_ends_at: string | null;
}

interface UserDetail {
  profile: Record<string, unknown>;
  partners: Array<{ id: string; partner_name: string; partner_email: string; status: string }>;
  therapist_count: number;
  journal_count: number;
  journal_count_7d: number;
  event_count: number;
  event_count_7d: number;
  trust_points: number;
  milestones: Array<{ milestone: string; created_at: string }>;
  recent_events: Array<{ id: string; category: string; severity: string; created_at: string }>;
  recent_journals: Array<{ id: string; created_at: string }>;
}

type PlanFilter = 'all' | 'free' | 'trialing' | 'pro' | 'therapy';
type SortField = 'name' | 'email' | 'subscription_plan' | 'last_active_at' | 'created_at';

// ─── Main Component ──────────────────────────────────────────

export default function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, planFilter]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: sortField,
      order: sortOrder,
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (planFilter !== 'all') params.set('plan', planFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, planFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch user detail when expanding
  const toggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setUserDetail(null);
      return;
    }

    setExpandedUserId(userId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch detail');
      const data = await res.json();
      setUserDetail(data);
    } catch {
      setUserDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Admin actions
  const adminAction = async (userId: string, update: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchUsers();
      // Refresh detail
      if (expandedUserId === userId) {
        const detailRes = await fetch(`/api/admin/users/${userId}`);
        if (detailRes.ok) setUserDetail(await detailRes.json());
      }
    } catch {
      // Silently fail — could add toast here
    } finally {
      setActionLoading(false);
    }
  };

  // CSV export
  const exportCSV = async () => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10000',
      sort: sortField,
      order: sortOrder,
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (planFilter !== 'all') params.set('plan', planFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    const rows: UserRow[] = data.users;

    const headers = ['Name', 'Email', 'Plan', 'Status', 'Goals', 'Last Active', 'Joined'];
    const csvRows = [
      headers.join(','),
      ...rows.map((u) =>
        [
          csvEscape(u.name),
          csvEscape(u.email),
          csvEscape(u.subscription_plan || 'free'),
          csvEscape(u.subscription_status || 'active'),

          csvEscape((u.goals || []).join('; ')),
          u.last_active_at || '',
          u.created_at,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `becandid-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalPages = Math.ceil(total / limit);
  const showFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const showTo = Math.min(page * limit, total);

  const planPills: { value: PlanFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'trialing', label: 'Trialing' },
    { value: 'pro', label: 'Pro' },
    { value: 'therapy', label: 'Therapy' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm w-full">
          <span className="material-symbols-outlined text-lg text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-body text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Count badge */}
          <span className="text-xs font-label text-on-surface-variant whitespace-nowrap">
            {total > 0 ? `Showing ${showFrom}-${showTo} of ${total} users` : 'No users'}
          </span>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-label font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            CSV
          </button>
        </div>
      </div>

      {/* Plan filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {planPills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setPlanFilter(pill.value)}
            className={`px-3 py-1 rounded-full text-xs font-label font-medium transition-colors ${
              planFilter === pill.value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 border-b border-outline-variant last:border-b-0" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  {([
                    ['name', 'Name'],
                    ['email', 'Email'],
                    ['subscription_plan', 'Plan'],

                    ['last_active_at', 'Last Active'],
                    ['created_at', 'Joined'],
                  ] as [SortField, string][]).map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="px-4 py-3 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-on-surface select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {sortField === field && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface-variant font-body">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <UserTableRow
                      key={u.id}
                      user={u}
                      isExpanded={expandedUserId === u.id}
                      detail={expandedUserId === u.id ? userDetail : null}
                      detailLoading={expandedUserId === u.id && detailLoading}
                      actionLoading={actionLoading}
                      onToggle={() => toggleExpand(u.id)}
                      onAction={(update) => adminAction(u.id, update)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <span className="text-sm font-label text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── User Table Row ──────────────────────────────────────────

function UserTableRow({
  user,
  isExpanded,
  detail,
  detailLoading,
  actionLoading,
  onToggle,
  onAction,
}: {
  user: UserRow;
  isExpanded: boolean;
  detail: UserDetail | null;
  detailLoading: boolean;
  actionLoading: boolean;
  onToggle: () => void;
  onAction: (update: Record<string, unknown>) => void;
}) {
  const plan = user.subscription_plan || 'free';
  const planColor = planBadgeColor(plan);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-outline-variant cursor-pointer transition-colors ${
          isExpanded ? 'bg-primary/5' : 'hover:bg-surface-container/40'
        }`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span className="text-sm font-body font-medium text-on-surface">{user.name || 'Unknown'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm font-body text-on-surface-variant">{user.email}</td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-label font-semibold ${planColor}`}>
            {plan}
          </span>
        </td>
        <td className="px-4 py-3 text-xs font-label text-on-surface-variant">
          {user.last_active_at ? formatDate(user.last_active_at) : 'Never'}
        </td>
        <td className="px-4 py-3 text-xs font-label text-on-surface-variant">
          {formatDate(user.created_at)}
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className="bg-primary/5 border-b border-outline-variant">
          <td colSpan={6} className="px-4 py-4">
            {detailLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-shimmer h-20 rounded-2xl" />
                ))}
              </div>
            ) : detail ? (
              <UserDetailPanel
                user={user}
                detail={detail}
                actionLoading={actionLoading}
                onAction={onAction}
              />
            ) : (
              <p className="text-sm text-error font-body">Failed to load details.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── User Detail Panel ───────────────────────────────────────

function UserDetailPanel({
  user,
  detail,
  actionLoading,
  onAction,
}: {
  user: UserRow;
  detail: UserDetail;
  actionLoading: boolean;
  onAction: (update: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Partners" value={detail.partners.length} icon="handshake" />
        <MiniStat label="Therapists" value={detail.therapist_count} icon="health_and_safety" />
        <MiniStat
          label="Journals"
          value={detail.journal_count}
          sub={`${detail.journal_count_7d} this week`}
          icon="edit_note"
        />
        <MiniStat
          label="Events"
          value={detail.event_count}
          sub={`${detail.event_count_7d} this week`}
          icon="flag"
        />
        <MiniStat label="Reputation Points" value={detail.trust_points} icon="verified" />
        <MiniStat label="Milestones" value={detail.milestones.length} icon="emoji_events" />
        <MiniStat label="Monitoring" value={user.monitoring_enabled ? 'On' : 'Off'} icon="visibility" />
        <MiniStat
          label="Trial Ends"
          value={user.trial_ends_at ? formatDate(user.trial_ends_at) : 'N/A'}
          icon="schedule"
        />
      </div>

      {/* Partners list */}
      {detail.partners.length > 0 && (
        <div>
          <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Partners
          </h4>
          <div className="flex flex-wrap gap-2">
            {detail.partners.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label bg-surface-container text-on-surface-variant"
              >
                {p.partner_name || p.partner_email}
                <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-outline-variant'}`} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detail.recent_events.length > 0 && (
          <div>
            <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Recent Events
            </h4>
            <div className="space-y-1.5">
              {detail.recent_events.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-xs">
                  <span className="font-body text-on-surface">{e.category} ({e.severity})</span>
                  <span className="font-label text-on-surface-variant">{formatDate(e.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {detail.recent_journals.length > 0 && (
          <div>
            <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Recent Journals
            </h4>
            <div className="space-y-1.5">
              {detail.recent_journals.map((j) => (
                <div key={j.id} className="text-xs font-label text-on-surface-variant">
                  {formatDate(j.created_at)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant">
        <ActionButton
          label="Extend Trial (7d)"
          icon="schedule"
          disabled={actionLoading}
          onClick={() => {
            const current = user.trial_ends_at ? new Date(user.trial_ends_at) : new Date();
            const extended = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
            onAction({ trial_ends_at: extended.toISOString(), subscription_status: 'trialing' });
          }}
        />
        <ActionButton
          label="Set Pro"
          icon="star"
          disabled={actionLoading}
          onClick={() => onAction({ subscription_plan: 'pro', subscription_status: 'active', trial_ends_at: null })}
        />
        <ActionButton
          label="Set Free"
          icon="money_off"
          disabled={actionLoading}
          onClick={() => onAction({ subscription_plan: 'free', subscription_status: 'active', trial_ends_at: null })}
        />
        <ActionButton
          label={user.monitoring_enabled ? 'Disable Monitoring' : 'Enable Monitoring'}
          icon={user.monitoring_enabled ? 'visibility_off' : 'visibility'}
          disabled={actionLoading}
          onClick={() => onAction({ monitoring_enabled: !user.monitoring_enabled })}
        />
      </div>
    </div>
  );
}

// ─── Small Components ────────────────────────────────────────

function MiniStat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="bg-surface-container/60 rounded-2xl p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span className="text-xs font-label font-medium">{label}</span>
      </div>
      <p className="font-headline text-lg font-bold text-on-surface">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-on-surface-variant font-body">{sub}</p>}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-label font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function planBadgeColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pro':
    case 'active':
      return 'bg-primary/15 text-primary';
    case 'trialing':
      return 'bg-tertiary/15 text-tertiary';
    case 'therapy':
      return 'bg-secondary/15 text-secondary';
    default:
      return 'bg-surface-container text-on-surface-variant';
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
