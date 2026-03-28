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
    <div className="card p-5">
      <div className="h-40 animate-pulse bg-gray-50 rounded-lg" />
    </div>
  );

  if (!data) return null; // Solo mode or no partner

  const xpToNext = data.xpForNextLevel
    ? data.xpForNextLevel - data.xpForCurrentLevel
    : 0;
  const xpInLevel = data.totalXP - data.xpForCurrentLevel;

  return (
    <div className="card p-0 overflow-hidden">
      {/* Level header */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-amber-50 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur border border-white/50 shadow-sm flex items-center justify-center text-2xl">
              {data.levelEmoji}
            </div>
            <div>
              <p className="text-xs text-violet-500 font-medium uppercase tracking-wider">Level {data.level}</p>
              <h3 className="text-base font-display font-semibold text-ink">{data.levelTitle}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-display font-bold text-ink">{data.totalXP.toLocaleString()}</p>
            <p className="text-[10px] text-violet-500 uppercase tracking-wider">Total XP</p>
          </div>
        </div>

        {/* XP progress bar */}
        {data.xpForNextLevel && (
          <div>
            <div className="flex justify-between text-[10px] text-violet-500 mb-1">
              <span>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
              <span>Level {data.level + 1}</span>
            </div>
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${Math.min(data.progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}
        {!data.xpForNextLevel && (
          <div className="text-center py-1">
            <p className="text-xs text-amber-600 font-medium">✦ Max Level Reached ✦</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-surface-border border-b border-surface-border">
        {/* Streak */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-display font-bold text-ink">{data.streak}</p>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">day streak</p>
          {data.streakMultiplier > 1 && (
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
              {data.streakMultiplier}x XP
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-display font-bold text-ink">{data.contribution.balance}%</p>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">balance</p>
        </div>

        {/* Bonus XP */}
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-display font-bold text-emerald-600">+{data.contribution.bonus}</p>
          <p className="text-[10px] text-ink-muted uppercase tracking-wider">bonus xp</p>
        </div>
      </div>

      {/* Contribution bar */}
      <div className="px-5 py-3 border-b border-surface-border">
        <div className="flex items-center justify-between text-[10px] text-ink-muted mb-1.5">
          <span>You: {data.contribution.user} XP</span>
          <span>{data.partnerName}: {data.contribution.partner} XP</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
          {(data.contribution.user + data.contribution.partner) > 0 && (
            <>
              <div
                className="h-full bg-violet-500 rounded-l-full transition-all"
                style={{ width: `${(data.contribution.user / (data.contribution.user + data.contribution.partner)) * 100}%` }}
              />
              <div
                className="h-full bg-amber-400 rounded-r-full transition-all"
                style={{ width: `${(data.contribution.partner / (data.contribution.user + data.contribution.partner)) * 100}%` }}
              />
            </>
          )}
        </div>
        <p className="text-[10px] text-ink-muted mt-1 text-center italic">
          {data.contribution.balance >= 80
            ? 'Great balance — you\'re both investing'
            : data.contribution.balance >= 50
              ? 'Good — keep encouraging each other'
              : 'One side is carrying more — that\'s okay, but check in'}
        </p>
      </div>

      {/* Bonus tip */}
      <div className="px-5 py-3 border-b border-surface-border bg-emerald-50/50">
        <p className="text-xs text-emerald-700">
          <span className="font-medium">✦ Bonus XP:</span>{' '}
          {data.isUser
            ? 'Journal entries (+8), all 3 Stringer prompts (+5 extra), reaching out after a flag (+8)'
            : 'Sending encouragement (+10), responding to alerts within 2 hours (+5)'}
        </p>
      </div>

      {/* Recent activity */}
      <div className="px-5 py-3">
        <button onClick={() => setShowActivity(!showActivity)}
          className="w-full flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>Recent Activity</span>
          <span>{showActivity ? '▾' : '▸'}</span>
        </button>
        {showActivity && data.recentActivity.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.earned_by === 'user' ? 'bg-violet-500' : 'bg-amber-400'}`} />
                  <span className="text-xs text-ink">{a.description}</span>
                  {a.bonus && <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1 rounded">bonus</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink">+{a.amount}</span>
                  <span className="text-[10px] text-ink-muted">{timeAgo(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showActivity && data.recentActivity.length === 0 && (
          <p className="text-xs text-ink-muted text-center py-3">No activity yet — start using the app!</p>
        )}
      </div>

      {/* Level roadmap */}
      <div className="px-5 py-3 border-t border-surface-border">
        <button onClick={() => setShowLevels(!showLevels)}
          className="w-full flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>Level Roadmap</span>
          <span>{showLevels ? '▾' : '▸'}</span>
        </button>
        {showLevels && (
          <div className="mt-2 space-y-1">
            {data.allLevels.map((l) => {
              const reached = data.level >= l.level;
              const current = data.level === l.level;
              return (
                <div key={l.level} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg ${current ? 'bg-violet-50 border border-violet-100' : ''}`}>
                  <span className={`text-base ${reached ? '' : 'grayscale opacity-40'}`}>{l.emoji}</span>
                  <div className="flex-1">
                    <span className={`text-xs font-medium ${current ? 'text-violet-700' : reached ? 'text-ink' : 'text-ink-muted'}`}>
                      Lv {l.level}: {l.title}
                    </span>
                  </div>
                  <span className={`text-[10px] ${reached ? 'text-emerald-600' : 'text-ink-muted'}`}>
                    {reached ? '✓' : `${l.xp.toLocaleString()} XP`}
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
