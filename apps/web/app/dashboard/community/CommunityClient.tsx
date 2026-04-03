'use client';

import { useState, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────── */

interface Post {
  id: string;
  anonymous_name: string;
  content: string;
  post_type: string;
  hearts: number;
  hearted: boolean;
  created_at: string;
}

type PostType = 'win' | 'milestone' | 'encouragement' | 'gratitude';

const POST_TYPES: { value: PostType; label: string; icon: string }[] = [
  { value: 'win', label: 'Win', icon: 'emoji_events' },
  { value: 'milestone', label: 'Milestone', icon: 'flag' },
  { value: 'encouragement', label: 'Encouragement', icon: 'volunteer_activism' },
  { value: 'gratitude', label: 'Gratitude', icon: 'favorite' },
];

const TYPE_COLORS: Record<string, string> = {
  win: 'bg-emerald-100 text-emerald-700',
  milestone: 'bg-amber-100 text-amber-700',
  encouragement: 'bg-sky-100 text-[#226779]',
  gratitude: 'bg-rose-100 text-rose-700',
};

const TYPE_LABELS: Record<string, string> = {
  win: 'Win',
  milestone: 'Milestone',
  encouragement: 'Encouragement',
  gratitude: 'Gratitude',
};

/* ─── Helpers ───────────────────────────────────────────── */

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/* ─── Component ─────────────────────────────────────────── */

export default function CommunityClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('win');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [heartingIds, setHeartingIds] = useState<Set<string>>(new Set());

  /* ── Create post ─────────────────────────────────────── */

  async function handlePost() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), post_type: postType }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPosts((prev) => [data.post, ...prev]);
        setContent('');
        setPostType('win');
      }
    } catch {
      setError('Failed to share. Please try again.');
    }
    setSubmitting(false);
  }

  /* ── Toggle heart ────────────────────────────────────── */

  const handleHeart = useCallback(async (postId: string) => {
    if (heartingIds.has(postId)) return;
    setHeartingIds((prev) => new Set(prev).add(postId));

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, hearted: !p.hearted, hearts: p.hearted ? p.hearts - 1 : p.hearts + 1 }
          : p,
      ),
    );

    try {
      const res = await fetch('/api/community/heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (data.error) {
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, hearted: !p.hearted, hearts: p.hearted ? p.hearts - 1 : p.hearts + 1 }
              : p,
          ),
        );
      } else {
        // Sync server count
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, hearted: data.hearted, hearts: data.hearts } : p,
          ),
        );
      }
    } catch {
      // Revert on network error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hearted: !p.hearted, hearts: p.hearted ? p.hearts - 1 : p.hearts + 1 }
            : p,
        ),
      );
    }

    setHeartingIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  }, [heartingIds]);

  /* ── Refresh feed ────────────────────────────────────── */

  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch { /* ignore */ }
    setRefreshing(false);
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            groups
          </span>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Community</h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Anonymous wins and encouragement from fellow travelers.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-label font-semibold bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-sm ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Post Composer */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-base text-primary">edit</span>
          <span className="text-sm font-semibold text-on-surface">Share something with the community</span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 280))}
          placeholder="A win, a milestone, a word of encouragement..."
          rows={3}
          maxLength={280}
          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-on-surface-variant/60"
        />

        <div className="flex items-center justify-between mt-3">
          {/* Post type pills */}
          <div className="flex flex-wrap gap-1.5">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setPostType(t.value)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-label font-medium transition-all ${
                  postType === t.value
                    ? TYPE_COLORS[t.value]
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-body tabular-nums ${content.length >= 260 ? 'text-red-500' : 'text-on-surface-variant'}`}>
              {content.length}/280
            </span>
            <button
              onClick={handlePost}
              disabled={!content.trim() || submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-label font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              {submitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Feed */}
      {posts.length > 0 ? (
        <div className="space-y-3 stagger">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 transition-all hover:border-primary/20"
            >
              {/* Top row: name + badge + time */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {post.anonymous_name.split(' ').map((w) => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-on-surface">{post.anonymous_name}</span>
                    <span className="text-xs text-on-surface-variant ml-2">{timeAgo(post.created_at)}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label font-medium ${TYPE_COLORS[post.post_type] || TYPE_COLORS.win}`}>
                  {TYPE_LABELS[post.post_type] || 'Win'}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-on-surface font-body leading-relaxed pl-10 mb-3">
                {post.content}
              </p>

              {/* Heart button */}
              <div className="pl-10">
                <button
                  onClick={() => handleHeart(post.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-110 ${
                    post.hearted
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-rose-50 hover:text-rose-500'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm transition-transform ${post.hearted ? 'scale-110' : ''}`}
                    style={{ fontVariationSettings: post.hearted ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  {post.hearts > 0 && <span className="tabular-nums">{post.hearts}</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">forum</span>
          </div>
          <h2 className="text-lg font-headline font-semibold text-on-surface mb-2">
            Be the First to Share
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed font-body">
            This is a safe, anonymous space to celebrate wins, share milestones, and encourage each other.
            Your name is hidden &mdash; only your anonymous alias is shown.
          </p>
        </div>
      )}
    </div>
  );
}
