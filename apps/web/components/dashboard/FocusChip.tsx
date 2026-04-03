'use client';

import { useState } from 'react';

export interface FocusChipProps {
  milestone: number; // 1, 7, 14, 30, 60, 90, 180, 365
  achieved: boolean;
  achievedDate?: string;
  variant?: 'compact' | 'full';
  daysAway?: number;
  isNext?: boolean; // true for the next chip to earn — gets pulse glow
}

const CHIP_STYLES: Record<number, { gradient: string; label: string; ring: string }> = {
  1:   { gradient: 'from-gray-200 via-gray-300 to-gray-400', label: 'Silver', ring: 'ring-gray-300/60' },
  7:   { gradient: 'from-amber-200 via-amber-400 to-amber-500', label: 'Bronze', ring: 'ring-amber-400/60' },
  14:  { gradient: 'from-orange-300 via-orange-400 to-orange-600', label: 'Copper', ring: 'ring-orange-400/60' },
  30:  { gradient: 'from-yellow-300 via-yellow-400 to-yellow-500', label: 'Gold', ring: 'ring-yellow-400/60' },
  60:  { gradient: 'from-emerald-300 via-emerald-400 to-emerald-600', label: 'Emerald', ring: 'ring-emerald-400/60' },
  90:  { gradient: 'from-blue-300 via-blue-400 to-blue-600', label: 'Sapphire', ring: 'ring-blue-400/60' },
  180: { gradient: 'from-violet-300 via-violet-400 to-violet-600', label: 'Amethyst', ring: 'ring-violet-400/60' },
  365: { gradient: 'from-cyan-200 via-cyan-100 to-white', label: 'Diamond', ring: 'ring-cyan-300/60' },
};

export default function FocusChip({ milestone, achieved, achievedDate, variant = 'compact', daysAway, isNext }: FocusChipProps) {
  const [hovered, setHovered] = useState(false);
  const style = CHIP_STYLES[milestone] ?? CHIP_STYLES[1];
  const isCompact = variant === 'compact';
  const size = isCompact ? 'w-[120px] h-[120px]' : 'w-[200px] h-[200px]';

  if (!achieved) {
    return (
      <div
        className={`${isNext ? 'w-[140px] h-[140px]' : size} relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container/50 transition-all duration-300 cursor-default select-none ${isNext ? 'animate-pulse ring-2 ring-primary/20' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="font-headline text-3xl font-black text-on-surface-variant/25">?</span>
        <span className="text-[9px] font-label font-semibold text-on-surface-variant/30 uppercase tracking-wider mt-1">{milestone} days</span>
        {hovered && daysAway != null && daysAway > 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-on-surface/5 backdrop-blur-[2px]">
            <span className="text-xs font-label font-bold text-on-surface-variant">{daysAway} day{daysAway !== 1 ? 's' : ''} away</span>
          </div>
        )}
        {isNext && (
          <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[8px] font-label font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
            Next
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${size} relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} ring-2 ${style.ring} shadow-lg transition-all duration-300 cursor-default select-none group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -2px 6px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.1)',
        transform: hovered ? 'perspective(500px) rotateY(5deg) scale(1.04)' : 'perspective(500px) rotateY(0deg) scale(1)',
      }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
      </div>

      {/* Number */}
      <span
        className={`font-headline font-black text-white relative z-10 ${isCompact ? 'text-4xl' : 'text-6xl'} ${milestone === 365 ? 'text-cyan-700' : ''}`}
        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
      >
        {milestone}
      </span>

      {/* DAYS label */}
      <span
        className={`font-label font-bold uppercase tracking-[0.2em] relative z-10 ${isCompact ? 'text-[9px]' : 'text-xs'} ${milestone === 365 ? 'text-cyan-600' : 'text-white/90'}`}
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
      >
        Days
      </span>

      {/* Tier label */}
      <span
        className={`font-label font-semibold relative z-10 mt-0.5 ${isCompact ? 'text-[7px]' : 'text-[10px]'} ${milestone === 365 ? 'text-cyan-500' : 'text-white/60'} uppercase tracking-wider`}
      >
        {style.label}
      </span>

      {/* Achieved date */}
      {achievedDate && (
        <span className={`absolute bottom-1.5 font-label text-white/50 ${isCompact ? 'text-[7px]' : 'text-[9px]'}`}>
          {new Date(achievedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}
