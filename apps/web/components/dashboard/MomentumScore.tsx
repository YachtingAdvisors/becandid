'use client';

import { useEffect, useState, useCallback } from 'react';

interface MomentumBreakdown {
  streak: number;
  journal: number;
  checkin: number;
  mood: number;
}

interface MomentumData {
  score: number;
  breakdown: MomentumBreakdown;
  trend: 'rising' | 'falling' | 'stable';
  sparkline: number[];
}

// ─── Sparkline SVG builder ──────────────────────────────────

function buildSparklinePath(
  data: number[],
  width: number,
  height: number,
  padding: number = 2,
): string {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y =
      padding + (1 - (val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // Build smooth path with cubic bezier curves
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

// ─── Color helpers ──────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreStroke(score: number): string {
  if (score >= 70) return '#059669';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

function getScoreTrack(score: number): string {
  if (score >= 70) return 'rgba(5, 150, 105, 0.15)';
  if (score >= 40) return 'rgba(217, 119, 6, 0.15)';
  return 'rgba(220, 38, 38, 0.15)';
}

function getTrendIcon(trend: 'rising' | 'falling' | 'stable'): string {
  if (trend === 'rising') return 'trending_up';
  if (trend === 'falling') return 'trending_down';
  return 'trending_flat';
}

function getTrendColor(trend: 'rising' | 'falling' | 'stable'): string {
  if (trend === 'rising') return 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'falling') return 'text-red-600 dark:text-red-400';
  return 'text-on-surface-variant';
}

function getTrendLabel(trend: 'rising' | 'falling' | 'stable'): string {
  if (trend === 'rising') return 'Rising';
  if (trend === 'falling') return 'Falling';
  return 'Stable';
}

// ─── Component ──────────────────────────────────────────────

export default function MomentumScore() {
  const [data, setData] = useState<MomentumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/momentum')
      .then((res) => res.json())
      .then((json) => {
        if (json.score !== undefined) setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleBreakdown = useCallback(() => {
    setShowBreakdown((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-[88px] h-[88px] rounded-full bg-surface-container" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-surface-container rounded" />
            <div className="h-6 w-32 bg-surface-container rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { score, breakdown, trend, sparkline } = data;

  // Circular ring values
  const size = 88;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100;
  const dashOffset = circumference * (1 - progress);
  const strokeColor = getScoreStroke(score);
  const trackColor = getScoreTrack(score);

  // Sparkline dimensions
  const sparkW = 120;
  const sparkH = 32;
  const sparkPath = buildSparklinePath(sparkline, sparkW, sparkH);

  return (
    <div
      className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm cursor-pointer select-none transition-all duration-300 hover:shadow-md"
      onClick={toggleBreakdown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleBreakdown();
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={showBreakdown}
      aria-label={`Your Momentum Score: ${score} out of 100, trend ${trend}`}
    >
      <div className="flex items-center gap-4">
        {/* Circular ring with score */}
        <div className="relative shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={mounted ? dashOffset : circumference}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Center number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-headline text-2xl font-extrabold leading-none ${getScoreColor(score)}`}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-0.5">
            Your Momentum
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-base ${getTrendColor(trend)}`}
            >
              {getTrendIcon(trend)}
            </span>
            <span
              className={`font-label text-xs font-semibold ${getTrendColor(trend)}`}
            >
              {getTrendLabel(trend)}
            </span>
          </div>

          {/* Sparkline */}
          {sparkline.length >= 2 && (
            <svg
              width={sparkW}
              height={sparkH}
              className="mt-1.5"
              aria-hidden="true"
            >
              <path
                d={sparkPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.7}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Breakdown — shown on hover/tap */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          showBreakdown
            ? 'grid-rows-[1fr] opacity-100 mt-4'
            : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            <BreakdownItem
              label="Streak"
              value={breakdown.streak}
              max={30}
              icon="local_fire_department"
            />
            <BreakdownItem
              label="Journal"
              value={breakdown.journal}
              max={25}
              icon="edit_note"
            />
            <BreakdownItem
              label="Check-in"
              value={breakdown.checkin}
              max={25}
              icon="check_circle"
            />
            <BreakdownItem
              label="Mood"
              value={breakdown.mood}
              max={20}
              icon="mood"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Breakdown bar item ─────────────────────────────────────

function BreakdownItem({
  label,
  value,
  max,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  icon: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="material-symbols-outlined text-sm text-on-surface-variant/60">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="font-label text-[10px] text-on-surface-variant">
            {label}
          </span>
          <span className="font-label text-[10px] font-semibold text-on-surface">
            {value}/{max}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-outline-variant/15">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
