'use client';

import { useCallback, useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────

interface Post {
  id: string;
  anonymous_name: string;
  content: string;
  post_type: string;
  hearts: number;
  created_at: string;
  flagged: boolean;
}

// ── Component ───────────────────────────────────────────────

export default function ModerationClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged'>('flagged');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/admin/moderation?filter=${filter}&limit=100`,
      );
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(data.items || []);
      setTotal(data.total || 0);
      setSelected(new Set());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleAction = async (action: 'approve' | 'hide' | 'delete', postIds: string[]) => {
    if (postIds.length === 0) return;

    const confirmMsg =
      action === 'delete'
        ? `Delete ${postIds.length} post(s)? This cannot be undone.`
        : action === 'hide'
          ? `Hide ${postIds.length} post(s)?`
          : `Approve ${postIds.length} post(s)?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, post_ids: postIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }
      await fetchPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
    }
  };

  const selectedIds = Array.from(selected);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-20 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header controls ────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-headline text-base font-bold text-on-surface">
            Community Posts
          </h2>
          <span className="text-xs font-label text-on-surface-variant">
            {total} total
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <div className="flex gap-1 bg-surface-container rounded-full p-0.5">
            {(['flagged', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-label font-medium rounded-full transition-colors capitalize ${
                  filter === f
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-label text-on-surface-variant">
                {selectedIds.length} selected
              </span>
              <BulkButton
                label="Approve"
                icon="check_circle"
                color="text-green-600"
                disabled={actionLoading}
                onClick={() => handleAction('approve', selectedIds)}
              />
              <BulkButton
                label="Hide"
                icon="visibility_off"
                color="text-tertiary"
                disabled={actionLoading}
                onClick={() => handleAction('hide', selectedIds)}
              />
              <BulkButton
                label="Delete"
                icon="delete"
                color="text-error"
                disabled={actionLoading}
                onClick={() => handleAction('delete', selectedIds)}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 rounded-2xl p-3 text-sm text-error font-body">
          {error}
        </div>
      )}

      {/* ── Post list ──────────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
            verified
          </span>
          <p className="text-sm text-on-surface-variant font-body">
            {filter === 'flagged'
              ? 'No flagged posts. The community is looking good.'
              : 'No community posts yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-5 py-2">
            <input
              type="checkbox"
              checked={selected.size === posts.length && posts.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-outline-variant accent-primary"
            />
            <span className="text-xs font-label text-on-surface-variant">
              Select all
            </span>
          </div>

          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-surface-container-lowest rounded-3xl border p-5 flex items-start gap-4 transition-colors ${
                post.flagged
                  ? 'border-error/30'
                  : 'border-outline-variant'
              } ${selected.has(post.id) ? 'ring-2 ring-primary/20' : ''}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(post.id)}
                onChange={() => toggleSelect(post.id)}
                className="w-4 h-4 rounded border-outline-variant accent-primary mt-1 flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-label font-semibold text-on-surface">
                    {post.anonymous_name}
                  </span>
                  <PostTypeBadge type={post.post_type} />
                  {post.flagged && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-label font-semibold bg-error/10 text-error">
                      <span className="material-symbols-outlined text-xs">
                        flag
                      </span>
                      Flagged
                    </span>
                  )}
                </div>

                <p className="text-sm font-body text-on-surface leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-3 text-xs text-on-surface-variant font-label">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      favorite
                    </span>
                    {post.hearts}
                  </span>
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
              </div>

              {/* Per-post actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <ActionButton
                  icon="check_circle"
                  label="Approve"
                  color="hover:text-green-600"
                  disabled={actionLoading}
                  onClick={() => handleAction('approve', [post.id])}
                />
                <ActionButton
                  icon="visibility_off"
                  label="Hide"
                  color="hover:text-tertiary"
                  disabled={actionLoading}
                  onClick={() => handleAction('hide', [post.id])}
                />
                <ActionButton
                  icon="delete"
                  label="Delete"
                  color="hover:text-error"
                  disabled={actionLoading}
                  onClick={() => handleAction('delete', [post.id])}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function PostTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    win: 'bg-green-500/10 text-green-700',
    milestone: 'bg-primary/10 text-primary',
    encouragement: 'bg-secondary/10 text-secondary',
    gratitude: 'bg-tertiary/10 text-tertiary',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-label font-semibold capitalize ${
        styles[type] || 'bg-surface-container text-on-surface-variant'
      }`}
    >
      {type}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  color,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-xl text-on-surface-variant transition-colors ${color} hover:bg-surface-container disabled:opacity-40`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  );
}

function BulkButton({
  label,
  icon,
  color,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-label font-medium ${color} hover:bg-surface-container transition-colors disabled:opacity-40`}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
