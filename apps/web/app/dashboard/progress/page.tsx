'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory } from '@be-candid/shared';
import { ALL_BADGES, TIER_STYLES } from '@/lib/badges';
import ShareButton from '@/components/ShareButton';
import MaterialIcon from '@/components/ui/MaterialIcon';

/* ── Types ───────────────────────────────────────────────── */

interface StreakData {
  balance: number;
  streak: { streakDays: number; streakSegments: number };
  heatmap: Array<{ date: string; morning: string; evening: string }>;
  milestones: Array<{ milestone: string; unlocked_at: string }>;
}

interface TimelineStats {
  daysSinceSignup: number;
  totalJournals: number;
  currentStreak: number;
  trustPoints: number;
  conversationCount: number;
  hasPartner: boolean;
  checkInsCompleted: number;
}

interface TimelineMilestone {
  key: string;
  label: string;
  icon: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  progress?: string;
}

/* ── Milestone definitions ───────────────────────────────── */

function buildTimelineMilestones(
  earned: Set<string>,
  milestones: Array<{ milestone: string; unlocked_at: string }>,
  stats: TimelineStats,
): TimelineMilestone[] {
  const defs = [
    { key: 'first_journal', label: 'First Journal Entry', icon: 'edit_note', description: 'Started your story', threshold: 1, current: stats.totalJournals, unit: 'entry' },
    { key: 'first_checkin', label: 'First Check-in Completed', icon: 'check_circle', description: 'Showed up for accountability', threshold: 1, current: stats.checkInsCompleted, unit: 'check-in' },
    { key: 'streak_7', label: '7-Day Streak', icon: 'local_fire_department', description: 'A full week of focus', threshold: 7, current: stats.currentStreak, unit: 'day' },
    { key: 'journals_10', label: '10 Journal Entries', icon: 'auto_stories', description: 'Building the habit of reflection', threshold: 10, current: stats.totalJournals, unit: 'entry' },
    { key: 'first_conversation', label: 'First Partner Conversation', icon: 'forum', description: 'Real talk with someone who cares', threshold: 1, current: stats.conversationCount, unit: 'conversation' },
    { key: 'streak_14', label: '14-Day Streak', icon: 'local_fire_department', description: 'Two weeks of consistency', threshold: 14, current: stats.currentStreak, unit: 'day' },
    { key: 'journals_25', label: '25 Journal Entries', icon: 'auto_stories', description: 'A quarter-century of honesty', threshold: 25, current: stats.totalJournals, unit: 'entry' },
    { key: 'streak_30', label: '30-Day Streak', icon: 'whatshot', description: 'A full month of showing up', threshold: 30, current: stats.currentStreak, unit: 'day' },
    { key: 'journals_50', label: '50 Journal Entries', icon: 'menu_book', description: 'Half a hundred honest reflections', threshold: 50, current: stats.totalJournals, unit: 'entry' },
    { key: 'streak_60', label: '60-Day Streak', icon: 'whatshot', description: 'Two months of relentless focus', threshold: 60, current: stats.currentStreak, unit: 'day' },
    { key: 'streak_90', label: '90-Day Streak', icon: 'emoji_events', description: 'A quarter year of transformation', threshold: 90, current: stats.currentStreak, unit: 'day' },
    { key: 'journals_100', label: '100 Journal Entries', icon: 'workspace_premium', description: 'Triple digits of truth-telling', threshold: 100, current: stats.totalJournals, unit: 'entry' },
  ];

  return defs.map(d => {
    const m = milestones.find(mi => mi.milestone === d.key);
    const isAchieved = earned.has(d.key) || (m != null);
    const remaining = Math.max(0, d.threshold - d.current);
    return {
      key: d.key,
      label: d.label,
      icon: d.icon,
      description: d.description,
      achieved: isAchieved,
      achievedAt: m?.unlocked_at,
      progress: !isAchieved ? `${remaining} ${d.unit}${remaining !== 1 ? 's' : ''} away` : undefined,
    };
  });
}

