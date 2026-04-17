'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MilestoneCelebration from './MilestoneCelebration';

interface DashboardHeroProps {
  userName: string;
  currentStreak: number;
  moodTrend?: { start: number; end: number; direction: 'up' | 'down' | 'stable' };
  journalCount7d: number;
  trustPoints: number;
  goals: string[];
}

/* ── Milestone helpers ─────────────────────────────────────── */
const MILESTONES = [7, 14, 30, 60, 90];

function getNextMilestone(streak: number): number {
  for (const m of MILESTONES) {
    if (streak < m) return m;
  }
  return streak + 30;
}

export default function DashboardHero({
  userName,
  currentStreak,
  moodTrend,
  journalCount7d,
  trustPoints,
  goals,
}: DashboardHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const CELEBRATION_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

  useEffect(() => {
    setMounted(true);

    if (CELEBRATION_MILESTONES.includes(currentStreak)) {
      const key = `milestone-celebrated-${currentStreak}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'true');
        setShowCelebration(true);
      }
    }
  }, [currentStreak]);

  const firstName = userName?.split(' ')[0] || 'there';
  const nextMilestone = getNextMilestone(currentStreak);
  const rivalsTracked = goals.length;

  // Mood trend label
  let moodLabel = '';
  let moodIcon = 'trending_flat';
  let moodColor = 'text-on-surface-variant';
  if (moodTrend) {
    if (moodTrend.direction === 'up') {
      moodLabel = 'Trending up';
      moodIcon = 'trending_up';
      moodColor = 'text-tertiary';
    } else if (moodTrend.direction === 'down') {
      moodLabel = 'Trending down';
      moodIcon = 'trending_down';
      moodColor = 'text-error';
    } else {
      moodLabel = 'Steady';
      moodIcon = 'trending_flat';
      moodColor = 'text-on-surface-variant';
    }
  }

  return (
    <>
      {/* Milestone celebration modal */}
      {showCelebration && (
        <MilestoneCelebration
          milestone={currentStreak}
          userName={firstName}
          communityCount={Math.floor(Math.random() * 400) + 50}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      <section className="bg-surface-container-lowest rounded-[2rem] p-8 sm:p-10">
        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="font-body text-base text-on-surface-variant/70">
            Your digital sanctuary for clarity and progress.
          </p>
        </div>

        {/* Stats bento grid — 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Reputation Points */}
          <div className="bg-surface rounded-[2rem] p-6 flex flex-col gap-1 group relative cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-lg text-primary">stars</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                Reputation Points
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant/50 group-hover:text-primary transition-colors">info</span>
            </div>
            <span className="font-headline text-4xl font-extrabold text-primary tabular-nums">
              {trustPoints}
            </span>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 z-50 w-[min(280px,calc(100vw-2rem))] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
              <div className="bg-on-surface text-white rounded-2xl p-4 shadow-xl text-xs leading-relaxed">
                <p className="font-label font-bold text-sm mb-2">How you earn Reputation Points</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Daily check-ins (+5 pts)</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Journal entries (+10 pts)</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Setting daily intentions (+5 pts)</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Partner check-ins (+5 pts each)</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Focus streak milestones (+50 pts)</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-teal-400">check_circle</span> Completing challenges (+5 pts)</li>
                </ul>
              </div>
            </div>
            <span className="font-body text-xs text-on-surface-variant mt-1">
              Earned through consistency
            </span>
          </div>

          {/* Day Streak */}
          <div className="bg-surface rounded-[2rem] p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-lg text-tertiary">local_fire_department</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                Day Streak
              </span>
            </div>
            <span className="font-headline text-4xl font-extrabold text-tertiary tabular-nums">
              {currentStreak}
            </span>
            <span className="font-body text-xs text-on-surface-variant mt-1">
              {currentStreak === 0
                ? 'Start your streak today'
                : `${nextMilestone - currentStreak} day${nextMilestone - currentStreak !== 1 ? 's' : ''} to next milestone`}
            </span>
          </div>

          {/* Journals This Week */}
          <div className="bg-surface rounded-[2rem] p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                Journals
              </span>
            </div>
            <span className="font-headline text-4xl font-extrabold text-on-surface tabular-nums">
              {journalCount7d}
            </span>
            <span className="font-body text-xs text-on-surface-variant mt-1">
              Written this week
            </span>
          </div>

          {/* Mood Trend */}
          <div className="bg-surface rounded-[2rem] p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-lg ${moodColor}`}>{moodIcon}</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                Mood Trend
              </span>
            </div>
            <span className={`font-headline text-2xl font-extrabold ${moodColor}`}>
              {moodTrend ? moodLabel : '--'}
            </span>
            <span className="font-body text-xs text-on-surface-variant mt-1">
              {moodTrend
                ? `${moodTrend.start.toFixed(1)} → ${moodTrend.end.toFixed(1)} this week`
                : 'Check in to track your mood'}
            </span>
          </div>
        </div>

        {/* Quick action row */}
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/dashboard/stringer-journal"
            className="pulse-sheen inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-label font-semibold hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Journal
          </Link>
          <Link
            href="/dashboard/checkins"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:bg-surface-container transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Check-in
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:bg-surface-container transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            Coach
          </button>
        </div>
      </section>
    </>
  );
}
