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
  journalReminders: { title: 'Journal Reminders', description: 'Scheduled journal prompts that meet you where you are', emoji: 'notifications' },
  weeklyReflection: { title: 'Weekly AI Reflection', description: 'Claude reads your week and generates a personalized narrative', emoji: 'auto_awesome' },
  vulnerabilityWindows: { title: 'Vulnerability Windows', description: 'Pre-schedule times you know you\'re at risk', emoji: 'schedule' },
  patternDetection: { title: 'Pattern Detection', description: 'AI finds your time clusters, triggers, and frequency patterns', emoji: 'insights' },
  conversationOutcomes: { title: 'Conversation Outcomes', description: 'Track how conversations go and build a growth narrative', emoji: 'forum' },
  therapistPortal: { title: 'Therapist Portal', description: 'Inpatient-level insights without the inpatient setting — share journals, mood data, streaks & outcomes with granular consent', emoji: 'medical_services' },
  dataExportJson: { title: 'Data Export', description: 'Export all your data as JSON anytime', emoji: 'inventory_2' },
  spouseExperience: { title: 'Spouse Experience', description: 'Betrayal-informed tools, impact check-ins, and Committed Contender milestones', emoji: 'loyalty' },
  aiGuidesLimit: { title: 'Unlimited AI Guides', description: 'You\'ve used your 3 free guides this month', emoji: 'smart_toy' },
  partnerLimit: { title: 'Multiple Partners', description: 'Add up to 3 accountability partners with priority levels', emoji: 'handshake' },
};

const BETA_MODE = true;

export default function Paywall({
  feature,
  requiredPlan = 'pro',
}: {
  feature: Feature;
  requiredPlan?: 'pro' | 'therapy';
}) {
  if (BETA_MODE) return null; // Don't show paywall during beta

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
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-0 overflow-hidden border-primary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-violet-50 px-5 py-5 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-2xl">{info.emoji}</span>
          <div>
            <h3 className="text-base font-headline font-semibold text-on-surface">{info.title}</h3>
            <p className="text-sm text-on-surface-variant">{info.description}</p>
          </div>
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700">
            This feature is available on the <strong>{requiredPlan === 'therapy' ? 'Therapy' : 'Pro'}</strong> plan.
            {requiredPlan === 'pro' && ' Includes a 21-day free trial.'}
          </p>
        </div>
      </div>

      {/* Plan toggle + CTA */}
      <div className="px-5 py-5">
        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => setBilling('monthly')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              billing === 'monthly' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}>Monthly</button>
          <button onClick={() => setBilling('annual')}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              billing === 'annual' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            Annual <span className="text-[10px] opacity-80">save 17%</span>
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-4">
          {requiredPlan === 'pro' ? (
            <>
              <p className="text-3xl font-headline font-bold text-on-surface">
                {billing === 'monthly' ? '$9.99' : '$99'}
              </p>
              <p className="text-xs text-on-surface-variant">
                {billing === 'monthly' ? '/month' : '/year ($8.25/month)'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-headline font-bold text-on-surface">
                {billing === 'monthly' ? '$19.99' : '$179'}
              </p>
              <p className="text-xs text-on-surface-variant">
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
            'Everything in Pro, plus therapist portal access',
            'Share journal entries, mood data, streaks & outcomes',
            'Granular consent controls — you decide what they see',
            'Real-time patterns & digital triggers for your therapist',
            'Extended data retention + priority AI generation',
          ]).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check</span>
              <span className="text-xs text-on-surface">{item}</span>
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
          className="w-full py-3 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary disabled:opacity-50 transition-colors"
        >
          {loading ? 'Opening checkout…' : requiredPlan === 'pro' ? 'Start 21-Day Free Trial' : 'Upgrade to Therapy'}
        </button>

        <p className="text-center text-[10px] text-on-surface-variant mt-2">Cancel anytime. No commitment.</p>
      </div>
    </div>
  );
}
