'use client';

import { useCallback, useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

type DateRange = '' | '24h' | '7d' | '30d';

// ─── Main Component ──────────────────────────────────────────

export default function AdminAuditClient() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [actionFilter, setActionFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('');
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (actionFilter) params.set('action', actionFilter);
    if (dateRange) params.set('range', dateRange);

    try {
      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error('Failed to load audit log');
      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
      if (data.action_types) setActionTypes(data.action_types);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, dateRange]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Action type filter */}
        <div className="space-y-1">
          <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
            Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="block w-48 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">All actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="space-y-1">
          <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
            Date Range
          </label>
          <div className="flex gap-1">
            {(['', '24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r || 'all'}
                onClick={() => {
                  setDateRange(r);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-sm font-label font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Count badge */}
        <div className="ml-auto text-sm text-on-surface-variant font-label">
          {total.toLocaleString()} entries
        </div>
      </div>

      {error && (
        <div className="bg-error/10 rounded-2xl p-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-lg">
            error
          </span>
          <p className="text-sm text-error font-body">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-10 rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">
              search_off
            </span>
            <p className="text-sm text-on-surface-variant font-body">
              No audit log entries found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="text-left px-4 py-3 font-label font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 font-label font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 font-label font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 font-label font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const metaPreview = truncateJson(entry.metadata, 60);
                  const hasDetail =
                    Object.keys(entry.metadata).length > 0;

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-outline-variant/50 hover:bg-surface-container/50 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id)
                      }
                    >
                      <td className="px-4 py-3 text-on-surface-variant font-label whitespace-nowrap">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-on-surface font-body">
                        {entry.user_email || (
                          <span className="text-on-surface-variant">
                            {entry.user_id
                              ? entry.user_id.slice(0, 8) + '...'
                              : 'system'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-label font-semibold bg-surface-container text-on-surface">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant font-body">
                        {isExpanded && hasDetail ? (
                          <pre className="text-xs bg-surface-container rounded-lg p-3 overflow-x-auto max-w-lg whitespace-pre-wrap break-all">
                            {JSON.stringify(entry.metadata, null, 2)}
                          </pre>
                        ) : (
                          <span className="truncate block max-w-xs">
                            {metaPreview}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant font-label">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateJson(
  obj: Record<string, unknown>,
  maxLen: number
): string {
  if (Object.keys(obj).length === 0) return '-';
  const str = JSON.stringify(obj);
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
