'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ── Types ───────────────────────────────────────────────── */

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  max_members: number;
}

interface Member {
  id: string;
  display_name: string;
  role: string;
  joined_at: string;
}

interface Checkin {
  id: string;
  display_name: string;
  mood: number;
  message: string | null;
  created_at: string;
  is_mine: boolean;
}

/* ── Helpers ─────────────────────────────────────────────── */

const MOOD_EMOJI: Record<number, string> = {
  1: '\u{1F629}', // weary
  2: '\u{1F615}', // confused
  3: '\u{1F610}', // neutral
  4: '\u{1F60A}', // happy
  5: '\u{1F31F}', // star
};

const MOOD_LABEL: Record<number, string> = {
  1: 'Struggling',
  2: 'Tough day',
  3: 'Holding steady',
  4: 'Good day',
  5: 'Thriving',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
}

/* ── Page ────────────────────────────────────────────────── */

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [focusBoard, setFocusBoard] = useState<Record<string, Record<string, string>>>({});
  const [myMembership, setMyMembership] = useState<{ display_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check-in form
  const [mood, setMood] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Invite code copy
  const [copied, setCopied] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) return;
      const data = await res.json();
      setGroup(data.group);
      setMembers(data.members);
      setCheckins(data.checkins);
      setFocusBoard(data.focus_board);
      setMyMembership(data.my_membership);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  async function handleCheckin() {
    if (mood === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, message: message.trim() || undefined }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMood(0);
        setMessage('');
        fetchGroup(); // Refresh data
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch {
      // silently fail
    }
    setSubmitting(false);
  }

  function copyInviteCode() {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-surface-container-low rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-container-lowest rounded-3xl border border-outline-variant animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">error_outline</span>
        <h2 className="text-lg font-semibold text-on-surface mb-2">Group not found</h2>
        <Link href="/dashboard/groups" className="text-sm text-primary hover:underline">Back to groups</Link>
      </div>
    );
  }

  const last7Days = getLast7Days();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/dashboard/groups" className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface mb-4 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        All Groups
      </Link>

      {/* Quote */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
        <p className="text-xs text-on-surface-variant italic font-body text-center">
          &ldquo;Though one may be overpowered, two can defend themselves.
          A cord of three strands is not quickly broken.&rdquo; &mdash; Ecclesiastes 4:12
        </p>
      </div>

      {/* Group Header */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-on-surface-variant mt-1">{group.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span>
                {members.length} / {group.max_members} members
              </span>
              {myMembership && (
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">person</span>
                  You are {myMembership.display_name}
                </span>
              )}
            </div>
          </div>

          {/* Invite Code */}
          <button onClick={copyInviteCode}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary/30 transition-colors group">
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant font-medium">Invite code</p>
              <p className="text-sm font-mono font-semibold text-on-surface tracking-wider">{group.invite_code}</p>
            </div>
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary transition-colors">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Anonymized Focus Board */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
        <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">grid_view</span>
          Focus Board
          <span className="text-[10px] text-on-surface-variant font-normal ml-1">Last 7 days</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-on-surface-variant font-medium pb-2 pr-4 w-28">Member</th>
                {last7Days.map((day) => (
                  <th key={day} className="text-center text-[10px] text-on-surface-variant font-medium pb-2 px-1 w-10">
                    {formatDayLabel(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(focusBoard).map(([name, days]) => (
                <tr key={name}>
                  <td className="text-xs text-on-surface font-medium py-1.5 pr-4">{name}</td>
                  {last7Days.map((day) => {
                    const status = days[day];
                    let cellClass = 'bg-surface-container-low'; // no data
                    if (status === 'focused' || status === 'clean') cellClass = 'bg-emerald-400';
                    else if (status === 'distracted' || status === 'flagged') cellClass = 'bg-red-400';
                    else if (status === 'partial') cellClass = 'bg-amber-400';

                    return (
                      <td key={day} className="py-1.5 px-1">
                        <div className={`w-8 h-8 rounded-lg ${cellClass} mx-auto transition-colors`}
                          title={`${name} - ${day}: ${status || 'no data'}`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Object.keys(focusBoard).length === 0 && (
          <p className="text-xs text-on-surface-variant text-center py-4">No focus data yet. Members will appear here as they track their days.</p>
        )}

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 rounded bg-emerald-400" /> Focused
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 rounded bg-amber-400" /> Partial
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 rounded bg-red-400" /> Distracted
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <div className="w-3 h-3 rounded bg-surface-container-low" /> No data
          </div>
        </div>
      </div>

      {/* Group Check-in */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mb-6">
        <h2 className="text-sm font-semibold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">favorite</span>
          How are you doing today?
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">Your check-in is shared anonymously with the group.</p>

        {submitted ? (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <p className="text-sm text-emerald-700 font-medium">Check-in submitted. Thank you for showing up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mood selector */}
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m} onClick={() => setMood(m)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    mood === m
                      ? 'border-primary bg-primary/5 scale-105 shadow-sm'
                      : 'border-outline-variant hover:border-primary/30 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="text-2xl">{MOOD_EMOJI[m]}</span>
                  <span className="text-[10px] text-on-surface-variant font-medium">{MOOD_LABEL[m]}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a word of encouragement or how you're feeling... (optional)"
              rows={2} maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />

            <button onClick={handleCheckin} disabled={mood === 0 || submitting}
              className="w-full py-2.5 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {submitting ? 'Submitting...' : 'Check In'}
            </button>
          </div>
        )}
      </div>

      {/* Recent Check-ins Feed */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
        <h2 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">forum</span>
          Recent Check-ins
        </h2>

        {checkins.length > 0 ? (
          <div className="space-y-3">
            {checkins.map((c) => (
              <div key={c.id} className={`p-4 rounded-xl border transition-colors ${
                c.is_mine
                  ? 'border-primary/20 bg-primary/[0.03]'
                  : 'border-outline-variant/50 bg-surface-container-low/30'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{MOOD_EMOJI[c.mood] || ''}</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {c.display_name}
                      {c.is_mine && <span className="text-on-surface-variant font-normal"> (you)</span>}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{timeAgo(c.created_at)}</span>
                </div>
                {c.message && (
                  <p className="text-sm text-on-surface-variant leading-relaxed pl-7">{c.message}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant text-center py-6">
            No check-ins yet. Be the first to share how you&apos;re doing.
          </p>
        )}
      </div>
    </div>
  );
}
