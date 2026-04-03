'use client';

// ─── Types ──────────────────────────────────────────────────

interface PartnerScore {
  partnerId: string;
  partnerName: string;
  score: number;         // 0-100 composite
  responseTime: number;  // avg minutes to respond to alerts
  checkInRate: number;   // % of check-ins completed (0-100)
  avgRating: number;     // avg conversation rating (1-5)
  conversationCount: number;
}

interface PartnerCompatibilityProps {
  partners: PartnerScore[];
}

// ─── Helpers ────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-500 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 75) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Circular progress ring
function ScoreRing({ score, size = 80, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="stroke-surface-container-low"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className={scoreRingColor(score)}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 0.6s ease-out',
        }}
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────

export default function PartnerCompatibility({ partners }: PartnerCompatibilityProps) {
  if (partners.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">group</span>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">No partner data yet</h3>
        <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto">
          Once your partner responds to alerts and completes check-ins, you will see effectiveness scores here.
        </p>
      </div>
    );
  }

  const highestScoreId = partners.reduce((best, p) => p.score > best.score ? p : best, partners[0]).partnerId;

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${partners.length > 1 ? 'sm:grid-cols-2' : 'max-w-md'}`}>
        {partners.map(p => {
          const isBest = partners.length > 1 && p.partnerId === highestScoreId;

          return (
            <div
              key={p.partnerId}
              className={`
                bg-surface-container-lowest rounded-3xl border p-5 sm:p-6 relative
                ${isBest ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant'}
              `}
            >
              {/* Best partner badge */}
              {isBest && (
                <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-label font-bold uppercase tracking-wider rounded-full">
                  Strongest partner
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-4 mb-5">
                {/* Avatar initial */}
                <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center text-primary font-headline font-bold text-lg flex-shrink-0">
                  {p.partnerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline text-base font-bold text-on-surface truncate">{p.partnerName}</h4>
                  <p className="text-xs font-label text-on-surface-variant">
                    {p.conversationCount} conversation{p.conversationCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Score ring */}
                <div className="relative flex-shrink-0">
                  <ScoreRing score={p.score} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-headline font-extrabold ${scoreColor(p.score)}`}>
                      {Math.round(p.score)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-on-surface-variant/70">schedule</span>
                    <span className="text-xs font-label text-on-surface-variant">Response time</span>
                  </div>
                  <span className="text-sm font-label font-semibold text-on-surface">
                    avg {formatResponseTime(p.responseTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-on-surface-variant/70">fact_check</span>
                    <span className="text-xs font-label text-on-surface-variant">Check-in rate</span>
                  </div>
                  <span className="text-sm font-label font-semibold text-on-surface">
                    {Math.round(p.checkInRate)}%
                  </span>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-on-surface-variant/70">star</span>
                    <span className="text-xs font-label text-on-surface-variant">Avg rating</span>
                  </div>
                  <span className="text-sm font-label font-semibold text-on-surface">
                    {p.avgRating.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
