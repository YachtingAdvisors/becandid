'use client';

import { useState, useEffect, useCallback } from 'react';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';

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

interface DayEvent {
  id: string;
  category: string;
  severity: string;
  app_name?: string;
  platform: string;
  timestamp: string;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FocusBoard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const todayStr = getTodayStr();

  useEffect(() => {
    fetch('/api/trust-points/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDayClick = useCallback(async (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      return;
    }

    setSelectedDate(date);
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/events?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.events ?? []).filter((e: DayEvent) =>
          e.timestamp.startsWith(date)
        );
        setDayEvents(filtered);
      }
    } catch {
      setDayEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-8">
        <div className="h-6 skeleton-shimmer rounded w-48 mb-4" />
        <div className="h-32 skeleton-shimmer rounded" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 text-center text-on-surface-variant">
        Unable to load focus data.
      </div>
    );
  }

  const { balance, streak, heatmap, recentActions, milestones } = stats;

  // Show a welcome callout when the board is brand new (no streak yet)
  const isBrandNew = streak === 0 && heatmap.every((d: any) => d.morning === 'focused' && d.evening === 'focused');

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
      {/* ─── Brand-new user callout ───────────────────────── */}
      {isBrandNew && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 text-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2 block">local_fire_department</span>
          <h3 className="font-headline text-base font-bold text-on-surface mb-1">Your focus board starts today</h3>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
            Each day has two halves &mdash; morning and evening. Stay focused through both to build your streak.
          </p>
        </div>
      )}

      {/* ─── Top Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Trust Points */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-primary">
            {balance.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">Trust Points</div>
        </div>

        {/* Focus Streak */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-emerald-600">
            {streak.streakDays}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">
            Day Streak
          </div>
        </div>

        {/* Today */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold">
            {today?.morning === 'pending' && today?.evening === 'pending'
              ? '—'
              : todayFocusedCount === 2
                ? <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                : todayFocusedCount === 1
                  ? <span className="material-symbols-outlined text-amber-500">bolt</span>
                  : <span className="material-symbols-outlined text-red-500">warning</span>}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">
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
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline text-sm font-semibold text-on-surface">
            3-Week Focus Map
          </h3>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Focused
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Distracted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-surface-container inline-block" /> Pending
            </span>
          </div>
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className={wi > 0 ? 'mt-3 pt-3 border-t border-outline-variant/10' : ''}>
            <div className="text-xs text-on-surface-variant mb-1.5 font-medium">
              Week {wi + 1}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day, di) => {
                const cellIndex = wi * 7 + di;
                const isSelected = selectedDate === day.date;
                const isToday = day.date === todayStr;
                const isHovered = hoveredDay === day.date;
                const isMilestoneBoundary = cellIndex === 6 || cellIndex === 13;
                return (
                  <div key={day.date} className="text-center relative"
                    style={{ animation: `fade-up 0.3s ease-out ${cellIndex * 30}ms both` }}>
                    <div className="text-[10px] text-on-surface-variant mb-1">
                      {getDayLabel(day.date)}
                    </div>
                    <button
                      onClick={() => handleDayClick(day.date)}
                      onMouseEnter={() => setHoveredDay(day.date)}
                      onMouseLeave={() => setHoveredDay(null)}
                      aria-label={`${formatDateShort(day.date)} — Morning: ${day.morning}, Evening: ${day.evening}`}
                      className={`w-full cursor-pointer transition-all duration-200 rounded-md ${
                        isToday ? 'animate-focus-pulse' : ''
                      } ${
                        isSelected ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'hover:scale-105 hover:ring-1 hover:ring-primary/30'
                      }`}
                    >
                      {/* Morning cell */}
                      <div
                        className={`h-5 rounded-t-md transition-colors duration-300 ${
                          day.morning === 'focused'
                            ? 'bg-emerald-400'
                            : day.morning === 'distracted'
                              ? 'bg-red-400'
                              : 'bg-surface-container'
                        }`}
                      />
                      {/* Evening cell */}
                      <div
                        className={`h-5 rounded-b-md mt-0.5 transition-colors duration-300 ${
                          day.evening === 'focused'
                            ? 'bg-emerald-400'
                            : day.evening === 'distracted'
                              ? 'bg-red-400'
                              : 'bg-surface-container'
                        }`}
                      />
                    </button>
                    <div className="text-[9px] text-on-surface-variant mt-0.5">
                      {formatDateShort(day.date).split(' ')[1]}
                    </div>
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-on-surface text-surface-container-lowest text-[10px] font-label whitespace-nowrap shadow-lg pointer-events-none animate-fade-in">
                        <div className="font-semibold mb-0.5">{formatDateShort(day.date)}</div>
                        <div>AM: <span className={day.morning === 'focused' ? 'text-emerald-300' : day.morning === 'distracted' ? 'text-red-300' : 'text-gray-400'}>{day.morning}</span></div>
                        <div>PM: <span className={day.evening === 'focused' ? 'text-emerald-300' : day.evening === 'distracted' ? 'text-red-300' : 'text-gray-400'}>{day.evening}</span></div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-on-surface" />
                      </div>
                    )}
                    {/* Streak milestone marker */}
                    {isMilestoneBoundary && (
                      <div className="absolute -right-1 top-3 bottom-3 w-0.5 bg-amber-400 rounded-full opacity-70" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day detail panel — shows below the week that contains the selected day */}
            {week.some(d => d.date === selectedDate) && selectedDate && (
              <div className="mt-3 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 animate-fade-in">
                {(() => {
                  const day = week.find(d => d.date === selectedDate)!;
                  const isDistracted = day.morning === 'distracted' || day.evening === 'distracted';
                  const bothFocused = day.morning === 'focused' && day.evening === 'focused';
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-lg ${isDistracted ? 'text-red-500' : 'text-emerald-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isDistracted ? 'warning' : 'check_circle'}
                          </span>
                          <div>
                            <h4 className="text-sm font-headline font-bold text-on-surface">
                              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h4>
                            <p className="text-[10px] text-on-surface-variant font-label">
                              AM: <span className={day.morning === 'focused' ? 'text-emerald-600 font-bold' : day.morning === 'distracted' ? 'text-red-500 font-bold' : ''}>{day.morning}</span>
                              {' · '}
                              PM: <span className={day.evening === 'focused' ? 'text-emerald-600 font-bold' : day.evening === 'distracted' ? 'text-red-500 font-bold' : ''}>{day.evening}</span>
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedDate(null)} aria-label="Close day detail" className="p-1 rounded-full hover:bg-surface-container-low cursor-pointer">
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                        </button>
                      </div>

                      {loadingEvents ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : dayEvents.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest font-bold mb-2">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} flagged
                          </p>
                          {dayEvents.map(ev => (
                            <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-surface-container-low rounded-xl">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                ev.severity === 'high' ? 'bg-red-500' : ev.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-400'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-label font-medium text-on-surface truncate">
                                  {GOAL_LABELS[ev.category as GoalCategory] ?? ev.category}
                                  {ev.app_name && <span className="text-on-surface-variant font-normal"> — {ev.app_name}</span>}
                                </p>
                                <p className="text-[10px] text-on-surface-variant font-label">
                                  {ev.platform} · {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                ev.severity === 'high' ? 'bg-red-100 text-red-700' : ev.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{ev.severity}</span>
                            </div>
                          ))}
                        </div>
                      ) : bothFocused ? (
                        <div className="text-center py-4">
                          <span className="material-symbols-outlined text-3xl text-emerald-400 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                          <p className="text-sm font-headline font-bold text-emerald-700">All clear!</p>
                          <p className="text-xs text-on-surface-variant font-body mt-1">No flags this day. You stayed fully focused.</p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant/40 mb-1 block">event_available</span>
                          <p className="text-xs text-on-surface-variant font-body">No events recorded for this day.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}

        {/* Row labels */}
        <div className="flex items-center gap-4 mt-2 text-[10px] text-on-surface-variant">
          <span>Top row = Morning (5AM–5PM)</span>
          <span>Bottom row = Evening (5PM–5AM)</span>
        </div>
      </div>

      {/* ─── Milestones ────────────────────────────────────── */}
      {milestones.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4">
          <h3 className="font-headline text-sm font-semibold text-on-surface mb-3">
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
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          aria-expanded={showHistory}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <span>Recent Points Activity</span>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">{showHistory ? 'expand_less' : 'expand_more'}</span>
        </button>

        {showHistory && (
          <div className="border-t border-outline-variant/10 divide-y divide-outline-variant/5">
            {recentActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="text-sm text-on-surface">
                    {ACTION_LABELS[action.action] || action.action}
                  </div>
                  {action.note && (
                    <div className="text-xs text-on-surface-variant">{action.note}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    action.points > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {action.points > 0 ? '+' : ''}{action.points}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {timeAgo(action.created_at)}
                  </span>
                </div>
              </div>
            ))}

            {recentActions.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
                No points activity yet. Stay focused to start earning!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
