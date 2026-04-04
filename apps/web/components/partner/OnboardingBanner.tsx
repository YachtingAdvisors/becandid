'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PartnerOnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('partner_onboarding_complete');
      if (!completed) {
        setVisible(true);
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/partner/onboarding"
      className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl ring-1 ring-primary/20 p-4 hover:ring-primary/40 hover:shadow-lg transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <span
          className="material-symbols-outlined text-primary text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          waving_hand
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-headline text-sm font-bold text-on-surface">
          New here? Take the 2-minute partner tour
        </span>
        <span className="text-primary ml-1 group-hover:ml-2 transition-all duration-200">
          &rarr;
        </span>
        <p className="text-xs text-on-surface-variant font-body mt-0.5">
          Learn what you can see, how to show up, and why your presence matters.
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          localStorage.setItem('partner_onboarding_complete', 'true');
          setVisible(false);
        }}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
        aria-label="Dismiss banner"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </Link>
  );
}
