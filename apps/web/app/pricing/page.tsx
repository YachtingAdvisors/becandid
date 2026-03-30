'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIER_ICONS: Record<string, string> = {
  free: 'eco',
  pro: 'bolt',
  therapy: 'medical_services',
};

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Begin aligning',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    features: [
      { text: 'Screen awareness (16 categories)', included: true },
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
    monthlyPrice: 9.99,
    annualPrice: 99,
    description: 'Full alignment',
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
    <div className="min-h-screen bg-[#fbf9f8]">
      <div className="max-w-screen-2xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16 max-w-5xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-primary mb-4">
            Pricing
          </p>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
            Invest in your integrity
          </h1>
          <p className="text-base text-on-surface-variant max-w-lg mx-auto font-body leading-relaxed">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 bg-surface-container rounded-full p-1.5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-label font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-surface-container-lowest text-on-surface shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2.5 rounded-full text-sm font-label font-semibold transition-all ${
                billing === 'annual'
                  ? 'bg-surface-container-lowest text-on-surface shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Annual{' '}
              <span className="text-primary text-xs font-bold ml-1">
                save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier) => {
            const price =
              billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const period = billing === 'monthly' ? '/mo' : '/yr';

            return (
              <div
                key={tier.id}
                className={`rounded-[2rem] p-7 relative transition-shadow ${
                  tier.highlight
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-surface-container-lowest shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-tertiary-container text-tertiary text-[10px] font-bold font-label uppercase tracking-wider">
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-8 pt-2">
                  <span
                    className={`material-symbols-outlined text-3xl ${
                      tier.highlight ? 'text-on-primary' : 'text-primary'
                    }`}
                  >
                    {TIER_ICONS[tier.id]}
                  </span>
                  <h3
                    className={`text-xl font-headline font-bold mt-3 ${
                      tier.highlight ? 'text-on-primary' : 'text-on-surface'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-xs font-body mt-1 ${
                      tier.highlight
                        ? 'text-on-primary/70'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="mt-4">
                    {price === 0 ? (
                      <p
                        className={`text-4xl font-headline font-extrabold tracking-tight ${
                          tier.highlight ? 'text-on-primary' : 'text-on-surface'
                        }`}
                      >
                        Free
                      </p>
                    ) : (
                      <>
                        <p
                          className={`text-4xl font-headline font-extrabold tracking-tight ${
                            tier.highlight
                              ? 'text-on-primary'
                              : 'text-on-surface'
                          }`}
                        >
                          ${price}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            tier.highlight
                              ? 'text-on-primary/70'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {period}
                        </p>
                        {billing === 'annual' && tier.monthlyPrice > 0 && (
                          <p
                            className={`text-[10px] mt-0.5 ${
                              tier.highlight
                                ? 'text-on-primary/60'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            ${(tier.annualPrice / 12).toFixed(2)}/month
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 ${
                          tier.highlight
                            ? f.included
                              ? 'text-on-primary'
                              : 'text-on-primary/30'
                            : f.included
                              ? 'text-primary'
                              : 'text-outline-variant'
                        }`}
                      >
                        {f.included ? 'check' : 'remove'}
                      </span>
                      <span
                        className={`text-xs font-body leading-relaxed ${
                          tier.highlight
                            ? f.included
                              ? 'text-on-primary'
                              : 'text-on-primary/40'
                            : f.included
                              ? 'text-on-surface'
                              : 'text-on-surface-variant/50'
                        }`}
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`block w-full py-3.5 text-sm font-headline font-bold rounded-full text-center transition-all ${
                    tier.highlight
                      ? 'bg-on-primary text-primary hover:opacity-90'
                      : 'bg-secondary-container text-on-surface hover:opacity-90'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="max-w-5xl mx-auto mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary">
              lock
            </span>
            <p className="text-xs font-body">
              All plans include end-to-end encryption, push notification
              privacy, crisis resource detection, and tools for digital
              integrity.
            </p>
          </div>
        </div>

        <div className="text-center mt-14">
          <p className="text-sm text-on-surface-variant italic font-body">
            &ldquo;Freedom is found through kindness and curiosity.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
