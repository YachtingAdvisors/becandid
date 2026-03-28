// ============================================================
// components/dashboard/Paywall.tsx
//
// Shown when a user tries to access a gated feature.
// Displays plan comparison and checkout CTA.
//
// Usage:
//   <Paywall feature="journalReminders" />
//   <Paywall feature="therapistPortal" requiredPlan="therapy" />
// ============================================================

'use client';

import { useState } from 'react';

type Feature =
  | 'journalReminders' | 'weeklyReflection' | 'vulnerabilityWindows'
  | 'patternDetection' | 'conversationOutcomes' | 'therapistPortal'
  | 'dataExportJson' | 'spouseExperience' | 'aiGuidesLimit' | 'partnerLimit';

const FEATURE_COPY: Record<Feature, { title: string; description: string; emoji: string }> = {
  journalReminders: { title: 'Journal Reminders', description: 'Scheduled Stringer prompts that meet you where you are', emoji: '🔔' },
  weeklyReflection: { title: 'Weekly AI Reflection', description: 'Claude reads your week and generates a personalized narrative', emoji: '✨' },
  vulnerabilityWindows: { title: 'Vulnerability Windows', description: 'Pre-schedule times you know you\'re at risk', emoji: '🕐' },
  patternDetection: { title: 'Pattern Detection', description: 'AI finds your time clusters, triggers, and frequency patterns', emoji: '📊' },
  conversationOutcomes: { title: 'Conversation Outcomes', description: 'Track how conversations go and build a growth narrative', emoji: '💬' },
  therapistPortal: { title: 'Therapist Portal', description: 'Give your counselor read-only access to your journal and progress', emoji: '🩺' },
  dataExportJson: { title: 'Data Export', description: 'Export all your data as JSON anytime', emoji: '📦' },
  spouseExperience: { title: 'Spouse Experience', description: 'Betrayal-informed tools, impact check-ins, and Committed Contender milestones', emoji: '💍' },
  aiGuidesLimit: { title: 'Unlimited AI Guides', description: 'You\'ve used your 3 free guides this month', emoji: '🤖' },
  partnerLimit: { title: 'Multiple Partners', description: 'Add up to 3 accountability partners with priority levels', emoji: '🤝' },
};

export default function Paywall({
  feature,
  requiredPlan = 'pro',
}: {
  feature: Feature;
  requiredPlan?: 'pro' | 'therapy';
}) {
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  const info = FEATURE_COPY[feature];

  const checkout = async (priceKey: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="card p-0 overflow-hidden border-brand/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand/5 to-violet-50 px-5 py-5 border-b border-brand/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <h3 className="text-base font-display font-semibold text-ink">{info.title}</h3>
            <p className="text-sm text-ink-muted">{info.description}</p>
          </div>
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700">
            This feature is available on the <strong>{requiredPlan === 'therapy' ? 'Therapy' : 'Pro'}</strong> plan.
            {requiredPlan === 'pro' && ' Includes a 14-day free trial.'}
          </p>
        </div>
      </div>

      {/* Plan toggle + CTA */}
      <div className="px-5 py-5">
        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => setBilling('monthly')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              billing === 'monthly' ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
            }`}>Monthly</button>
          <button onClick={() => setBilling('annual')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              billing === 'annual' ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
            }`}>
            Annual <span className="text-[10px] opacity-80">save 17%</span>
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-4">
          {requiredPlan === 'pro' ? (
            <>
              <p className="text-3xl font-display font-bold text-ink">
                {billing === 'monthly' ? '$9.99' : '$99'}
              </p>
              <p className="text-xs text-ink-muted">
                {billing === 'monthly' ? '/month' : '/year ($8.25/month)'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-display font-bold text-ink">
                {billing === 'monthly' ? '$19.99' : '$179'}
              </p>
              <p className="text-xs text-ink-muted">
                {billing === 'monthly' ? '/month' : '/year ($14.92/month)'}
              </p>
            </>
          )}
        </div>

        {/* What's included */}
        <div className="mb-4 space-y-1.5">
          {(requiredPlan === 'pro' ? [
            'Unlimited AI conversation guides',
            'Scheduled journal reminders',
            'Weekly AI reflections',
            'Up to 3 accountability partners',
            'Pattern detection + vulnerability windows',
            'Spouse experience with Committed Contender',
            'Conversation outcomes tracking',
            'Data export',
          ] : [
            'Everything in Pro',
            'Therapist portal with consent controls',
            'Extended data retention (365 days)',
            'Priority AI guide generation',
          ]).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs">✓</span>
              <span className="text-xs text-ink">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            const key = requiredPlan === 'pro'
              ? (billing === 'monthly' ? 'pro_monthly' : 'pro_annual')
              : (billing === 'monthly' ? 'therapy_monthly' : 'therapy_annual');
            // The actual price IDs come from the billing API
            checkout(key);
          }}
          disabled={loading}
          className="w-full py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Opening checkout…' : requiredPlan === 'pro' ? 'Start 14-Day Free Trial' : 'Upgrade to Therapy'}
        </button>

        <p className="text-center text-[10px] text-ink-muted mt-2">Cancel anytime. No commitment.</p>
      </div>
    </div>
  );
}