/* ── Page ────────────────────────────────────────────────── */

export default function ProgressPage() {
  const [tab, setTab] = useState<'streaks' | 'badges' | 'timeline'>('streaks');
  const [data, setData] = useState<StreakData | null>(null);
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({});
  const [timelineStats, setTimelineStats] = useState<TimelineStats | null>(null);

  const handleShare = useCallback(async (milestoneKey: string) => {
    if (shareUrls[milestoneKey]) return; // already generated
    try {
      const res = await fetch('/api/milestones/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone: milestoneKey }),
      });
      if (res.ok) {
        const { shareUrl } = await res.json();
        setShareUrls(prev => ({ ...prev, [milestoneKey]: shareUrl }));
      }
    } catch {
      // silently fail
    }
  }, [shareUrls]);

  useEffect(() => {
    Promise.all([
      fetch('/api/trust-points/stats').then(r => r.json()),
      fetch('/api/auth/profile').then(r => r.json()),
      fetch('/api/journal?limit=1000').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('/api/check-ins?limit=1000').then(r => r.json()).catch(() => ({ checkIns: [] })),
      fetch('/api/conversations?limit=1000').then(r => r.json()).catch(() => ({ conversations: [] })),
    ])
      .then(([stats, profileData, journals, checkIns, conversations]) => {
        setData(stats);
        setGoals(profileData.profile?.goals ?? []);

        const createdAt = profileData.profile?.created_at;
        const daysSinceSignup = createdAt
          ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
          : 0;
        const totalJournals = (journals.entries ?? journals.journals ?? []).length;
        const checkInsCompleted = (checkIns.checkIns ?? []).filter((ci: any) => ci.status === 'completed').length;
        const conversationCount = (conversations.conversations ?? []).length;

        setTimelineStats({
          daysSinceSignup,
          totalJournals,
          currentStreak: stats.streak?.streakDays ?? 0,
          trustPoints: stats.balance ?? 0,
          conversationCount,
          hasPartner: !!profileData.profile?.partner_user_id,
          checkInsCompleted,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-surface-container rounded w-48 animate-pulse" />
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-8 animate-pulse">
          <div className="h-40 bg-surface-container-low rounded" />
        </div>
      </div>
    );
  }

  const heatmap = data.heatmap;
  const totalDays = heatmap.filter(d => d.morning !== 'pending' || d.evening !== 'pending').length;
  const fullFocusDays = heatmap.filter(d => d.morning === 'focused' && d.evening === 'focused').length;
  const earned = new Set(data.milestones.map(m => m.milestone));
  const earnedCount = earned.size;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MaterialIcon name="trending_up" filled className="text-primary text-3xl" />
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Progress</h1>
          <p className="text-sm text-on-surface-variant font-body">Your streaks, badges, and accountability journey.</p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
        {(['streaks', 'badges', 'timeline'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2.5 rounded-lg font-label text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
              tab === t
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {t === 'streaks' ? 'local_fire_department' : t === 'badges' ? 'military_tech' : 'timeline'}
            </span>
            <span className="hidden sm:inline">
              {t === 'streaks' ? 'Streaks' : t === 'badges' ? `Badges (${earnedCount}/${ALL_BADGES.length})` : 'Journey'}
            </span>
            <span className="sm:hidden text-xs">
              {t === 'streaks' ? 'Streaks' : t === 'badges' ? 'Badges' : 'Journey'}
            </span>
          </button>
        ))}
      </div>

      {/* ── Streaks Tab ──────────────────────────────────── */}
      {tab === 'streaks' && (
        <div className="space-y-6">
          {/* Streak hero */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 text-center bg-gradient-to-br from-emerald-50 to-primary-container">
            <div className="text-5xl font-headline font-bold text-primary mb-1">
              {data.streak.streakDays}
            </div>
            <div className="text-sm text-primary font-medium font-label">day focus streak</div>
            <div className="text-xs text-on-surface-variant mt-2 font-body">
              {fullFocusDays} full focused days out of {totalDays} tracked
            </div>

            {/* Milestone markers */}
            <div className="flex justify-center gap-2 mt-4">
              {[7, 14, 30, 60, 90].map(m => (
                <div key={m} className={`px-2.5 py-1 rounded-full text-xs font-label font-semibold border ${
                  data.streak.streakDays >= m
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant'
                }`}>
                  {data.streak.streakDays >= m
                    ? <MaterialIcon name="military_tech" filled className="text-sm align-middle" />
                    : <span className="material-symbols-outlined text-sm align-middle">radio_button_unchecked</span>
                  } {m}d
                </div>
              ))}
            </div>
          </div>

          {/* Tracked categories */}
          {goals.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6">
              <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">Your Rivals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {goals.map(goal => (
                  <div key={goal} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
                    <span className="material-symbols-outlined text-primary text-xl">track_changes</span>
                    <div>
                      <div className="text-sm font-medium text-on-surface font-label leading-tight">{GOAL_LABELS[goal]}</div>
                      <div className="text-[10px] text-on-surface-variant font-label">Monitoring active</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 21-day heatmap */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6">
            <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">21-Day Overview</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {heatmap.map(day => {
                const bothFocused = day.morning === 'focused' && day.evening === 'focused';
                const anyDistracted = day.morning === 'distracted' || day.evening === 'distracted';
                const pending = day.morning === 'pending' && day.evening === 'pending';

                return (
                  <div key={day.date}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-110 ${
                      pending ? 'bg-surface-container text-on-surface-variant'
                      : bothFocused ? 'bg-emerald-400 text-white'
                      : anyDistracted ? 'bg-red-400 text-white'
                      : 'bg-amber-300 text-amber-800'
                    }`}
                    title={`${day.date}: AM=${day.morning}, PM=${day.evening}`}
                  >
                    {new Date(day.date + 'T12:00:00').getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant font-label">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Full day focused</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" /> Partial</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> Distracted</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Badges Tab ───────────────────────────────────── */}
      {tab === 'badges' && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-headline font-bold text-on-surface">{earnedCount}/{ALL_BADGES.length}</span>
              <span className="text-xs text-on-surface-variant font-label">{Math.round((earnedCount / ALL_BADGES.length) * 100)}% complete</span>
            </div>
            <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all"
                style={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }} />
            </div>
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_BADGES.map(badge => {
              const isEarned = earned.has(badge.key);
              const milestone = data.milestones.find(m => m.milestone === badge.key);
              const tier = TIER_STYLES[badge.tier as keyof typeof TIER_STYLES];

              return (
                <div key={badge.key}
                  className={`bg-surface-container-lowest rounded-2xl border p-4 text-center transition-all duration-200 ${
                    isEarned
                      ? `${tier.bg} ${tier.border} border-2 shadow-sm hover:shadow-lg hover:scale-[1.02]`
                      : 'border-outline-variant/30 opacity-40 grayscale'
                  }`}
                >
                  <div className={`mb-2 ${isEarned ? '' : 'filter blur-[1px]'}`}>
                    <span className={`material-symbols-outlined text-3xl ${isEarned ? tier.text : 'text-on-surface-variant'}`} style={isEarned ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {isEarned ? badge.icon : 'lock'}
                    </span>
                  </div>
                  <div className={`text-xs font-bold font-label ${isEarned ? tier.text : 'text-on-surface-variant'}`}>
                    {badge.label}
                  </div>
                  {isEarned && milestone && (
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      {new Date(milestone.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {isEarned && (
                    <div className="mt-2">
                      {shareUrls[badge.key] ? (
                        <ShareButton
                          url={shareUrls[badge.key]}
                          title={`I earned ${badge.label} on Be Candid!`}
                          text={`I just earned the ${badge.label} badge on my digital wellness journey with Be Candid! 🔥`}
                          size="sm"
                        />
                      ) : (
                        <button
                          onClick={() => handleShare(badge.key)}
                          className="p-1.5 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Share this achievement"
                        >
                          <span className="material-symbols-outlined text-base text-on-surface-variant">share</span>
                        </button>
                      )}
                    </div>
                  )}
                  {!isEarned && (
                    <div className="text-[10px] text-on-surface-variant mt-1 capitalize font-label">{badge.tier}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Timeline Tab ─────────────────────────────────── */}
      {tab === 'timeline' && timelineStats && (() => {
        const tMilestones = buildTimelineMilestones(earned, data.milestones, timelineStats);
        const lastAchievedIdx = tMilestones.map(m => m.achieved).lastIndexOf(true);
        const nextUpIdx = lastAchievedIdx + 1;
        const gradientPercent = tMilestones.length > 1
          ? Math.min(100, ((lastAchievedIdx + 1) / tMilestones.length) * 100)
          : 0;

        return (
          <div className="space-y-6 stagger">
            {/* Stats header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: timelineStats.daysSinceSignup, label: 'Days on Journey', icon: 'calendar_today' },
                { value: timelineStats.totalJournals, label: 'Journal Entries', icon: 'edit_note' },
                { value: timelineStats.currentStreak, label: 'Current Streak', icon: 'local_fire_department' },
                { value: timelineStats.trustPoints.toLocaleString(), label: 'Trust Points', icon: 'stars' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center">
                  <MaterialIcon name={stat.icon} filled className="text-primary text-lg mb-1" />
                  <div className="text-xl font-headline font-bold text-on-surface">{stat.value}</div>
                  <div className="text-[10px] text-on-surface-variant font-label mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Vertical timeline */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
              <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Your Journey</h3>
              <div className="relative pl-8">
                {/* Vertical line */}
                <div
                  className="absolute left-[7px] top-0 bottom-0 w-[2px]"
                  style={{
                    background: `linear-gradient(to bottom, #226779 ${gradientPercent}%, var(--md-sys-color-outline-variant, #c4c7c5) ${gradientPercent}%)`,
                  }}
                />

                {tMilestones.map((m, i) => {
                  const isNext = i === nextUpIdx;
                  return (
                    <div key={m.key} className="relative mb-6 last:mb-0">
                      {/* Node circle */}
                      <div
                        className={`absolute -left-8 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          m.achieved
                            ? 'bg-primary border-primary'
                            : isNext
                              ? 'bg-transparent border-primary animate-pulse'
                              : 'bg-surface-container border-outline-variant'
                        }`}
                      >
                        {m.achieved && (
                          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        )}
                      </div>

                      {/* Card */}
                      <div
                        className={`rounded-2xl p-4 transition-all duration-300 ${
                          m.achieved
                            ? 'bg-primary-container/30 ring-1 ring-primary/20'
                            : isNext
                              ? 'bg-surface-container-low ring-1 ring-primary/30 shadow-sm'
                              : 'bg-surface-container/50 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`material-symbols-outlined text-lg ${
                              m.achieved ? 'text-primary' : isNext ? 'text-primary/70' : 'text-on-surface-variant/50'
                            }`}
                            style={m.achieved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {m.icon}
                          </span>
                          <span className={`font-headline text-sm font-bold ${
                            m.achieved ? 'text-on-surface' : isNext ? 'text-on-surface' : 'text-on-surface-variant'
                          }`}>
                            {m.label}
                          </span>
                        </div>
                        <p className={`text-xs font-body ${m.achieved ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>
                          {m.description}
                        </p>
                        {m.achieved && m.achievedAt && (
                          <p className="text-[10px] font-label text-primary mt-1.5">
                            <span className="material-symbols-outlined align-middle mr-0.5" style={{ fontSize: '12px' }}>event</span>
                            {new Date(m.achievedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                        {!m.achieved && m.progress && (
                          <p className={`text-[10px] font-label mt-1.5 ${isNext ? 'text-primary font-semibold' : 'text-on-surface-variant/60'}`}>
                            {isNext && <span className="material-symbols-outlined align-middle mr-0.5" style={{ fontSize: '12px' }}>arrow_forward</span>}
                            {m.progress}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
