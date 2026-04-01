// ============================================================
// components/dashboard/SpouseImpactAwareness.tsx
//
// Shown on the USER's dashboard (not the spouse's).
// Displays ONLY data the spouse has consented to share.
//
// Purpose: build empathy. The user sees:
//   - Trust trend (rebuilding / stable / declining)
//   - Spouse's feelings (aggregated, not raw entries)
//   - Shared journal entries (only ones spouse chose to share)
//   - A reminder that their spouse is affected by this
//
// This is NOT surveillance of the spouse. It's the spouse
// choosing to let their partner see the impact.
// ============================================================

'use client';

import { useState, useEffect } from 'react';

const FEELING_EMOJIS: Record<string, string> = {
  hurt: 'heart_broken', angry: 'sentiment_very_dissatisfied', numb: 'sentiment_neutral', anxious: 'psychology_alt',
  hopeful: 'eco', exhausted: 'bedtime', betrayed: 'heart_broken', lonely: 'sentiment_dissatisfied',
  determined: 'fitness_center', loved: 'favorite', confused: 'help', healing: 'healing',
};

const TRUST_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  rebuilding: { label: 'Trust rebuilding', color: 'text-emerald-600', emoji: 'trending_up' },
  stable: { label: 'Trust holding steady', color: 'text-amber-600', emoji: 'trending_flat' },
  declining: { label: 'Trust declining', color: 'text-red-600', emoji: 'trending_down' },
  unknown: { label: 'Not enough data yet', color: 'text-on-surface-variant', emoji: 'remove' },
};

export default function SpouseImpactAwareness() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spouse-impact')
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5"><div className="h-32 animate-pulse bg-surface-container-low rounded-lg" /></div>;
  if (!data || !data.is_spouse_relationship) return null;

  const trust = TRUST_LABELS[data.trust_trend] || TRUST_LABELS.unknown;

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 px-5 py-4 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">loyalty</span>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">How {data.spouse_name} is doing</h3>
            <p className="text-xs text-on-surface-variant">Your spouse's experience matters in this journey</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Trust trend */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-on-surface">Trust trend</span>
          <span className={`text-sm font-medium ${trust.color}`}>
            <span className="material-symbols-outlined text-base align-middle">{trust.emoji}</span> {trust.label}
          </span>
        </div>

        {/* Recent feelings (aggregated from consented impact check-ins) */}
        {data.recent_feelings && data.recent_feelings.length > 0 && (
          <div>
            <p className="text-xs text-on-surface-variant mb-2">What they've been feeling recently</p>
            <div className="flex flex-wrap gap-1.5">
              {data.recent_feelings.map((feeling: string) => (
                <span key={feeling} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-container-low text-on-surface border border-outline-variant">
                  <span className="material-symbols-outlined text-sm">{FEELING_EMOJIS[feeling] || 'circle'}</span> {feeling}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shared journal entries */}
        {data.shared_entries && data.shared_entries.length > 0 && (
          <div>
            <p className="text-xs text-on-surface-variant mb-2">{data.spouse_name} chose to share this with you</p>
            {data.shared_entries.slice(0, 2).map((entry: any) => (
              <div key={entry.id} className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 mb-2">
                <p className="text-xs text-on-surface-variant mb-1">
                  {new Date(entry.shared_at || entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-on-surface leading-relaxed">
                  {(entry.freewrite || entry.impact || entry.needs || '').slice(0, 200)}
                  {(entry.freewrite || entry.impact || entry.needs || '').length > 200 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empathy prompt */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-800 leading-relaxed italic">
            {data.trust_trend === 'declining'
              ? "Your spouse's trust is declining. The next conversation matters more than the last failure. Ask them what they need."
              : data.trust_trend === 'rebuilding'
                ? "Trust is rebuilding. That's happening because both of you are showing up. Don't take it for granted."
                : "Every time you choose honesty over hiding, you're making a deposit in the trust account. Keep going."}
          </p>
        </div>

        {/* Spouse contender level */}
        {data.contender_level > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
            <span className="material-symbols-outlined text-xl">{data.contender_level >= 3 ? 'swords' : data.contender_level >= 2 ? 'fitness_center' : 'eco'}</span>
            <div>
              <p className="text-xs text-violet-600 font-medium">
                {data.spouse_name} is a Committed Contender
                {data.contender_level >= 3 ? ' — Level 3' : data.contender_level >= 2 ? ' — Level 2' : ''}
              </p>
              <p className="text-[11px] text-violet-500">
                They're choosing to fight for this relationship. That choice costs them something every day.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
