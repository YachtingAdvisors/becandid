// ============================================================
// components/dashboard/RelationshipLevel.tsx
//
// The main relationship card. Shows:
//   - Current level with emoji + title
//   - XP progress bar to next level
//   - Streak counter with multiplier badge
//   - Contribution balance (user vs partner)
//   - Recent XP activity feed
//   - Expandable level roadmap
//
// Add to dashboard overview:
//   <RelationshipLevel />
// ============================================================

'use client';

import { useState, useEffect } from 'react';

interface LevelInfo {
  level: number;
  xp: number;
  title: string;
  emoji: string;
}

interface Activity {
  earned_by: string;
  amount: number;
  reason: string;
  bonus: boolean;
  description: string;
  created_at: string;
}

interface RelationshipData {
  partnerName: string;
  totalXP: number;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  progressToNext: number;
  streak: number;
  longestStreak: number;
  streakMultiplier: number;
  contribution: {
    user: number;
    partner: number;
    bonus: number;
    balance: number;
  };
  recentActivity: Activity[];
  isUser: boolean;
  allLevels: LevelInfo[];
}

function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

export default function RelationshipLevel() {
  const [data, setData] = useState<RelationshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevels, setShowLevels] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    fetch('/api/relationship')
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
      <div className="h-40 animate-pulse bg-surface-container-low rounded-2xl" />
    </div>
  );

  if (!data) return null; // Solo mode or no partner

  const xpToNext = data.xpForNextLevel
    ? data.xpForNextLevel - data.xpForCurrentLevel
    : 0;
  const xpInLevel = data.totalXP - data.xpForCurrentLevel;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
      {/* Level header */}
      <div className="bg-gradient-to-r from-primary-container/40 via-secondary-container/30 to-tertiary-container/30 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest/80 backdrop-blur border border-outline-variant/50 shadow-sm flex items-center justify-center text-2xl">
              {data.levelEmoji}
            </div>
            <div>
              <p className="text-xs text-primary font-label font-medium uppercase tracking-wider">Level {data.level}</p>
              <h3 className="text-base font-headline font-bold text-on-surface">{data.levelTitle}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-headline font-bold text-on-surface">{data.totalXP.toLocaleString()}</p>
            <p className="text-[10px] text-primary font-label uppercase tracking-wider">Total XP</p>
          </div>
        </div>

        {/* XP progress bar */}
        {data.xpForNextLevel && (
          <div>
            <div className="flex justify-between text-[10px] text-primary font-label mb-1">
              <span>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
              <span>Level {data.level + 1}</span>
            </div>
            <div className="h-2.5 bg-surface-container-lowest/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700"
                style={{ width: `${Math.min(data.progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}
        {!data.xpForNextLevel && (
          <div className="text-center py-1">
            <p className="text-xs text-tertiary font-label font-medium">{'\u2726'} Max Level Reached {'\u2726'}</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-outline-variant border-b border-outline-variant">
        {/* Streak */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-headline font-bold text-on-surface">{data.streak}</p>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">day streak</p>
          {data.streakMultiplier > 1 && (
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-label font-bold bg-tertiary-container text-on-tertiary-container">
              {data.streakMultiplier}x XP
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-headline font-bold text-on-surface">{data.contribution.balance}%</p>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">balance</p>
        </div>

        {/* Bonus XP */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-headline font-bold text-primary">+{data.contribution.bonus}</p>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">bonus xp</p>
        </div>
      </div>

      {/* Contribution bar */}
      <div className="px-5 py-3 border-b border-outline-variant">
        <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-label mb-1.5">
          <span>You: {data.contribution.user} XP</span>
          <span>{data.partnerName}: {data.contribution.partner} XP</span>
        </div>
        <div className="h-2 bg-surface-container rounded-full overflow-hidden flex">
          {(data.contribution.user + data.contribution.partner) > 0 && (
            <>
              <div
                className="h-full bg-primary rounded-l-full transition-all"
                style={{ width: `${(data.contribution.user / (data.contribution.user + data.contribution.partner)) * 100}%` }}
              />
              <div
                className="h-full bg-tertiary-container rounded-r-full transition-all"
                style={{ width: `${(data.contribution.partner / (data.contribution.user + data.contribution.partner)) * 100}%` }}
              />
            </>
          )}
        </div>
        <p className="text-[10px] text-on-surface-variant font-body mt-1 text-center italic">
          {data.contribution.balance >= 80
            ? 'Great balance \u2014 you\'re both investing'
            : data.contribution.balance >= 50
              ? 'Good \u2014 keep encouraging each other'
              : 'One side is carrying more \u2014 that\'s okay, but check in'}
        </p>
      </div>

      {/* Bonus tip */}
      <div className="px-5 py-3 border-b border-outline-variant bg-primary-container/10">
        <p className="text-xs text-primary font-body">
          <span className="font-label font-medium">{'\u2726'} Bonus XP:</span>{' '}
          {data.isUser
            ? 'Journal entries (+8), all 3 journal prompts (+5 extra), reaching out after a flag (+8)'
            : 'Sending encouragement (+10), responding to alerts within 2 hours (+5)'}
        </p>
      </div>

      {/* Recent activity */}
      <div className="px-5 py-3">
        <button onClick={() => setShowActivity(!showActivity)}
          className="w-full flex items-center justify-between text-xs font-label font-medium text-on-surface-variant">
          <span>Recent Activity</span>
          <span>{showActivity ? '\u25BE' : '\u25B8'}</span>
        </button>
        {showActivity && data.recentActivity.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.earned_by === 'user' ? 'bg-primary' : 'bg-tertiary-container'}`} />
                  <span className="text-xs text-on-surface font-body">{a.description}</span>
                  {a.bonus && <span className="text-[9px] text-primary font-label font-medium bg-primary-container/30 px-1 rounded-full">bonus</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-label font-medium text-on-surface">+{a.amount}</span>
                  <span className="text-[10px] text-on-surface-variant font-label">{timeAgo(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showActivity && data.recentActivity.length === 0 && (
          <p className="text-xs text-on-surface-variant font-body text-center py-3">No activity yet &mdash; start using the app!</p>
        )}
      </div>

      {/* Level roadmap */}
      <div className="px-5 py-3 border-t border-outline-variant">
        <button onClick={() => setShowLevels(!showLevels)}
          className="w-full flex items-center justify-between text-xs font-label font-medium text-on-surface-variant">
          <span>Level Roadmap</span>
          <span>{showLevels ? '\u25BE' : '\u25B8'}</span>
        </button>
        {showLevels && (
          <div className="mt-2 space-y-1">
            {data.allLevels.map((l) => {
              const reached = data.level >= l.level;
              const current = data.level === l.level;
              return (
                <div key={l.level} className={`flex items-center gap-3 py-1.5 px-2 rounded-2xl ${current ? 'bg-primary-container/20 border border-primary-container/50' : ''}`}>
                  <span className={`text-base ${reached ? '' : 'grayscale opacity-40'}`}>{l.emoji}</span>
                  <div className="flex-1">
                    <span className={`text-xs font-label font-medium ${current ? 'text-primary' : reached ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      Lv {l.level}: {l.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-label ${reached ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {reached ? '\u2713' : `${l.xp.toLocaleString()} XP`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
