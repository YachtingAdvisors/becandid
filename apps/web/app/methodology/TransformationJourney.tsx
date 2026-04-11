'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Icon helper ──────────────────────────────────────────────── */
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

/* ─── Transformation Data ─────────────────────────────────────── */
const transformations = [
  {
    shadow: 'Escaping',
    growth: 'Presence',
    shadowIcon: 'flight_takeoff',
    growthIcon: 'self_improvement',
    shadowDesc: 'Running from discomfort through distraction, avoidance, or checking out.',
    growthDesc: 'Learning to stay with what is, to be here now, even when it is hard.',
    practice: 'When the urge to flee arises, take three grounding breaths and name what you feel.',
  },
  {
    shadow: 'Numbing',
    growth: 'Experiencing',
    shadowIcon: 'block',
    growthIcon: 'spa',
    shadowDesc: 'Dulling painful emotions through substances, screens, or overconsumption.',
    growthDesc: 'Allowing yourself to feel the full range of human emotion without dampening it.',
    practice: 'Sit with an uncomfortable emotion for 90 seconds. Let it crest and pass naturally.',
  },
  {
    shadow: 'Chasing',
    growth: 'Building',
    shadowIcon: 'sprint',
    growthIcon: 'construction',
    shadowDesc: 'Pursuing quick highs, validation hits, or dopamine spikes that never satisfy.',
    growthDesc: 'Investing in slow, meaningful work that compounds over time.',
    practice: 'Replace one reactive scroll session with 20 minutes of focused creative work.',
  },
  {
    shadow: 'Performing',
    growth: 'Belonging',
    shadowIcon: 'theater_comedy',
    growthIcon: 'groups',
    shadowDesc: 'Wearing masks to earn approval, hiding your true self behind a curated image.',
    growthDesc: 'Showing up authentically and discovering you are enough as you are.',
    practice: 'Share one honest thing about your day with someone you trust. No filter.',
  },
  {
    shadow: 'Punishing',
    growth: 'Compassion',
    shadowIcon: 'gavel',
    growthIcon: 'favorite',
    shadowDesc: 'Turning failure into self-attack, replaying mistakes as evidence of worthlessness.',
    growthDesc: 'Meeting your own suffering with the same kindness you would offer a friend.',
    practice: 'Write a letter to yourself from the perspective of someone who loves you deeply.',
  },
  {
    shadow: 'Controlling',
    growth: 'Surrendering',
    shadowIcon: 'lock',
    growthIcon: 'lock_open',
    shadowDesc: 'White-knuckling every outcome, managing people and situations out of fear.',
    growthDesc: 'Releasing what you cannot control and focusing energy on what you can.',
    practice: 'Identify one thing you are gripping tightly. Open your hands and let it breathe.',
  },
  {
    shadow: 'Fantasizing',
    growth: 'Connecting',
    shadowIcon: 'cloud',
    growthIcon: 'handshake',
    shadowDesc: 'Retreating into imagined worlds where life is painless and effortless.',
    growthDesc: 'Building real intimacy and presence with the people in front of you.',
    practice: 'Put the phone down during your next meal and be fully present with whoever is there.',
  },
  {
    shadow: 'Guarding',
    growth: 'Trusting',
    shadowIcon: 'shield',
    growthIcon: 'volunteer_activism',
    shadowDesc: 'Building walls so high that nothing can hurt you, but nothing can reach you either.',
    growthDesc: 'Taking the risk to be known, to let someone in past the armor.',
    practice: 'Tell someone one thing you have been afraid to say. Start small. Start honest.',
  },
];

