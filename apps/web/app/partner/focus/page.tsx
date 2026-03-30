'use client';

import { useState, useEffect } from 'react';

interface HeatmapDay {
  date: string;
  morning: 'focused' | 'distracted' | 'pending';
  evening: 'focused' | 'distracted' | 'pending';
}

interface Milestone {
  milestone: string;
  unlocked_at: string;
}

interface PartnerFocusData {
  monitoredUserName: string;
  balance: number;
  streak: { streakDays: number; streakSegments: number };
  heatmap: HeatmapDay[];
  milestones: Milestone[];
}

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
  points_100:           { label: '100 Trust Points',       icon: 'target' },
  points_500:           { label: '500 Trust Points',       icon: 'diamond' },
  points_1000:          { label: '1,000 Trust Points',     icon: 'emoji_events' },
  points_5000:          { label: '5,000 Trust Points',     icon: 'pets' },
  conversations_5:      { label: '5 Conversations',        icon: 'chat' },
  conversations_10:     { label: '10 Conversations',       icon: 'handshake' },
  conversations_25:     { label: '25 Conversations',       icon: 'favorite' },
  streak_7:             { label: '7-Day Streak',           icon: 'local_fire_department' },
  streak_30:            { label: '30-Day Streak',          icon: 'bolt' },
  streak_90:            { label: '90-Day Streak',          icon: 'military_tech' },
};

const STATUS_COLORS = {
  focused: 'bg-emerald-400',
  distracted: 'bg-red-400',
  pending: 'bg-surface-container-low',
};

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PartnerFocusPage() {
  const [data, setData] = useState<PartnerFocusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/partner/focus')
      .then(r => {
        if (!r.ok) throw new Error('No active partnership');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-surface-container-low rounded-xl w-64 animate-pulse" />
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 animate-pulse">
          <div className="h-40 bg-surface-container-low rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            No Active Partnership
          </h3>
          <p className="text-sm text-on-surface-variant">
            When you're connected as someone's accountability partner, their Focus Board will appear here.
          </p>
        </div>
      </div>
    );
  }

  const { monitoredUserName, balance, streak, heatmap, milestones } = data;
  const weeks = [heatmap.slice(0, 7), heatmap.slice(7, 14), heatmap.slice(14, 21)];
  const today = heatmap[heatmap.length - 1];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-3xl">center_focus_strong</span>
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            {monitoredUserName}'s Focus Board
          </h1>
        </div>
        <p className="text-sm font-body text-on-surface-variant">
          See how they're doing -- celebrate the wins, show up for the tough days.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-primary">
            {balance.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">Trust Points</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-emerald-600">
            {streak.streakDays}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">Day Streak</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold">
            {today?.morning === 'focused' && today?.evening === 'focused'
              ? <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
              : today?.morning === 'pending' && today?.evening === 'pending'
                ? '—'
                : today?.morning === 'focused' || today?.evening === 'focused'
                  ? <span className="material-symbols-outlined text-amber-500 text-2xl">bolt</span>
                  : <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">Today</div>
        </div>
      </div>

      {/* 21-day heatmap */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline text-sm font-bold text-on-surface">3-Week Focus Map</h3>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Focused
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Distracted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-surface-container-low inline-block border border-outline-variant/30" /> Pending
            </span>
          </div>
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className={wi > 0 ? 'mt-3 pt-3 border-t border-outline-variant/20' : ''}>
            <div className="text-xs text-on-surface-variant mb-1.5 font-medium">Week {wi + 1}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day) => (
                <div key={day.date} className="text-center">
                  <div className="text-[10px] text-on-surface-variant mb-1">{getDayLabel(day.date)}</div>
                  <div
                    className={`h-5 rounded-t-md ${STATUS_COLORS[day.morning]}`}
                    title={`${formatDateShort(day.date)} AM: ${day.morning}`}
                  />
                  <div
                    className={`h-5 rounded-b-md mt-0.5 ${STATUS_COLORS[day.evening]}`}
                    title={`${formatDateShort(day.date)} PM: ${day.evening}`}
                  />
                  <div className="text-[9px] text-on-surface-variant mt-0.5">
                    {formatDateShort(day.date).split(' ')[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 mt-2 text-[10px] text-on-surface-variant">
          <span>Top row = Morning (5AM-5PM)</span>
          <span>Bottom row = Evening (5PM-5AM)</span>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-3">
            {monitoredUserName}'s Milestones
          </h3>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m) => {
              const info = MILESTONE_LABELS[m.milestone] || { label: m.milestone, icon: 'military_tech' };
              return (
                <div
                  key={m.milestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{info.icon}</span>
                  <span>{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encouragement CTA */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 bg-gradient-to-r from-primary-container/30 to-emerald-50 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-sm font-bold text-on-surface mb-1">
              Send Encouragement
            </h3>
            <p className="text-xs text-on-surface-variant">
              A quick message of support can make a real difference. They'll earn 5 trust points too.
            </p>
          </div>
          <a
            href="/partner/encourage"
            className="px-4 py-2 bg-primary text-on-primary text-sm font-headline font-bold rounded-full hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Send
          </a>
        </div>
      </div>
    </div>
  );
}
