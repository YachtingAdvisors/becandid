'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

/* ─── Growth spectrum definitions ────────────────────────── */
const SPECTRUM = [
  { slide: 'Escaping', climb: 'Presence', slideIcon: 'flight', climbIcon: 'self_improvement' },
  { slide: 'Numbing', climb: 'Experiencing', slideIcon: 'blur_on', climbIcon: 'wb_sunny' },
  { slide: 'Chasing', climb: 'Building', slideIcon: 'local_fire_department', climbIcon: 'construction' },
  { slide: 'Performing', climb: 'Belonging', slideIcon: 'thumb_up', climbIcon: 'favorite' },
  { slide: 'Punishing', climb: 'Compassion', slideIcon: 'gavel', climbIcon: 'spa' },
  { slide: 'Controlling', climb: 'Surrendering', slideIcon: 'tune', climbIcon: 'water_drop' },
  { slide: 'Fantasizing', climb: 'Connecting', slideIcon: 'auto_awesome', climbIcon: 'handshake' },
  { slide: 'Guarding', climb: 'Trusting', slideIcon: 'visibility', climbIcon: 'shield_with_heart' },
];

interface DataPoint {
  date: string;
  score: number; // 0-100, where 0 = deepest shadow, 100 = fullest glow
}

interface Props {
  /** Partner's name */
  partnerName: string;
  /** Streak days */
  streakDays?: number;
  /** Check-in completion rate 0-100 */
  checkInRate?: number;
  /** Journal entries this week */
  journalCount?: number;
  /** Focus rate 0-100 */
  focusRate?: number;
  /** Days since signup */
  daysSinceSignup?: number;
}

function generateJourneyData(props: Props): DataPoint[] {
  // Simulate a growth trajectory from available signals
  const days = Math.min(props.daysSinceSignup ?? 30, 90);
  const points: DataPoint[] = [];
  const baseScore = 25; // Starting point
  const streakBoost = Math.min((props.streakDays ?? 0) * 1.5, 30);
  const checkInBoost = ((props.checkInRate ?? 50) / 100) * 20;
  const journalBoost = Math.min((props.journalCount ?? 0) * 3, 15);
  const focusBoost = ((props.focusRate ?? 50) / 100) * 10;
  const currentScore = Math.min(baseScore + streakBoost + checkInBoost + journalBoost + focusBoost, 95);

  for (let i = 0; i < Math.min(days, 30); i++) {
    const progress = i / Math.max(days - 1, 1);
    const trendScore = baseScore + (currentScore - baseScore) * progress;
    // Add organic variation
    const noise = Math.sin(i * 2.1) * 8 + Math.cos(i * 0.7) * 5;
    const dip = (i === 7 || i === 15 || i === 22) ? -12 : 0; // realistic setbacks
    const score = Math.max(5, Math.min(95, trendScore + noise + dip));

    const date = new Date(Date.now() - (Math.min(days, 30) - 1 - i) * 86400000);
    points.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(score),
    });
  }
  return points;
}

