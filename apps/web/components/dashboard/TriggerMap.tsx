'use client';

import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface TriggerMapProps {
  triggers: Array<{
    tag: string;
    total: number;
    relapse_count: number;
    correlation: number; // 0-1
  }>;
  topPairs: Array<{
    tags: [string, string];
    count: number;
  }>;
}

// ─── Helpers ────────────────────────────────────────────────

function correlationColor(c: number): string {
  if (c >= 0.7) return 'bg-red-400/90 dark:bg-red-500/80';
  if (c >= 0.5) return 'bg-orange-400/80 dark:bg-orange-500/70';
  if (c >= 0.3) return 'bg-amber-300/70 dark:bg-amber-400/60';
  return 'bg-gray-300/80 dark:bg-gray-500/60';
}

function correlationTextColor(c: number): string {
  if (c >= 0.5) return 'text-white';
  return 'text-gray-800 dark:text-gray-100';
}

function bubbleSize(total: number, maxTotal: number): number {
  const minPx = 56;
  const maxPx = 120;
  if (maxTotal <= 1) return minPx;
  const ratio = total / maxTotal;
  return Math.round(minPx + (maxPx - minPx) * Math.sqrt(ratio));
}

// ─── Component ──────────────────────────────────────────────

export default function TriggerMap({ triggers, topPairs }: TriggerMapProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  // Empty state
  if (triggers.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">bubble_chart</span>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">No relapse patterns detected yet</h3>
        <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto">
          Keep journaling — patterns emerge over time. When you tag your journal entries, we will map which tags correlate most with relapses.
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...triggers.map(t => t.total), 1);
  const sorted = [...triggers].sort((a, b) => b.correlation - a.correlation);

  return (
    <div className="space-y-6">
      {/* Bubble chart */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 sm:p-6">
        <h3 className="font-headline text-base font-bold text-on-surface mb-1">Trigger Tags</h3>
        <p className="text-xs font-body text-on-surface-variant mb-5">
          Size = frequency. Color = relapse correlation (gray = low, red = high).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {sorted.map(trigger => {
            const size = bubbleSize(trigger.total, maxTotal);
            const isHovered = hoveredTag === trigger.tag;

            return (
              <div
                key={trigger.tag}
                className={`
                  relative rounded-full flex flex-col items-center justify-center
                  transition-all duration-200 cursor-default select-none
                  ${correlationColor(trigger.correlation)}
                  ${isHovered ? 'scale-110 shadow-lg z-10' : 'shadow-sm'}
                `}
                style={{ width: size, height: size }}
                onMouseEnter={() => setHoveredTag(trigger.tag)}
                onMouseLeave={() => setHoveredTag(null)}
              >
                <span className={`text-xs font-label font-bold leading-tight text-center px-1 ${correlationTextColor(trigger.correlation)}`}>
                  {trigger.tag}
                </span>
                {isHovered && (
                  <span className={`text-[10px] font-label font-medium mt-0.5 ${correlationTextColor(trigger.correlation)}`}>
                    {Math.round(trigger.correlation * 100)}% relapse
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Correlation legend */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <span className="text-[10px] font-label text-on-surface-variant/60">Low risk</span>
          <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-500" />
          <div className="w-4 h-4 rounded bg-amber-300 dark:bg-amber-400" />
          <div className="w-4 h-4 rounded bg-orange-400 dark:bg-orange-500" />
          <div className="w-4 h-4 rounded bg-red-400 dark:bg-red-500" />
          <span className="text-[10px] font-label text-on-surface-variant/60">High risk</span>
        </div>
      </div>

      {/* Co-occurrence pairs */}
      {topPairs.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 sm:p-6">
          <h3 className="font-headline text-base font-bold text-on-surface mb-1">Common Tag Pairs During Relapses</h3>
          <p className="text-xs font-body text-on-surface-variant mb-4">
            Tags that frequently appear together on relapse journal entries.
          </p>

          <div className="space-y-2">
            {topPairs.map((pair, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-surface-container-low"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-error/70">link</span>
                  <span className="text-sm font-label font-medium text-on-surface">
                    {pair.tags[0]} + {pair.tags[1]}
                  </span>
                </div>
                <span className="text-xs font-label font-medium text-on-surface-variant">
                  {pair.count} time{pair.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
