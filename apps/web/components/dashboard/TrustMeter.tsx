// ============================================================
// components/dashboard/TrustMeter.tsx
//
// Visual trust meter based on check-in completion rate.
// Shows a semicircular gauge with percentage + status label.
//
// Usage:
//   <TrustMeter checkInRate={75} totalCheckIns={20} />
// ============================================================

'use client';

interface TrustMeterProps {
  checkInRate: number;   // 0-100
  totalCheckIns: number; // total check-ins tracked
}

function getTrustLevel(rate: number): {
  label: string;
  color: string;
  strokeClass: string;
  bgClass: string;
} {
  if (rate >= 80) return {
    label: 'Strong',
    color: 'text-emerald-600',
    strokeClass: 'stroke-emerald-500',
    bgClass: 'bg-emerald-50',
  };
  if (rate >= 60) return {
    label: 'Building',
    color: 'text-primary',
    strokeClass: 'stroke-primary',
    bgClass: 'bg-primary-container/20',
  };
  if (rate >= 40) return {
    label: 'Developing',
    color: 'text-amber-600',
    strokeClass: 'stroke-amber-500',
    bgClass: 'bg-amber-50',
  };
  return {
    label: 'Needs attention',
    color: 'text-red-500',
    strokeClass: 'stroke-red-400',
    bgClass: 'bg-red-50',
  };
}

export default function TrustMeter({ checkInRate, totalCheckIns }: TrustMeterProps) {
  const trust = getTrustLevel(checkInRate);

  // Semicircular gauge geometry
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2 - 4;
  // Semicircle: arc from 180deg to 0deg (bottom half hidden)
  const semicircumference = Math.PI * radius;
  const progress = Math.min(checkInRate, 100) / 100;
  const dashOffset = semicircumference * (1 - progress);

  if (totalCheckIns === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">shield</span>
        <h3 className="font-headline text-base font-bold text-on-surface mb-1">Trust Meter</h3>
        <p className="text-sm text-on-surface-variant font-body">
          Complete check-ins together to build your trust score.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-lg text-on-surface-variant">shield</span>
        <h3 className="font-headline text-base font-bold text-on-surface">Trust Meter</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Semicircular gauge */}
        <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
          <svg
            width={size}
            height={size / 2 + 12}
            viewBox={`0 0 ${size} ${size / 2 + 12}`}
            className="overflow-visible"
          >
            {/* Background track */}
            <path
              d={`M ${strokeWidth / 2 + 4} ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${size / 2 + 4}`}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="stroke-surface-container"
            />
            {/* Progress arc */}
            <path
              d={`M ${strokeWidth / 2 + 4} ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 4} ${size / 2 + 4}`}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={trust.strokeClass}
              strokeDasharray={semicircumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
            <span className={`font-headline text-3xl font-extrabold leading-none ${trust.color}`}>
              {Math.round(checkInRate)}%
            </span>
          </div>
        </div>

        {/* Status label */}
        <div className={`mt-2 px-4 py-1.5 rounded-full ${trust.bgClass}`}>
          <span className={`text-xs font-label font-semibold ${trust.color}`}>
            {trust.label}
          </span>
        </div>

        {/* Footer stat */}
        <p className="text-xs text-on-surface-variant font-body mt-3">
          Based on {totalCheckIns} check-in{totalCheckIns !== 1 ? 's' : ''} together
        </p>
      </div>
    </div>
  );
}
