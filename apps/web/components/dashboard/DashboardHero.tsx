'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  return streak + 30; // beyond 90 — every 30 days
}

function getPrevMilestone(streak: number): number {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (MILESTONES[i] <= streak) return MILESTONES[i];
  }
  return 0;
}

/* ── Greeting helper ───────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Background gradient by streak ─────────────────────────── */
function getBackgroundStyle(streak: number): string {
  if (streak >= 30)
    return 'from-[rgba(132,85,0,0.10)] to-[rgba(253,190,102,0.10)]';
  if (streak >= 7)
    return 'from-[rgba(34,103,121,0.10)] to-[rgba(34,103,121,0.05)]';
  return 'from-[#e8e8e8] to-[#f5f3f3]';
}

export default function DashboardHero({
  userName,
  currentStreak,
  moodTrend,
  journalCount7d,
  trustPoints,
  goals,
}: DashboardHeroProps) {
  const [greeting, setGreeting] = useState('Good morning');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    setMounted(true);
  }, []);

  const firstName = userName?.split(' ')[0] || 'there';
  const nextMilestone = getNextMilestone(currentStreak);
  const prevMilestone = getPrevMilestone(currentStreak);
  const progress = nextMilestone === prevMilestone
    ? 1
    : (currentStreak - prevMilestone) / (nextMilestone - prevMilestone);

  // SVG ring values
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  // Mood trajectory text
  let moodText = '';
  if (moodTrend) {
    if (moodTrend.direction === 'up') {
      moodText = `Your mood climbed from ${moodTrend.start.toFixed(1)} to ${moodTrend.end.toFixed(1)} this week`;
    } else if (moodTrend.direction === 'down') {
      moodText = `Your mood dipped from ${moodTrend.start.toFixed(1)} to ${moodTrend.end.toFixed(1)} this week`;
    } else {
      moodText = `Steady mood this week at ${moodTrend.end.toFixed(1)}`;
    }
  }

  const bgGradient = getBackgroundStyle(currentStreak);
  const rivalsTracked = goals.length;

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgGradient} p-6 sm:p-8`}
    >
      {/* Animated gradient overlay */}
      <div className="hero-gradient-shift absolute inset-0 pointer-events-none opacity-40 rounded-3xl" />

      <div className="relative z-10">
        {/* Greeting */}
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest mb-1">
          Dashboard
        </p>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface mb-6">
          {greeting}, {firstName}
        </h1>

        {/* Main content row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Streak ring */}
          <div className="relative shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-outline-variant/30 dark:text-outline-variant/20"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className={
                  currentStreak >= 30
                    ? 'text-tertiary'
                    : currentStreak >= 7
                      ? 'text-primary'
                      : 'text-on-surface-variant'
                }
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? dashOffset : circumference}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            {/* Center number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-3xl font-extrabold text-on-surface leading-none">
                {currentStreak}
              </span>
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            {/* Streak context */}
            <p className="font-body text-sm text-on-surface-variant">
              {currentStreak === 0
                ? 'Start your streak today. Every day counts.'
                : `${nextMilestone - currentStreak} day${nextMilestone - currentStreak !== 1 ? 's' : ''} until your ${nextMilestone}-day milestone`}
            </p>

            {/* Mood trajectory */}
            {moodText && (
              <p className="font-body text-sm text-on-surface flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="material-symbols-outlined text-base text-primary">
                  {moodTrend?.direction === 'up'
                    ? 'trending_up'
                    : moodTrend?.direction === 'down'
                      ? 'trending_down'
                      : 'trending_flat'}
                </span>
                {moodText}
              </p>
            )}

            {/* Quick stats pills */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                {journalCount7d} journal{journalCount7d !== 1 ? 's' : ''} this week
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-tertiary">stars</span>
                {trustPoints} trust pts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-secondary">flag</span>
                {rivalsTracked} rival{rivalsTracked !== 1 ? 's' : ''} tracked
              </span>
            </div>
          </div>
        </div>

        {/* Quick action row */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center sm:justify-start">
          <Link
            href="/dashboard/stringer-journal"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-label font-semibold hover:bg-primary-dim transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Journal
          </Link>
          <Link
            href="/dashboard/checkins"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Check-in
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            Coach
          </button>
        </div>
      </div>

      {/* CSS animation for gradient shift */}
      <style jsx>{`
        .hero-gradient-shift {
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(34, 103, 121, 0.04) 30%,
            transparent 60%,
            rgba(132, 85, 0, 0.03) 80%,
            transparent 100%
          );
          background-size: 300% 300%;
          animation: heroShift 10s ease-in-out infinite;
        }
        @keyframes heroShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </section>
  );
}
