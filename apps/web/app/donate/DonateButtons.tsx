'use client';

import { useState } from 'react';

const SUPPORT_TIERS = [
  {
    amount: 5,
    name: 'Believer',
    icon: 'handshake',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    perks: 'Name in Discord supporters channel',
  },
  {
    amount: 15,
    name: 'Builder',
    icon: 'construction',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    perks: 'Early access to new features + Builder role in Discord',
  },
  {
    amount: 25,
    name: 'Champion',
    icon: 'military_tech',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    perks: 'Everything above + monthly call with the founder',
  },
  {
    amount: 0,
    name: 'One-Time',
    icon: 'favorite',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    perks: 'One-time donations always welcome',
  },
];

const IMPACT_TIERS = [
  { amount: 10, label: '1 student for a year', icon: 'person' },
  { amount: 50, label: '5 students for a year', icon: 'group' },
  { amount: 100, label: 'A classroom', icon: 'school' },
  { amount: 250, label: 'A grade level', icon: 'diversity_3' },
  { amount: 500, label: 'A school program', icon: 'apartment' },
  { amount: 0, label: 'Custom amount', icon: 'edit' },
];

async function startDonation(amount: number) {
  const res = await fetch('/api/billing/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else if (res.status === 401) {
    // User not logged in — redirect to sign up then back
    window.location.href = '/auth/signup?redirect=/donate';
  } else {
    alert('Something went wrong. Please try again or email shawn@becandid.io.');
  }
}

export default function DonateButtons({ section }: { section: 'support' | 'impact' }) {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);

  const handleClick = async (amount: number) => {
    if (amount === 0) {
      // Custom amount — prompt the user
      const input = prompt('Enter a custom donation amount (USD):');
      if (!input) return;
      const parsed = parseFloat(input);
      if (isNaN(parsed) || parsed < 1) {
        alert('Please enter a valid amount of at least $1.');
        return;
      }
      amount = parsed;
    }
    setLoadingAmount(amount);
    try {
      await startDonation(amount);
    } finally {
      setLoadingAmount(null);
    }
  };

  if (section === 'support') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUPPORT_TIERS.map((tier) => (
          <button
            key={tier.name}
            onClick={() => handleClick(tier.amount)}
            disabled={loadingAmount !== null}
            className={`group rounded-3xl border p-5 text-center hover:ring-2 hover:ring-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 ${tier.color}`}
          >
            <span className="material-symbols-outlined text-3xl mb-2 block group-hover:scale-110 transition-transform">
              {tier.icon}
            </span>
            <p className="font-headline text-xl font-extrabold">
              {tier.amount > 0 ? `$${tier.amount}/mo` : 'Any amount'}
            </p>
            <p className="font-headline text-sm font-bold mt-0.5">{tier.name}</p>
            <p className="text-xs font-body mt-2 leading-relaxed opacity-80">{tier.perks}</p>
            {loadingAmount !== null && loadingAmount === tier.amount && (
              <p className="text-xs font-body mt-1 opacity-60">Opening checkout...</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {IMPACT_TIERS.map((tier) => (
        <button
          key={tier.amount || 'custom'}
          onClick={() => handleClick(tier.amount)}
          disabled={loadingAmount !== null}
          className="group bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 text-center hover:ring-2 hover:ring-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-3xl text-primary mb-2 block group-hover:scale-110 transition-transform">
            {tier.icon}
          </span>
          {tier.amount > 0 ? (
            <p className="font-headline text-2xl font-extrabold text-on-surface">${tier.amount}</p>
          ) : (
            <p className="font-headline text-lg font-extrabold text-on-surface">Your choice</p>
          )}
          <p className="text-xs text-on-surface-variant font-body mt-1">{tier.label}</p>
          {loadingAmount !== null && loadingAmount === tier.amount && (
            <p className="text-xs font-body mt-1 opacity-60">Opening checkout...</p>
          )}
        </button>
      ))}
    </div>
  );
}
