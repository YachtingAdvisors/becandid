'use client';

import { useState, useEffect } from 'react';
import ShareButton from '@/components/ShareButton';

interface Milestone {
  milestone: string;
  unlocked_at: string;
}

const ALL_BADGES = [
  { key: 'focused_segments_10',  label: '10 Focused Segments',  icon: 'eco', tier: 'bronze' },
  { key: 'focused_segments_25',  label: '25 Focused Segments',  icon: 'park', tier: 'bronze' },
  { key: 'focused_segments_50',  label: '50 Focused Segments',  icon: 'forest', tier: 'silver' },
  { key: 'focused_segments_100', label: '100 Focused Segments', icon: 'landscape', tier: 'gold' },
  { key: 'full_days_7',          label: '7 Full Focused Days',  icon: 'star', tier: 'bronze' },
  { key: 'full_days_14',         label: '14 Full Focused Days', icon: 'stars', tier: 'silver' },
  { key: 'full_days_30',         label: '30 Full Focused Days', icon: 'auto_awesome', tier: 'gold' },
  { key: 'full_days_60',         label: '60 Full Focused Days', icon: 'local_fire_department', tier: 'gold' },
  { key: 'full_days_90',         label: '90 Full Focused Days', icon: 'crown', tier: 'platinum' },
  { key: 'points_100',           label: '100 Reputation Points',     icon: 'target', tier: 'bronze' },
  { key: 'points_500',           label: '500 Reputation Points',     icon: 'diamond', tier: 'silver' },
  { key: 'points_1000',          label: '1,000 Reputation Points',   icon: 'emoji_events', tier: 'gold' },
  { key: 'points_5000',          label: '5,000 Reputation Points',   icon: 'workspace_premium', tier: 'platinum' },
  { key: 'conversations_5',      label: '5 Conversations',      icon: 'chat', tier: 'bronze' },
  { key: 'conversations_10',     label: '10 Conversations',     icon: 'handshake', tier: 'silver' },
  { key: 'conversations_25',     label: '25 Conversations',     icon: 'favorite', tier: 'gold' },
  { key: 'streak_7',             label: '7-Day Streak',         icon: 'local_fire_department', tier: 'bronze' },
  { key: 'streak_30',            label: '30-Day Streak',        icon: 'bolt', tier: 'gold' },
  { key: 'streak_90',            label: '90-Day Streak',        icon: 'military_tech', tier: 'platinum' },
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
        <div className="h-8 bg-surface-container rounded w-32 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 animate-pulse"><div className="h-16 bg-surface-container-low rounded" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> Badges
        </h1>
        <p className="text-sm text-on-surface-variant font-body">
          {earnedCount} of {ALL_BADGES.length} earned. Keep going!
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-headline font-bold text-on-surface">{earnedCount}/{ALL_BADGES.length}</span>
          <span className="text-xs text-on-surface-variant font-label">{Math.round((earnedCount / ALL_BADGES.length) * 100)}% complete</span>
        </div>
        <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all"
            style={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }} />
        </div>
      </div>

      {/* Share progress CTA */}
      {earnedCount > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl ring-1 ring-primary/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-headline font-bold text-on-surface">Share your progress</p>
            <p className="text-xs text-on-surface-variant font-body mt-0.5">
              Inspire others with your {earnedCount} badge{earnedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <ShareButton
            url="/dashboard/badges"
            title={`I've earned ${earnedCount} badges on Be Candid!`}
            text={`I've earned ${earnedCount} of ${ALL_BADGES.length} badges on Be Candid - building digital accountability and aligning my life with my values.`}
          />
        </div>
      )}

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_BADGES.map(badge => {
          const isEarned = earned.has(badge.key);
          const milestone = milestones.find(m => m.milestone === badge.key);
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
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-[10px] text-on-surface-variant">
                    {new Date(milestone.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <ShareButton
                    url="/dashboard/badges"
                    title={`I earned the "${badge.label}" badge on Be Candid!`}
                    text={`Just unlocked the ${badge.label} badge (${badge.tier} tier) on Be Candid - building digital accountability one day at a time.`}
                    size="sm"
                  />
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
  );
}
