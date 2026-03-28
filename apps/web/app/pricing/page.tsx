// ============================================================
// app/pricing/page.tsx
//
// Public pricing page. Linked from landing page.
// Shows three tiers with feature comparison.
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    emoji: '🌱',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Start your journey',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    features: [
      { text: 'Screen monitoring (16 categories)', included: true },
      { text: '1 accountability partner', included: true },
      { text: '3 AI conversation guides / month', included: true },
      { text: 'Manual journal (no AI prompts)', included: true },
      { text: 'Basic dashboard + streaks', included: true },
      { text: 'Solo mode', included: true },
      { text: 'Relationship level', included: true },
      { text: 'Crisis resource detection', included: true },
      { text: 'Journal reminders', included: false },
      { text: 'Weekly AI reflection', included: false },
      { text: 'Pattern detection', included: false },
      { text: 'Therapist portal', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⚡',
    monthlyPrice: 9.99,
    annualPrice: 99,
    description: 'Full accountability',
    cta: 'Start Free Trial',
    ctaHref: '/auth/signup?plan=pro',
    highlight: true,
    badge: '14 days free',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI conversation guides', included: true },
      { text: 'Up to 3 accountability partners', included: true },
      { text: 'Scheduled journal reminders', included: true },
      { text: 'Weekly AI reflection', included: true },
      { text: 'Vulnerability windows', included: true },
      { text: 'Pattern detection', included: true },
      { text: 'Conversation outcome tracking', included: true },
      { text: 'Spouse experience + Committed Contender', included: true },
      { text: 'Data export (JSON)', included: true },
      { text: '365-day data retention', included: true },
      { text: 'Therapist portal', included: false },
    ],
  },
  {
    id: 'therapy',
    name: 'Therapy',
    emoji: '🩺',
    monthlyPrice: 19.99,
    annualPrice: 179,
    description: 'For clinical partnerships',
    cta: 'Upgrade',
    ctaHref: '/auth/signup?plan=therapy',
    highlight: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Therapist portal (read-only)', included: true },
      { text: '5 granular consent toggles', included: true },
      { text: 'Extended data retention', included: true },
      { text: 'Priority AI generation', included: true },
      { text: 'PDF report formatting', included: true },
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-ink mb-3">Simple, honest pricing</h1>
          <p className="text-base text-ink-muted max-w-lg mx-auto">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 mt-6 bg-gray-100 rounded-full p-1">
            <button onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billing === 'monthly' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
              }`}>Monthly</button>
            <button onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billing === 'annual' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
              }`}>
              Annual <span className="text-brand text-xs ml-1">save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const price = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const period = billing === 'monthly' ? '/mo' : '/yr';

            return (
              <div key={tier.id} className={`rounded-2xl border p-6 relative ${
                tier.highlight ? 'border-brand shadow-lg shadow-brand/10 ring-1 ring-brand' : 'border-surface-border'
              }`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-[10px] font-bold uppercase tracking-wider">
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <span className="text-2xl">{tier.emoji}</span>
                  <h3 className="text-lg font-display font-semibold text-ink mt-2">{tier.name}</h3>
                  <p className="text-xs text-ink-muted">{tier.description}</p>
                  <div className="mt-3">
                    {price === 0 ? (
                      <p className="text-3xl font-display font-bold text-ink">Free</p>
                    ) : (
                      <>
                        <p className="text-3xl font-display font-bold text-ink">${price}</p>
                        <p className="text-xs text-ink-muted">{period}</p>
                        {billing === 'annual' && tier.monthlyPrice > 0 && (
                          <p className="text-[10px] text-ink-muted mt-0.5">
                            ${(tier.annualPrice / 12).toFixed(2)}/month
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${f.included ? 'text-emerald-500' : 'text-gray-300'}`}>
                        {f.included ? '✓' : '—'}
                      </span>
                      <span className={`text-xs ${f.included ? 'text-ink' : 'text-ink-muted/50'}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link href={tier.ctaHref}
                  className={`block w-full py-3 text-sm font-medium rounded-xl text-center transition-colors ${
                    tier.highlight
                      ? 'bg-brand text-white hover:bg-brand-dark'
                      : 'border border-surface-border text-ink hover:bg-gray-50'
                  }`}>
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-muted mt-8">
          All plans include end-to-end encryption, push notification privacy, and crisis resource detection.
        </p>

        <div className="text-center mt-12">
          <p className="text-sm text-ink-muted italic">
            "Freedom is found through kindness and curiosity." — Jay Stringer
          </p>
        </div>
      </div>
    </div>
  );
}
