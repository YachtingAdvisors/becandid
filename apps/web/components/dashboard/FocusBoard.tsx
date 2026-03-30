'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────
interface HeatmapDay {
  date: string;
  morning: 'focused' | 'distracted' | 'pending';
  evening: 'focused' | 'distracted' | 'pending';
}

interface PointAction {
  action: string;
  points: number;
  note: string;
  created_at: string;
}

interface Milestone {
  milestone: string;
  unlocked_at: string;
}

interface StatsData {
  balance: number;
  streak: { streakDays: number; streakSegments: number };
  heatmap: HeatmapDay[];
  recentActions: PointAction[];
  milestones: Milestone[];
}

// ─── Constants ────────────────────────────────────────────────
const MILESTONE_LABELS: Record<string, { label: string; icon: string }> = {
  focused_segments_10:  { label: '10 Focused Segments',   icon: 'eco' },
  focused_segments_25:  { label: '25 Focused Segments',   icon: 'park' },
  focused_segments_50:  { label: '50 Focused Segments',   icon: 'forest' },
  focused_segments_100: { label: '100 Focused Segments',  icon: 'landscape' },
  full_days_7:          { label: '7 Full Focused Days',    icon: 'star' },
  full_days_14:         { label: '14 Full Focused Days',   icon: 'star_rate' },
  full_days_30:         { label: '30 Full Focused Days',   icon: 'auto_awesome' },
  full_days_60:         { label: '60 Full Focused Days',   icon: 'local_fire_department' },
  full_days_90:         { label: '90 Full Focused Days',   icon: 'crown' },
  points_100:           { label: '100 Trust Points',       icon: 'center_focus_strong' },
  points_500:           { label: '500 Trust Points',       icon: 'diamond' },
  points_1000:          { label: '1,000 Trust Points',     icon: 'emoji_events' },
  points_5000:          { label: '5,000 Trust Points',     icon: 'pets' },
  conversations_5:      { label: '5 Conversations',        icon: 'forum' },
  conversations_10:     { label: '10 Conversations',       icon: 'handshake' },
  conversations_25:     { label: '25 Conversations',       icon: 'favorite' },
  streak_7:             { label: '7-Day Streak',           icon: 'local_fire_department' },
  streak_30:            { label: '30-Day Streak',          icon: 'bolt' },
  streak_90:            { label: '90-Day Streak',          icon: 'military_tech' },
};

const ACTION_LABELS: Record<string, string> = {
  focused_morning:       'Focused Morning',
  focused_evening:       'Focused Evening',
  focused_full_day:      'Full Focused Day',
  check_in_completed:    'Check-in',
  conversation_done:     'Conversation Completed',
  conversation_positive: 'Positive Conversation',
  milestone_reached:     'Milestone Unlocked',
  partner_encouraged:    'Partner Encouragement',
  streak_bonus_7:        '7-Day Streak Bonus',
  streak_bonus_30:       '30-Day Streak Bonus',
  streak_bonus_90:       '90-Day Streak Bonus',
};

// ─── Helpers ──────────────────────────────────────────────────
function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────

export default function FocusBoard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch('/api/trust-points/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card p-6 text-center text-ink-muted">
        Unable to load focus data.
      </div>
    );
  }

  const { balance, streak, heatmap, recentActions, milestones } = stats;

  // Count today's status
  const today = heatmap[heatmap.length - 1];
  const todayFocusedCount = today
    ? [today.morning, today.evening].filter(s => s === 'focused').length
    : 0;

  // Week summaries for the 3-week view
  const weeks = [
    heatmap.slice(0, 7),
    heatmap.slice(7, 14),
    heatmap.slice(14, 21),
  ];

  return (
    <div className="space-y-5">
      {/* ─── Top Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Trust Points */}
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-brand-600">
            {balance.toLocaleString()}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">Trust Points</div>
        </div>

        {/* Focus Streak */}
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-emerald-600">
            {streak.streakDays}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">
            Day Streak
          </div>
        </div>

        {/* Today */}
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold">
            {today?.morning === 'pending' && today?.evening === 'pending'
              ? '—'
              : todayFocusedCount === 2
                ? <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                : todayFocusedCount === 1
                  ? <span className="material-symbols-outlined text-amber-500">bolt</span>
                  : <span className="material-symbols-outlined text-red-500">warning</span>}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">
            {today?.morning === 'pending' && today?.evening === 'pending'
              ? 'Day Starting'
              : todayFocusedCount === 2
                ? 'Fully Focused'
                : todayFocusedCount === 1
                  ? 'Partially Focused'
                  : 'Distracted'}
          </div>
        </div>
      </div>

      {/* ─── 21-Day Heatmap ────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-ink">
            3-Week Focus Map
          </h3>
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Focused
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Distracted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Pending
            </span>
          </div>
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className={wi > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}>
            <div className="text-xs text-ink-muted mb-1.5 font-medium">
              Week {wi + 1}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day) => (
                <div key={day.date} className="text-center">
                  <div className="text-[10px] text-ink-muted mb-1">
                    {getDayLabel(day.date)}
                  </div>
                  {/* Morning cell */}
                  <div
                    className={`h-5 rounded-t-md ${
                      day.morning === 'focused'
                        ? 'bg-emerald-400'
                        : day.morning === 'distracted'
                          ? 'bg-red-400'
                          : 'bg-gray-200'
                    }`}
                    title={`${formatDateShort(day.date)} AM: ${day.morning}`}
                  />
                  {/* Evening cell */}
                  <div
                    className={`h-5 rounded-b-md mt-0.5 ${
                      day.evening === 'focused'
                        ? 'bg-emerald-400'
                        : day.evening === 'distracted'
                          ? 'bg-red-400'
                          : 'bg-gray-200'
                    }`}
                    title={`${formatDateShort(day.date)} PM: ${day.evening}`}
                  />
                  <div className="text-[9px] text-ink-muted mt-0.5">
                    {formatDateShort(day.date).split(' ')[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Row labels */}
        <div className="flex items-center gap-4 mt-2 text-[10px] text-ink-muted">
          <span>Top row = Morning (5AM–5PM)</span>
          <span>Bottom row = Evening (5PM–5AM)</span>
        </div>
      </div>

      {/* ─── Milestones ────────────────────────────────────── */}
      {milestones.length > 0 && (
        <div className="card p-4">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">
            Milestones Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m) => {
              const info = MILESTONE_LABELS[m.milestone] || { label: m.milestone, icon: 'military_tech' };
              return (
                <div
                  key={m.milestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800"
                  title={`Unlocked ${new Date(m.unlocked_at).toLocaleDateString()}`}
                >
                  <span className="material-symbols-outlined text-base">{info.icon}</span>
                  <span>{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Points History ────────────────────────────────── */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
        >
          <span>Recent Points Activity</span>
          <span className="material-symbols-outlined text-ink-muted text-lg">{showHistory ? 'expand_less' : 'expand_more'}</span>
        </button>

        {showHistory && (
          <div className="border-t border-gray-100 divide-y divide-gray-50">
            {recentActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="text-sm text-ink">
                    {ACTION_LABELS[action.action] || action.action}
                  </div>
                  {action.note && (
                    <div className="text-xs text-ink-muted">{action.note}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    action.points > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {action.points > 0 ? '+' : ''}{action.points}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {timeAgo(action.created_at)}
                  </span>
                </div>
              </div>
            ))}

            {recentActions.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-ink-muted">
                No points activity yet. Stay focused to start earning!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
