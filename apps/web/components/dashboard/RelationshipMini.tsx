// ============================================================
// components/dashboard/RelationshipMini.tsx
//
// Compact version for the dashboard overview grid.
// Shows: level emoji + title, XP ring, streak badge.
// Taps through to full relationship view.
//
// Usage:
//   <RelationshipMini />
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RelationshipMini() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/relationship')
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card p-4">
      <div className="h-20 animate-pulse bg-gray-50 rounded-lg" />
    </div>
  );

  if (!data) return null;

  // SVG progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = data.progressToNext / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <Link href="/dashboard/partner" className="card p-4 hover:border-brand/30 transition-colors block">
      <div className="flex items-center gap-4">
        {/* Progress ring with level emoji */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="3" />
            <circle
              cx="32" cy="32" r={radius} fill="none"
              stroke="url(#grad)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            {data.levelEmoji}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs text-violet-500 font-medium">Level {data.level}</p>
            {data.streakMultiplier > 1 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                {data.streakMultiplier}x
              </span>
            )}
          </div>
          <p className="text-sm font-display font-semibold text-ink truncate">{data.levelTitle}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {data.totalXP.toLocaleString()} XP
            {data.streak > 0 && <span className="text-amber-600"> · {data.streak}d streak</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
