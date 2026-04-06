'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface ActivityEntry {
  id: string;
  type: 'signup' | 'plan_change' | 'partner_invite' | 'therapist_connection';
  description: string;
  created_at: string;
  user_id?: string;
}

type FilterType = '' | 'signup' | 'plan_change' | 'partner_invite' | 'therapist_connection';

// ─── Main Component ──────────────────────────────────────────

export default function AdminActivityClient() {
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (filter) params.set('type', filter);

    fetch(`/api/admin/activity?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const filterOptions: { value: FilterType; label: string; icon: string }[] = [
    { value: '', label: 'All', icon: 'list' },
    { value: 'signup', label: 'Signups', icon: 'person_add' },
    { value: 'plan_change', label: 'Plan Changes', icon: 'credit_card' },
    { value: 'partner_invite', label: 'Partner Invites', icon: 'mail' },
    { value: 'therapist_connection', label: 'Therapist', icon: 'health_and_safety' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-label font-medium transition-colors ${
              filter === opt.value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant divide-y divide-outline-variant">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-14" />
          ))
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">
              inbox
            </span>
            <p className="text-sm font-body text-on-surface-variant">No activity found.</p>
          </div>
        ) : (
          items.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-container/30 transition-colors"
            >
              <span
                className={`material-symbols-outlined text-lg mt-0.5 ${typeColor(entry.type)}`}
              >
                {typeIcon(entry.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-on-surface">{entry.description}</p>
                <p className="text-xs font-label text-on-surface-variant mt-0.5">
                  {formatTimestamp(entry.created_at)}
                </p>
              </div>
              <span
                className={`self-center px-2 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-wider ${typeBadge(entry.type)}`}
              >
                {entry.type.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function typeIcon(type: string): string {
  switch (type) {
    case 'signup': return 'person_add';
    case 'plan_change': return 'credit_card';
    case 'partner_invite': return 'mail';
    case 'therapist_connection': return 'health_and_safety';
    default: return 'circle';
  }
}

function typeColor(type: string): string {
  switch (type) {
    case 'signup': return 'text-green-600';
    case 'plan_change': return 'text-primary';
    case 'partner_invite': return 'text-tertiary';
    case 'therapist_connection': return 'text-secondary';
    default: return 'text-on-surface-variant';
  }
}

function typeBadge(type: string): string {
  switch (type) {
    case 'signup': return 'bg-green-100 text-green-700';
    case 'plan_change': return 'bg-primary/10 text-primary';
    case 'partner_invite': return 'bg-tertiary/10 text-tertiary';
    case 'therapist_connection': return 'bg-secondary/10 text-secondary';
    default: return 'bg-surface-container text-on-surface-variant';
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
