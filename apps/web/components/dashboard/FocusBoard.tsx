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

const ACTION_ICONS: Record<string, string> = {
  focused_morning:       'wb_sunny',
  focused_evening:       'dark_mode',
  focused_full_day:      'check_circle',
  check_in_completed:    'task_alt',
  conversation_done:     'forum',
  conversation_positive: 'sentiment_satisfied',
  milestone_reached:     'emoji_events',
  partner_encouraged:    'favorite',
  streak_bonus_7:        'local_fire_department',
  streak_bonus_30:       'bolt',
  streak_bonus_90:       'military_tech',
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
  const [showAllActivity, setShowAllActivity] = useState(false);
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
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-6">
              <div className="h-10 skeleton-shimmer rounded w-24 mb-3" />
              <div className="h-4 skeleton-shimmer rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8">
          <div className="h-6 skeleton-shimmer rounded w-48 mb-4" />
          <div className="h-32 skeleton-shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 text-center text-on-surface-variant">
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
  const todayPending = today?.morning === 'pending' && today?.evening === 'pending';

  const todayStatusLabel = todayPending
    ? 'Not Started'
    : todayFocusedCount === 2
      ? 'Fully Focused'
      : todayFocusedCount === 1
        ? 'Partially Focused'
        : 'Not Focused';

  // Estimate yesterday's points change (sum points from actions in last 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const recentPointsChange = recentActions
    .filter(a => a.created_at >= yesterdayStr)
    .reduce((sum, a) => sum + a.points, 0);

  // Streak bar visualization (last 7 days)
  const streakBarDays = heatmap.slice(-7);

  // Activities to show
  const visibleActions = showAllActivity ? recentActions : recentActions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ─── Stats Row (3 bento cards) ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Trust Points */}
        <div className="bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/10 p-6">
          <p className="text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            {balance.toLocaleString()}
          </p>
          <p className="text-sm text-on-surface-variant font-label mt-2">Trust Points</p>
          {recentPointsChange !== 0 && (
            <p className={`text-xs font-label mt-1 ${recentPointsChange > 0 ? 'text-tertiary' : 'text-error'}`}>
              {recentPointsChange > 0 ? '+' : ''}{recentPointsChange} since yesterday
            </p>
          )}
        </div>

        {/* Card 2: Day Streak */}
        <div className="bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/10 p-6">
          <p className="text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            {streak.streakDays}
          </p>
          <p className="text-sm text-on-surface-variant font-label mt-2">Day Streak</p>
          {/* Streak bar visualization */}
          <div className="flex items-center gap-1 mt-3">
            {streakBarDays.map((day, i) => {
              const bothFocused = day.morning === 'focused' && day.evening === 'focused';
              const anyDistracted = day.morning === 'distracted' || day.evening === 'distracted';
              return (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    bothFocused
                      ? 'bg-tertiary'
                      : anyDistracted
                        ? 'bg-error'
                        : 'bg-surface-variant'
                  }`}
                  title={formatDateShort(day.date)}
                />
              );
            })}
          </div>
        </div>

        {/* Card 3: Daily Status */}
        <div className="bg-primary rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-2xl font-headline font-extrabold text-on-primary tracking-tight">
              {todayStatusLabel}
            </p>
            <p className="text-sm text-on-primary/70 font-label mt-1">
              {todayPending ? 'Your day has not started yet' : `${todayFocusedCount}/2 segments focused`}
            </p>
          </div>
          {todayFocusedCount < 2 && (
            <button className="mt-4 self-start px-4 py-2 bg-on-primary text-primary rounded-lg text-sm font-label font-semibold hover:opacity-90 transition-opacity cursor-pointer">
              Complete Focus
            </button>
          )}
        </div>
      </div>

      {/* ─── Asymmetric 2-column: Quote + Focus Map ────────── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Editorial quote card */}
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container rounded-xl p-6 flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-on-tertiary-container/40 text-3xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            <p className="text-lg text-on-tertiary-container font-body italic leading-relaxed">
              &ldquo;Begin with the end in mind. Your board starts fully green &mdash; every segment begins as focused. The green isn&rsquo;t earned &mdash; it&rsquo;s your natural state.&rdquo;
            </p>
          </div>
          <p className="text-sm text-on-tertiary-container/70 font-label mt-4">
            &mdash; Stephen Covey
          </p>
        </div>

        {/* Right: 3-Week Focus Map (WIDE) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-base font-bold text-on-surface">
              3-Week Focus Map
            </h3>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-tertiary inline-block" /> Focused
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-error inline-block" /> Distracted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-surface-variant inline-block" /> Pending
              </span>
            </div>
          </div>

          {/* Wide grid: 21 columns (3 weeks x 7 days), AM row and PM row */}
          <div className="w-full">
            {/* Week labels */}
            <div className="grid grid-cols-[auto_repeat(21,_1fr)] gap-x-1 mb-1">
              <div className="w-8" />
              {[1, 2, 3].map(w => (
                <div key={w} className="col-span-7 text-center text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                  Week {w}
                </div>
              ))}
            </div>

            {/* Day name headers */}
            <div className="grid grid-cols-[auto_repeat(21,_1fr)] gap-x-1 mb-1">
              <div className="w-8" />
              {heatmap.map((day) => (
                <div key={day.date + '-label'} className="text-center text-[9px] text-on-surface-variant font-label">
                  {getDayLabel(day.date).charAt(0)}
                </div>
              ))}
            </div>

            {/* AM Row */}
            <div className="grid grid-cols-[auto_repeat(21,_1fr)] gap-x-1 gap-y-1 mb-1">
              <div className="w-8 flex items-center text-[10px] font-label font-semibold text-on-surface-variant">
                AM
              </div>
              {heatmap.map((day, i) => {
                const isToday = day.date === todayStr;
                const isHovered = hoveredDay === day.date;
                return (
                  <div key={day.date + '-am'} className="relative">
                    <button
                      onClick={() => handleDayClick(day.date)}
                      onMouseEnter={() => setHoveredDay(day.date)}
                      onMouseLeave={() => setHoveredDay(null)}
                      aria-label={`${formatDateShort(day.date)} AM: ${day.morning}`}
                      className={`w-full aspect-square rounded-sm transition-all duration-200 cursor-pointer ${
                        day.morning === 'focused'
                          ? 'bg-tertiary'
                          : day.morning === 'distracted'
                            ? 'bg-error'
                            : 'bg-surface-variant'
                      } ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''} ${
                        selectedDate === day.date ? 'ring-2 ring-primary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-primary/30'
                      }`}
                      style={{ animation: `fade-up 0.3s ease-out ${i * 20}ms both` }}
                    />
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-on-surface text-surface-container-lowest text-[10px] font-label whitespace-nowrap shadow-lg pointer-events-none animate-fade-in">
                        <div className="font-semibold mb-0.5">{formatDateShort(day.date)}</div>
                        <div>AM: <span className={day.morning === 'focused' ? 'text-emerald-300' : day.morning === 'distracted' ? 'text-red-300' : 'text-gray-400'}>{day.morning}</span></div>
                        <div>PM: <span className={day.evening === 'focused' ? 'text-emerald-300' : day.evening === 'distracted' ? 'text-red-300' : 'text-gray-400'}>{day.evening}</span></div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-on-surface" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PM Row */}
            <div className="grid grid-cols-[auto_repeat(21,_1fr)] gap-x-1 gap-y-1">
              <div className="w-8 flex items-center text-[10px] font-label font-semibold text-on-surface-variant">
                PM
              </div>
              {heatmap.map((day, i) => {
                const isToday = day.date === todayStr;
                return (
                  <div key={day.date + '-pm'} className="relative">
                    <button
                      onClick={() => handleDayClick(day.date)}
                      onMouseEnter={() => setHoveredDay(day.date)}
                      onMouseLeave={() => setHoveredDay(null)}
                      aria-label={`${formatDateShort(day.date)} PM: ${day.evening}`}
                      className={`w-full aspect-square rounded-sm transition-all duration-200 cursor-pointer ${
                        day.evening === 'focused'
                          ? 'bg-tertiary'
                          : day.evening === 'distracted'
                            ? 'bg-error'
                            : 'bg-surface-variant'
                      } ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''} ${
                        selectedDate === day.date ? 'ring-2 ring-primary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-primary/30'
                      }`}
                      style={{ animation: `fade-up 0.3s ease-out ${(i * 20) + 10}ms both` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Date labels below */}
            <div className="grid grid-cols-[auto_repeat(21,_1fr)] gap-x-1 mt-1">
              <div className="w-8" />
              {heatmap.map((day) => (
                <div key={day.date + '-num'} className="text-center text-[8px] text-on-surface-variant">
                  {formatDateShort(day.date).split(' ')[1]}
                </div>
              ))}
            </div>
          </div>

          {/* Day detail panel (appears below the map when a day is clicked) */}
          {selectedDate && (() => {
            const day = heatmap.find(d => d.date === selectedDate);
            if (!day) return null;
            const isDistracted = day.morning === 'distracted' || day.evening === 'distracted';
            const bothFocused = day.morning === 'focused' && day.evening === 'focused';
            return (
              <div className="mt-4 bg-surface-container-low rounded-xl p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-lg ${isDistracted ? 'text-error' : 'text-tertiary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isDistracted ? 'warning' : 'check_circle'}
                    </span>
                    <div>
                      <h4 className="text-sm font-headline font-bold text-on-surface">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-label">
                        AM: <span className={day.morning === 'focused' ? 'text-tertiary font-bold' : day.morning === 'distracted' ? 'text-error font-bold' : ''}>{day.morning}</span>
                        {' \u00b7 '}
                        PM: <span className={day.evening === 'focused' ? 'text-tertiary font-bold' : day.evening === 'distracted' ? 'text-error font-bold' : ''}>{day.evening}</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDate(null)} aria-label="Close day detail" className="p-1 rounded-full hover:bg-surface-container cursor-pointer">
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
                      <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-surface-container-lowest rounded-xl">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          ev.severity === 'high' ? 'bg-error' : ev.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-400'
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
                          ev.severity === 'high' ? 'bg-error-container text-on-error-container' : ev.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{ev.severity}</span>
                      </div>
                    ))}
                  </div>
                ) : bothFocused ? (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-3xl text-tertiary mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                    <p className="text-sm font-headline font-bold text-on-surface">All clear!</p>
                    <p className="text-xs text-on-surface-variant font-body mt-1">No flags this day. You stayed fully focused.</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant/40 mb-1 block">event_available</span>
                    <p className="text-xs text-on-surface-variant font-body">No events recorded for this day.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ─── Milestones (if any) ──────────────────────────── */}
      {milestones.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/10 p-5">
          <h3 className="font-headline text-base font-bold text-on-surface mb-3">
            Milestones Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m) => {
              const info = MILESTONE_LABELS[m.milestone] || { label: m.milestone, icon: 'military_tech' };
              return (
                <div
                  key={m.milestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-medium"
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

      {/* ─── Recent Points Activity ──────────────────────── */}
      <div className="bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/10">
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-headline text-base font-bold text-on-surface">
            Recent Points Activity
          </h3>
        </div>

        <div className="divide-y divide-outline-variant/5">
          {visibleActions.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-on-surface-variant">
              No points activity yet. Stay focused to start earning!
            </div>
          )}
          {visibleActions.map((action, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {ACTION_ICONS[action.action] || 'stars'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface font-label font-medium">
                  {ACTION_LABELS[action.action] || action.action}
                </p>
                {action.note && (
                  <p className="text-xs text-on-surface-variant truncate">{action.note}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-on-surface-variant font-label">
                  {timeAgo(action.created_at)}
                </span>
                <span className={`text-sm font-semibold font-label ${
                  action.points > 0 ? 'text-tertiary' : 'text-error'
                }`}>
                  {action.points > 0 ? '+' : ''}{action.points}
                </span>
              </div>
            </div>
          ))}
        </div>

        {recentActions.length > 5 && (
          <div className="px-5 py-3 border-t border-outline-variant/10">
            <button
              onClick={() => setShowAllActivity(!showAllActivity)}
              className="w-full text-center text-sm font-label font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer py-1"
            >
              {showAllActivity ? 'Show Less' : 'Show All Activity History'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