/* ─── Flip Card Component ─────────────────────────────────────── */
function TransformationCard({
  t,
  index,
  isActive,
  onActivate,
}: {
  t: (typeof transformations)[0];
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Connection node on the journey path */}
      <div className="flex items-center gap-4 md:gap-6 mb-3">
        <div className="relative flex-shrink-0">
          {/* Outer glow */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-700 ${
              flipped
                ? 'bg-emerald-500/20 scale-150 blur-md'
                : 'bg-red-500/10 scale-125 blur-sm'
            }`}
          />
          {/* Node */}
          <button
            onClick={() => {
              setFlipped(!flipped);
              onActivate();
            }}
            className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500 cursor-pointer ${
              flipped
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-br from-red-900/80 to-amber-900/60 text-red-300 shadow-lg shadow-red-500/20'
            }`}
            aria-label={`Transform ${t.shadow} to ${t.growth}`}
          >
            <span className="font-headline text-sm md:text-base">
              {String(index + 1).padStart(2, '0')}
            </span>
          </button>
        </div>

        {/* Verb labels */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={`text-sm md:text-base font-headline font-bold transition-all duration-500 ${
              flipped ? 'text-stone-500 line-through' : 'text-red-400'
            }`}
          >
            {t.shadow}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`h-px w-6 md:w-10 transition-all duration-500 ${flipped ? 'bg-emerald-500' : 'bg-stone-700'}`} />
            <Icon
              name="arrow_forward"
              className={`text-sm transition-all duration-500 ${
                flipped ? 'text-emerald-400' : 'text-stone-600'
              }`}
            />
            <div className={`h-px w-6 md:w-10 transition-all duration-500 ${flipped ? 'bg-emerald-500' : 'bg-stone-700'}`} />
          </div>
          <span
            className={`text-sm md:text-base font-headline font-bold transition-all duration-500 ${
              flipped ? 'text-emerald-400' : 'text-stone-600'
            }`}
          >
            {t.growth}
          </span>
        </div>
      </div>

      {/* Flip Card */}
      <div className="ml-[3.5rem] md:ml-[4.25rem]" style={{ perspective: '1200px' }}>
        <div
          onClick={() => {
            setFlipped(!flipped);
            onActivate();
          }}
          className="relative cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '140px',
          }}
        >
          {/* Front — Shadow side */}
          <div
            className="relative rounded-2xl p-5 md:p-6 border transition-all duration-500 h-full"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, rgba(127,29,29,0.15) 0%, rgba(120,53,15,0.1) 50%, rgba(30,30,30,0.4) 100%)',
              borderColor: 'rgba(185,28,28,0.15)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name={t.shadowIcon} className="text-red-400 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-sm leading-relaxed font-body">
                  {t.shadowDesc}
                </p>
                <p className="text-stone-600 text-xs mt-3 flex items-center gap-1.5">
                  <Icon name="touch_app" className="text-xs" />
                  <span>Tap to reveal the growth path</span>
                </p>
              </div>
            </div>
          </div>

          {/* Back — Growth side */}
          <div
            className="absolute inset-0 rounded-2xl p-5 md:p-6 border overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, rgba(6,78,59,0.2) 0%, rgba(17,94,89,0.15) 50%, rgba(30,30,30,0.4) 100%)',
              borderColor: 'rgba(16,185,129,0.2)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name={t.growthIcon} className="text-emerald-400 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-100 text-sm leading-relaxed font-body">
                  {t.growthDesc}
                </p>
                <div className="mt-2 pt-2 border-t border-emerald-500/10">
                  <p className="text-emerald-300/80 text-xs leading-relaxed flex items-start gap-1.5">
                    <Icon name="psychiatry" className="text-xs mt-0.5 flex-shrink-0" />
                    <span><strong className="text-emerald-300">Practice:</strong> {t.practice}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Ring ───────────────────────────────────────────── */
