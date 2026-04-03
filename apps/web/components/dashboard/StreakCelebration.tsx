'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────
interface StreakCelebrationProps {
  milestone: number; // 7, 14, 30, 60, 90
  onDismiss: () => void;
}

// ─── Messages ─────────────────────────────────────────────────
const MESSAGES: Record<number, string> = {
  7: '7 days focused!',
  14: '14 days — building real momentum!',
  30: '30 days — incredible commitment!',
  60: '60 days — the neural pathways are rewiring.',
  90: "90 days — you're rewriting your story.",
};

const ICONS: Record<number, string> = {
  7: 'local_fire_department',
  14: 'star',
  30: 'auto_awesome',
  60: 'diamond',
  90: 'crown',
};

// ─── Confetti particle config ─────────────────────────────────
const COLORS = [
  'bg-primary', 'bg-tertiary', 'bg-emerald-400', 'bg-violet-400',
  'bg-primary/80', 'bg-tertiary/80', 'bg-emerald-300', 'bg-violet-300',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  size: number;
  color: string;
  isSquare: boolean;
  duration: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 80 + Math.random() * 140;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: Math.random() * 720 - 360,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isSquare: Math.random() > 0.5,
      duration: 0.8 + Math.random() * 0.6,
      delay: Math.random() * 0.3,
    };
  });
}

// ─── Component ────────────────────────────────────────────────
export default function StreakCelebration({ milestone, onDismiss }: StreakCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [particles] = useState(() => generateParticles(25));

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  useEffect(() => {
    // Trigger entrance
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  const message = MESSAGES[milestone] || `${milestone} days — keep going!`;
  const icon = ICONS[milestone] || 'military_tech';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={dismiss}
      role="dialog"
      aria-label={`Streak celebration: ${message}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />

      {/* Center card */}
      <div
        className={`relative z-10 bg-surface-container-lowest rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
          {particles.map((p) => (
            <div
              key={p.id}
              className={`absolute ${p.color} ${p.isSquare ? 'rounded-sm' : 'rounded-full'}`}
              style={{
                width: p.size,
                height: p.size,
                '--confetti-x': `${p.x}px`,
                '--confetti-y': `${p.y}px`,
                '--confetti-r': `${p.rotation}deg`,
                animation: `confetti-burst ${p.duration}s ease-out ${p.delay}s both`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Animated ring with milestone number */}
        <div className="relative w-28 h-28 mx-auto mb-5">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-outline-variant/20"
            />
            {/* Animated ring */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray="283"
              strokeDashoffset="283"
              style={{
                animation: 'ring-draw 1.2s ease-out 0.2s forwards',
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
              }}
            />
          </svg>
          {/* Number */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'number-pop 0.6s ease-out 0.5s both' }}
          >
            <span className="text-3xl font-headline font-bold text-primary">
              {milestone}
            </span>
          </div>
        </div>

        {/* Badge icon */}
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 mb-4"
          style={{ animation: 'badge-bounce 0.7s ease-out 0.8s both' }}
        >
          <span
            className="material-symbols-outlined text-2xl text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>

        {/* Message */}
        <h2 className="text-lg font-headline font-bold text-on-surface mb-1">
          {message}
        </h2>
        <p className="text-sm text-on-surface-variant font-body mb-6">
          Every day of focus is a step toward the life you want.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={dismiss}
            className="px-5 py-2.5 min-h-[44px] text-sm font-label font-medium rounded-2xl bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-200"
          >
            Keep Going
          </button>
          <button
            onClick={dismiss}
            className="px-5 py-2.5 min-h-[44px] text-sm font-label rounded-2xl ring-1 ring-outline-variant/10 text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base align-middle mr-1">share</span>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
