'use client';

import { useState, useEffect } from 'react';

interface Props {
  milestone: number; // days
  userName: string;
  communityCount?: number; // how many others reached this milestone
  onDismiss: () => void;
}

const MILESTONE_MESSAGES: Record<number, { title: string; subtitle: string; icon: string }> = {
  1: { title: 'Day One', subtitle: 'The hardest step is the first one. You took it.', icon: 'flag' },
  3: { title: '3 Day Streak', subtitle: 'Three days of showing up. Momentum is building.', icon: 'bolt' },
  7: { title: 'One Week', subtitle: 'A full week of integrity. Your brain is rewiring.', icon: 'star' },
  14: { title: 'Two Weeks', subtitle: 'Patterns are shifting. This is real.', icon: 'workspace_premium' },
  30: { title: 'One Month', subtitle: 'Thirty days. You\'re becoming someone new.', icon: 'emoji_events' },
  60: { title: 'Two Months', subtitle: 'The old patterns are loosening their grip.', icon: 'diamond' },
  90: { title: '90 Days', subtitle: 'A quarter year of growth. This changes everything.', icon: 'military_tech' },
  180: { title: 'Six Months', subtitle: 'Half a year of climbing. You inspire others.', icon: 'local_fire_department' },
  365: { title: 'One Year', subtitle: 'A full revolution around the sun, lived with integrity.', icon: 'public' },
};

export default function MilestoneCelebration({ milestone, userName, communityCount, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const msg = MILESTONE_MESSAGES[milestone] ?? {
    title: `${milestone} Days`,
    subtitle: 'Every day you show up, you\'re climbing.',
    icon: 'military_tech',
  };

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300 ${
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <div className={`relative bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/20 shadow-2xl max-w-sm w-full p-8 text-center transition-all duration-500 ${
        visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
      }`}>
        {/* Glow ring */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-500/10 to-cyan-500/20 blur-xl -z-10" />

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{msg.icon}</span>
        </div>

        {/* Content */}
        <h2 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">{msg.title}</h2>
        <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed max-w-xs mx-auto">{msg.subtitle}</p>

        {/* Community context */}
        {communityCount && communityCount > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/5 ring-1 ring-primary/10 mx-auto w-fit">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            <span className="text-xs font-label font-semibold text-primary">
              {communityCount.toLocaleString()} others reached this milestone too
            </span>
          </div>
        )}

        {/* Name */}
        <p className="text-xs text-on-surface-variant/60 font-label mt-4">
          Keep climbing, {userName}.
        </p>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">celebration</span>
          Keep Going
        </button>
      </div>
    </div>
  );
}
