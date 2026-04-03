'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────

interface Member {
  display_name: string;
  role: string;
  is_me: boolean;
}

interface CheckIn {
  id: string;
  display_name: string;
  is_mine: boolean;
  mood: number;
  message: string | null;
  created_at: string;
}

interface GroupDetail {
  group: {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    max_members: number;
    created_at: string;
  };
  my_role: string;
  my_membership: { display_name: string; role: string };
  members: Member[];
  checkins: CheckIn[];
  focus_board: Record<string, Record<string, string>>;
}

// ── Constants ──────────────────────────────────────────────

const MOODS = [
  { v: 1, emoji: '\uD83D\uDE1E', label: 'Struggling' },
  { v: 2, emoji: '\uD83D\uDE15', label: 'Tough day' },
  { v: 3, emoji: '\uD83D\uDE10', label: 'Holding on' },
  { v: 4, emoji: '\uD83D\uDE42', label: 'Good' },
  { v: 5, emoji: '\uD83D\uDCAA', label: 'Strong' },
];

const MOOD_EMOJI: Record<number, string> = {
  1: '\uD83D\uDE1E', 2: '\uD83D\uDE15', 3: '\uD83D\uDE10', 4: '\uD83D\uDE42', 5: '\uD83D\uDCAA',
};

// ── Helpers ────────────────────────────────────────────────

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yest';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ── Component ──────────────────────────────────────────────

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [data, setData] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check-in form
  const [mood, setMood] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Copy invite code
  const [copied, setCopied] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError('You are not a member of this group.');
          return;
        }
        throw new Error('Failed to load group');
      }
      const json = await res.json();
      setData(json);
      setError('');
    } catch {
      setError('Could not load group data.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) return;
    setSubmitting(true);
    setSubmitSuccess(false);
    setError('');
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, message: message.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Check-in failed');
      }
      const d = await res.json();
      // Optimistically add to feed
      if (data && d.checkin) {
        const myName = data.my_membership.display_name;
        setData({
          ...data,
          checkins: [
            {
              id: d.checkin.id,
              display_name: myName,
              is_mine: true,
              mood: d.checkin.mood,
              message: message.trim() || null,
              created_at: d.checkin.created_at,
            },
            ...data.checkins,
          ],
        });
      }
      setMood(null);
      setMessage('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyInviteCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = data.group.invite_code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // ── Loading state ────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
          <div className="h-6 w-48 bg-surface-container animate-pulse rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-container-lowest rounded-3xl border border-outline-variant animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state (no data) ────────────────────────────────

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <span className="material-symbols-outlined text-4xl text-error mb-3 block">error</span>
        <p className="text-on-surface font-medium mb-2">{error || 'Group not found'}</p>
        <button
          onClick={() => router.push('/dashboard/groups')}
          className="text-sm text-primary hover:underline"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const { group, members, checkins, focus_board, my_membership } = data;
  const last7Days = getLast7Days();
  const myDisplayName = my_membership.display_name;

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      {/* Back nav + Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/groups')}
          className="inline-flex items-center gap-1 text-xs font-label text-on-surface-variant hover:text-primary transition-colors mb-3"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          All Groups
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/50 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
            </div>
            <div>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                {group.name}
              </h1>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-on-surface-variant font-label">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">people</span>
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
                <span className="text-on-surface-variant/40">|</span>
                <span>You are {myDisplayName}</span>
              </div>
            </div>
          </div>

          {/* Invite code — copyable */}
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant text-xs font-mono tracking-wider text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex-shrink-0"
            title="Copy invite code"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied!' : group.invite_code}
          </button>
        </div>

        {group.description && (
          <p className="text-sm text-on-surface-variant font-body mt-2 ml-[60px]">
            {group.description}
          </p>
        )}
      </div>

      <div className="stagger">
        {/* ── Anonymized Focus Board ────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              grid_view
            </span>
            <h2 className="font-headline text-sm font-bold text-on-surface">Focus Board</h2>
            <span className="text-[10px] text-on-surface-variant font-label ml-auto">Last 7 days</span>
          </div>

          {/* 7-day grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(7, 1fr)` }}>
            {/* Day labels header */}
            <div /> {/* spacer for name column */}
            {last7Days.map((day) => (
              <div key={day} className="text-center text-[10px] font-label text-on-surface-variant pb-1">
                {getDayLabel(day)}
              </div>
            ))}

            {/* Member rows */}
            {members.map((member) => {
              const memberBoard = focus_board[member.display_name] || {};
              return (
                <div key={member.display_name} className="contents">
                  <div className="flex items-center text-xs font-label text-on-surface truncate pr-2 h-8">
                    <span className={member.is_me ? 'font-semibold text-primary' : ''}>
                      {member.display_name}
                      {member.is_me && <span className="text-[9px] ml-1 opacity-60">(you)</span>}
                    </span>
                  </div>
                  {last7Days.map((day) => {
                    const status = memberBoard[day];
                    const isGreen = status === 'green';
                    const isRed = status === 'red';
                    return (
                      <div
                        key={day}
                        className={`h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isRed
                            ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40'
                            : isGreen
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-surface-container border border-outline-variant/50'
                        }`}
                      >
                        {isGreen && (
                          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs">check</span>
                        )}
                        {isRed && (
                          <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-xs">close</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-on-surface-variant/60 mt-3 font-body">
            Focus data is anonymized. Green = focused, Red = flagged, Gray = no data.
          </p>
        </div>

        {/* ── Group Check-in Form ───────────────────────────── */}
        <form
          onSubmit={handleCheckin}
          className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_reaction
            </span>
            <h2 className="font-headline text-sm font-bold text-on-surface">Check In</h2>
          </div>

          {/* Mood selector */}
          <div className="mb-4">
            <p className="text-xs font-label text-on-surface-variant mb-2">How are you doing?</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setMood(m.v)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${
                    mood === m.v
                      ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20 scale-105'
                      : 'border-outline-variant hover:border-primary/30 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-label text-on-surface-variant">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a thought, prayer request, or encouragement... (optional)"
              maxLength={1000}
              rows={3}
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-body"
            />
            <div className="flex justify-between mt-1">
              <p className="text-[10px] text-on-surface-variant/50 font-label">
                Messages are encrypted
              </p>
              <p className="text-[10px] text-on-surface-variant/50 font-label">
                {message.length}/1000
              </p>
            </div>
          </div>

          {/* Submit row */}
          <div className="flex items-center justify-between">
            {submitSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-label flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Check-in submitted!
              </span>
            )}
            {error && !submitSuccess && (
              <span className="text-xs text-error font-label">{error}</span>
            )}
            {!submitSuccess && !error && <span />}
            <button
              type="submit"
              disabled={!mood || submitting}
              className="px-5 py-2 bg-primary text-on-primary rounded-full font-label font-medium text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {submitting ? 'Sending...' : 'Submit Check-in'}
            </button>
          </div>
        </form>

        {/* ── Check-in Feed ─────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                forum
              </span>
              <h2 className="font-headline text-sm font-bold text-on-surface">Recent Check-ins</h2>
            </div>
            <button
              onClick={() => { setLoading(true); fetchGroup().finally(() => setLoading(false)); }}
              className="inline-flex items-center gap-1 text-xs font-label text-on-surface-variant hover:text-primary transition-colors"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>

          {checkins.length === 0 ? (
            <div className="text-center py-8">
              <span
                className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat_bubble
              </span>
              <p className="text-sm text-on-surface-variant font-body">
                No check-ins yet. Be the first to share how you are doing!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkins.map((ci) => (
                <div
                  key={ci.id}
                  className={`rounded-2xl p-4 transition-colors ${
                    ci.is_mine
                      ? 'bg-primary-container/20 border border-primary/10'
                      : 'bg-surface-container border border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{MOOD_EMOJI[ci.mood] || ''}</span>
                      <span className={`text-sm font-label font-semibold ${
                        ci.is_mine ? 'text-primary' : 'text-on-surface'
                      }`}>
                        {ci.display_name}
                        {ci.is_mine && <span className="text-[10px] font-normal ml-1 opacity-60">(you)</span>}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-label">
                      {relativeTime(ci.created_at)}
                    </span>
                  </div>
                  {ci.message && (
                    <p className="text-sm text-on-surface/90 font-body leading-relaxed pl-8">
                      {ci.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Members List ──────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              people
            </span>
            <h2 className="font-headline text-sm font-bold text-on-surface">Members</h2>
            <span className="text-[10px] text-on-surface-variant font-label ml-auto">
              {members.length}/{group.max_members}
            </span>
          </div>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.display_name}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    m.is_me
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    {m.display_name.replace('Member ', '')}
                  </div>
                  <span className={`text-sm font-label ${m.is_me ? 'font-semibold text-primary' : 'text-on-surface'}`}>
                    {m.display_name}
                    {m.is_me && <span className="text-[10px] font-normal ml-1 opacity-60">(you)</span>}
                  </span>
                </div>
                {m.role === 'admin' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
