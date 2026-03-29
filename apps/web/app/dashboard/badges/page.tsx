'use client';

import { useState, useEffect } from 'react';

interface Milestone {
  milestone: string;
  unlocked_at: string;
}

const ALL_BADGES = [
  { key: 'focused_segments_10',  label: '10 Focused Segments',  icon: '🌱', tier: 'bronze' },
  { key: 'focused_segments_25',  label: '25 Focused Segments',  icon: '🌿', tier: 'bronze' },
  { key: 'focused_segments_50',  label: '50 Focused Segments',  icon: '🌳', tier: 'silver' },
  { key: 'focused_segments_100', label: '100 Focused Segments', icon: '🏔️', tier: 'gold' },
  { key: 'full_days_7',          label: '7 Full Focused Days',  icon: '⭐', tier: 'bronze' },
  { key: 'full_days_14',         label: '14 Full Focused Days', icon: '🌟', tier: 'silver' },
  { key: 'full_days_30',         label: '30 Full Focused Days', icon: '💫', tier: 'gold' },
  { key: 'full_days_60',         label: '60 Full Focused Days', icon: '🔥', tier: 'gold' },
  { key: 'full_days_90',         label: '90 Full Focused Days', icon: '👑', tier: 'platinum' },
  { key: 'points_100',           label: '100 Trust Points',     icon: '🎯', tier: 'bronze' },
  { key: 'points_500',           label: '500 Trust Points',     icon: '💎', tier: 'silver' },
  { key: 'points_1000',          label: '1,000 Trust Points',   icon: '🏆', tier: 'gold' },
  { key: 'points_5000',          label: '5,000 Trust Points',   icon: '🦁', tier: 'platinum' },
  { key: 'conversations_5',      label: '5 Conversations',      icon: '💬', tier: 'bronze' },
  { key: 'conversations_10',     label: '10 Conversations',     icon: '🤝', tier: 'silver' },
  { key: 'conversations_25',     label: '25 Conversations',     icon: '❤️', tier: 'gold' },
  { key: 'streak_7',             label: '7-Day Streak',         icon: '🔥', tier: 'bronze' },
  { key: 'streak_30',            label: '30-Day Streak',        icon: '⚡', tier: 'gold' },
  { key: 'streak_90',            label: '90-Day Streak',        icon: '🏅', tier: 'platinum' },
];

const TIER_STYLES = {
  bronze:   { bg: 'bg-amber-50',    border: 'border-amber-300',  text: 'text-amber-800' },
  silver:   { bg: 'bg-gray-50',     border: 'border-gray-300',   text: 'text-gray-700' },
  gold:     { bg: 'bg-yellow-50',   border: 'border-yellow-400', text: 'text-yellow-800' },
  platinum: { bg: 'bg-violet-50',   border: 'border-violet-300', text: 'text-violet-800' },
};

export default function BadgesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trust-points/stats')
      .then(r => r.json())
      .then(d => setMilestones(d.milestones ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earned = new Set(milestones.map(m => m.milestone));
  const earnedCount = earned.size;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-16 bg-gray-100 rounded" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">🏅 Badges</h1>
        <p className="text-sm text-on-surface-variant font-body">
          {earnedCount} of {ALL_BADGES.length} earned. Keep going!
        </p>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface">{earnedCount}/{ALL_BADGES.length}</span>
          <span className="text-xs text-on-surface-variant">{Math.round((earnedCount / ALL_BADGES.length) * 100)}% complete</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all"
            style={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }} />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_BADGES.map(badge => {
          const isEarned = earned.has(badge.key);
          const milestone = milestones.find(m => m.milestone === badge.key);
          const tier = TIER_STYLES[badge.tier as keyof typeof TIER_STYLES];

          return (
            <div key={badge.key}
              className={`card p-4 text-center transition-all ${
                isEarned
                  ? `${tier.bg} ${tier.border} border-2 shadow-sm`
                  : 'opacity-40 grayscale'
              }`}
            >
              <div className={`text-3xl mb-2 ${isEarned ? '' : 'filter blur-[1px]'}`}>
                {isEarned ? badge.icon : '🔒'}
              </div>
              <div className={`text-xs font-semibold ${isEarned ? tier.text : 'text-gray-400'}`}>
                {badge.label}
              </div>
              {isEarned && milestone && (
                <div className="text-[10px] text-on-surface-variant mt-1">
                  {new Date(milestone.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
              {!isEarned && (
                <div className="text-[10px] text-gray-400 mt-1 capitalize">{badge.tier}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