/* ─── SVG Line Chart ─────────────────────────────────────── */
function JourneyChart({ data, showGlow }: { data: DataPoint[]; showGlow: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 560;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 30, left: 16 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD.top + chartH - (d.score / 100) * chartH,
    score: d.score,
    date: d.date,
  }));

  // Smooth curve
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  // Fill area
  const areaD = `${pathD} L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`;

  const lastPoint = points[points.length - 1];
  const gradientId = showGlow ? 'glow-gradient' : 'shadow-gradient';
  const lineGradientId = showGlow ? 'glow-line' : 'shadow-line';

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Area fill gradient */}
        <linearGradient id="shadow-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glow-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
        </linearGradient>
        {/* Line gradient */}
        <linearGradient id="shadow-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(245,158,11)" />
        </linearGradient>
        <linearGradient id="glow-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="rgb(16,185,129)" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="point-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal zone lines */}
      {[25, 50, 75].map(pct => {
        const y = PAD.top + chartH - (pct / 100) * chartH;
        return <line key={pct} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />;
      })}

      {/* Zone labels — left side */}
      <text x={PAD.left + 4} y={PAD.top + 12} fill="currentColor" fillOpacity="0.2" fontSize="8" fontFamily="inherit" fontWeight="600">
        {showGlow ? 'DIGNIFIED' : 'HIGHEST SELF'}
      </text>
      <text x={PAD.left + 4} y={PAD.top + chartH - 4} fill="currentColor" fillOpacity="0.2" fontSize="8" fontFamily="inherit" fontWeight="600">
        {showGlow ? 'EXPOSED' : 'SHADOW'}
      </text>

      {/* Area fill */}
      <path
        d={areaD}
        fill={`url(#${gradientId})`}
        className="transition-all duration-700"
      />

      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${lineGradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-700"
      />

      {/* Current position dot */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="6"
        fill={showGlow ? 'rgb(16,185,129)' : 'rgb(245,158,11)'}
        filter="url(#point-glow)"
        className="transition-all duration-700"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="3"
        fill="white"
        className="transition-all duration-700"
      />

      {/* Current score label */}
      <text
        x={lastPoint.x}
        y={lastPoint.y - 14}
        textAnchor="middle"
        fill={showGlow ? 'rgb(16,185,129)' : 'rgb(245,158,11)'}
        fontSize="11"
        fontWeight="800"
        fontFamily="inherit"
      >
        {lastPoint.score}
      </text>

      {/* Date labels */}
      {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
        <text
          key={i}
          x={points[i].x}
          y={H - 6}
          textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
          fill="currentColor"
          fillOpacity="0.3"
          fontSize="9"
          fontFamily="inherit"
        >
          {data[i].date}
        </text>
      ))}
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function GrowthJourney(props: Props) {
  const [showGlow, setShowGlow] = useState(true);
  const data = useMemo(() => generateJourneyData(props), [props]);

  const currentScore = data[data.length - 1]?.score ?? 50;
  const startScore = data[0]?.score ?? 25;
  const growth = currentScore - startScore;

  // Which spectrum item best describes their current position
  const spectrumIdx = Math.min(Math.floor((currentScore / 100) * SPECTRUM.length), SPECTRUM.length - 1);
  const currentSpectrum = SPECTRUM[spectrumIdx];

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${
              showGlow ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
              <span className={`material-symbols-outlined text-lg transition-all duration-500 ${
                showGlow ? 'text-emerald-500' : 'text-amber-500'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {showGlow ? 'trending_up' : 'trending_down'}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">
                {props.partnerName}&apos;s Journey
              </h3>
              <p className="text-[10px] text-on-surface-variant font-label">
                {showGlow ? 'Growth trajectory' : 'Pattern awareness'}
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setShowGlow(!showGlow)}
            className="relative flex items-center gap-0 rounded-full p-0.5 bg-surface-container ring-1 ring-outline-variant/20 cursor-pointer transition-all hover:ring-primary/30"
          >
            <div
              className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] rounded-full transition-all duration-500 ease-out ${
                showGlow
                  ? 'left-[calc(50%+1px)] bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30'
                  : 'left-0.5 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20'
              }`}
            />
            <span className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-label font-bold transition-colors duration-300 ${
              !showGlow ? 'text-white' : 'text-on-surface-variant'
            }`}>
              Shadow
            </span>
            <span className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-label font-bold transition-colors duration-300 ${
              showGlow ? 'text-white' : 'text-on-surface-variant'
            }`}>
              Glow
            </span>
          </button>
        </div>

        {/* Spectrum bar */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[9px] font-label font-semibold text-on-surface-variant/40 uppercase tracking-wider">
            {showGlow ? currentSpectrum.slide : 'Exposed'}
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-surface-container">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                showGlow
                  ? 'bg-gradient-to-r from-emerald-500/60 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500/40 to-amber-500'
              }`}
              style={{ width: `${currentScore}%` }}
            />
          </div>
          <span className={`text-[9px] font-label font-semibold uppercase tracking-wider transition-colors duration-500 ${
            showGlow ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            {showGlow ? currentSpectrum.climb : 'Dignified'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-3 py-2 text-on-surface-variant">
        <JourneyChart data={data} showGlow={showGlow} />
      </div>

      {/* Growth stat */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={`font-headline text-lg font-black ${growth > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {growth > 0 ? '+' : ''}{growth}
            </p>
            <p className="text-[9px] text-on-surface-variant font-label uppercase tracking-wider">Growth</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/20" />
          <div className="text-center">
            <p className="font-headline text-lg font-black text-on-surface">{props.streakDays ?? 0}</p>
            <p className="text-[9px] text-on-surface-variant font-label uppercase tracking-wider">Streak</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/20" />
          <div className="text-center">
            <p className="font-headline text-lg font-black text-on-surface">{props.checkInRate ?? 0}%</p>
            <p className="text-[9px] text-on-surface-variant font-label uppercase tracking-wider">Check-ins</p>
          </div>
        </div>

        {/* Current growth direction */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500 ${
          showGlow ? 'bg-emerald-500/10' : 'bg-amber-500/10'
        }`}>
          <span className={`material-symbols-outlined text-sm transition-all duration-500 ${
            showGlow ? 'text-emerald-500' : 'text-amber-500'
          }`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {showGlow ? currentSpectrum.climbIcon : currentSpectrum.slideIcon}
          </span>
          <span className={`text-[10px] font-label font-bold transition-all duration-500 ${
            showGlow ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {showGlow ? `Climbing into ${currentSpectrum.climb}` : `Watch for ${currentSpectrum.slide}`}
          </span>
        </div>
      </div>
    </div>
  );
}