function ProgressRing({ flippedCount }: { flippedCount: number }) {
  const total = transformations.length;
  const pct = (flippedCount / total) * 100;
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r="44"
          stroke="rgba(120,113,108,0.15)"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx="50" cy="50" r="44"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <span className="text-2xl font-headline font-bold text-white">{flippedCount}</span>
        <span className="text-xs text-stone-500 block font-label">/ {total}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function TransformationJourney() {
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleActivate = (index: number) => {
    setFlippedSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    if (flippedSet.size === transformations.length && !allRevealed) {
      setAllRevealed(true);
    }
  }, [flippedSet, allRevealed]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          Section 1 — The Transformation
          ═══════════════════════════════════════════════════════════ */}
      <section ref={sectionRef} className="px-6 py-28 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-6"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <Icon name="swap_horiz" className="text-sm" />
            The Coping Transformation
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-headline">
            Every shadow has a{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              growth counterpart.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-body">
            Your unwanted behavior is not random chaos. It is a coping pattern with a name.
            And every coping pattern points toward the growth direction your soul is reaching for.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            <ProgressRing flippedCount={flippedSet.size} />
            <div className="text-left">
              <p className="text-sm text-slate-300 font-label font-semibold">
                {flippedSet.size === 0
                  ? 'Tap each pair to reveal'
                  : flippedSet.size === transformations.length
                    ? 'All paths revealed'
                    : `${transformations.length - flippedSet.size} remaining`}
              </p>
              <p className="text-xs text-stone-500 font-body mt-0.5">
                Explore the journey from shadow to growth
              </p>
              {allRevealed && (
                <p className="text-xs text-emerald-400 font-body mt-1 flex items-center gap-1">
                  <Icon name="check_circle" className="text-xs" />
                  You have seen the full picture
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Journey path + cards */}
        <div className="max-w-2xl mx-auto relative">
          {/* Vertical journey line */}
          <div
            className="absolute left-[1.5rem] md:left-[1.75rem] top-6 bottom-6 w-px"
            style={{
              background: `linear-gradient(to bottom, rgba(185,28,28,0.3) 0%, rgba(120,53,15,0.2) 30%, rgba(16,185,129,0.2) 70%, rgba(20,184,166,0.3) 100%)`,
            }}
          />

          {/* Animated progress overlay on the line */}
          <div
            className="absolute left-[1.5rem] md:left-[1.75rem] top-6 w-px transition-all duration-700 ease-out"
            style={{
              height: `${(flippedSet.size / transformations.length) * 100}%`,
              maxHeight: 'calc(100% - 3rem)',
              background: 'linear-gradient(to bottom, rgba(16,185,129,0.6), rgba(20,184,166,0.4))',
              boxShadow: '0 0 8px rgba(16,185,129,0.3)',
            }}
          />

          <div className="space-y-6">
            {transformations.map((t, i) => (
              <TransformationCard
                key={t.shadow}
                t={t}
                index={i}
                isActive={flippedSet.has(i)}
                onActivate={() => handleActivate(i)}
              />
            ))}
          </div>
        </div>

        {/* All-revealed celebration */}
        {allRevealed && (
          <div className="mt-16 text-center animate-fade-up">
            <div
              className="inline-block rounded-2xl p-8 border"
              style={{
                background: 'linear-gradient(135deg, rgba(6,78,59,0.15) 0%, rgba(17,94,89,0.1) 100%)',
                borderColor: 'rgba(16,185,129,0.15)',
              }}
            >
              <Icon name="auto_awesome" className="text-emerald-400 text-4xl mb-3" />
              <h3 className="text-xl font-headline font-bold text-white mb-2">
                The full picture
              </h3>
              <p className="text-slate-400 text-sm font-body max-w-md leading-relaxed">
                Every shadow you carry is pointing toward something you deeply need.
                The struggle is not your enemy. It is the map.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Section 2 — How It Works (Stringer Framework)
          ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-teal-400 mb-6"
            style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}
          >
            <Icon name="route" className="text-sm" />
            How It Works
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-headline">
            Three questions that{' '}
            <span className="text-teal-400">change everything.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-body">
            Drawn from Jay Stringer&apos;s research, every journal entry and AI conversation
            guide follows the same three-part arc, each peeling back a layer.
          </p>
        </div>

        {/* Three Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[3.5rem] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-red-500/30 via-amber-500/20 to-emerald-500/30" />

            {/* Step 1 — Tributaries */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Outer ring */}
                <div className="absolute w-20 h-20 rounded-full border border-red-500/20 group-hover:border-red-500/40 transition-colors duration-500" />
                {/* Inner circle */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-900/40 to-amber-900/30 flex items-center justify-center group-hover:from-red-900/60 group-hover:to-amber-900/50 transition-all duration-500">
                  <Icon name="water" className="text-red-400 text-2xl group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="px-4">
                <span className="text-stone-600 text-[10px] font-label font-bold tracking-widest uppercase block mb-2">
                  Step 01
                </span>
                <h3 className="text-lg font-headline font-bold text-white mb-2">
                  Tributaries
                </h3>
                <p className="text-amber-400/80 text-sm font-body italic mb-3">
                  &ldquo;What were you sliding into?&rdquo;
                </p>
                <p className="text-slate-400 text-sm font-body leading-relaxed">
                  Name the coping pattern. Trace the current back to its source, the hours
                  and feelings that led up to the unwanted behavior.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    <strong className="text-red-400 font-label">Example:</strong> I was scrolling because I felt overlooked at work
                    all day and came home to an empty apartment.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 — Longing */}
            <div className="relative text-center group md:translate-y-8">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-20 h-20 rounded-full border border-amber-500/20 group-hover:border-amber-500/40 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-900/40 to-teal-900/30 flex items-center justify-center group-hover:from-amber-900/60 group-hover:to-teal-900/50 transition-all duration-500">
                  <Icon name="heart_broken" className="text-amber-400 text-2xl group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="px-4">
                <span className="text-stone-600 text-[10px] font-label font-bold tracking-widest uppercase block mb-2">
                  Step 02
                </span>
                <h3 className="text-lg font-headline font-bold text-white mb-2">
                  Longing
                </h3>
                <p className="text-amber-300/70 text-sm font-body italic mb-3">
                  &ldquo;What were you reaching for?&rdquo;
                </p>
                <p className="text-slate-400 text-sm font-body leading-relaxed">
                  Name the growth direction. What did you actually need, the real hunger beneath the
                  counterfeit solution?
                </p>

                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    <strong className="text-amber-400 font-label">Example:</strong> I needed to feel seen.
                    I was reaching for connection, not content.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 — Roadmap */}
            <div className="relative text-center group">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-20 h-20 rounded-full border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-900/40 to-emerald-900/30 flex items-center justify-center group-hover:from-teal-900/60 group-hover:to-emerald-900/50 transition-all duration-500">
                  <Icon name="map" className="text-emerald-400 text-2xl group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="px-4">
                <span className="text-stone-600 text-[10px] font-label font-bold tracking-widest uppercase block mb-2">
                  Step 03
                </span>
                <h3 className="text-lg font-headline font-bold text-white mb-2">
                  Roadmap
                </h3>
                <p className="text-emerald-400/80 text-sm font-body italic mb-3">
                  &ldquo;What does climbing look like?&rdquo;
                </p>
                <p className="text-slate-400 text-sm font-body leading-relaxed">
                  Define the concrete practice. Turn insight into one specific, achievable action
                  you can take before the next wave hits.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs text-stone-400 leading-relaxed font-body">
                    <strong className="text-emerald-400 font-label">Example:</strong> Tonight I will text my friend
                    and ask if they want to grab coffee this week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary arc — the visual path from shadow to light */}
          <div className="mt-20 relative">
            <svg
              className="w-full h-16 md:h-20"
              viewBox="0 0 1000 80"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="65%" stopColor="#14b8a6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path
                d="M0 70 Q250 0 500 40 Q750 80 1000 10"
                stroke="url(#arcGradient)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            <div className="flex justify-between items-center -mt-3 px-4">
              <div className="text-left">
                <p className="text-red-400/60 text-xs font-label font-bold uppercase tracking-widest">
                  Sliding
                </p>
                <p className="text-stone-500 text-[10px] font-body">
                  Coping patterns
                </p>
              </div>
              <div className="text-center">
                <p className="text-amber-400/50 text-xs font-label font-bold uppercase tracking-widest">
                  Awareness
                </p>
                <p className="text-stone-500 text-[10px] font-body">
                  The turning point
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400/60 text-xs font-label font-bold uppercase tracking-widest">
                  Climbing
                </p>
                <p className="text-stone-500 text-[10px] font-body">
                  Growth direction
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
