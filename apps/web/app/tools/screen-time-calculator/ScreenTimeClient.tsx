'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

const COMPARISONS = [
  { perHour: 1 / 40, unit: 'books', label: 'books read', icon: '📚' },
  { perHour: 1 / 2000, unit: 'languages', label: 'languages learned', icon: '🌍' },
  { perHour: 1 / 100, unit: 'instruments', label: 'musical instruments mastered', icon: '🎸' },
  { perHour: 1 / 500, unit: 'marathons', label: 'marathon training cycles', icon: '🏃' },
  { perHour: 1 / 1500, unit: 'degrees', label: 'college degrees earned', icon: '🎓' },
  { perHour: 1 / 40, unit: 'road-trips', label: 'cross-country road trips', icon: '🚗' },
  { perHour: 1 / 200, unit: 'novels', label: 'novels written', icon: '✍️' },
  { perHour: 1 / 120, unit: 'gardens', label: 'gardens grown from seed', icon: '🌱' },
];

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 10) return Math.round(n).toString();
  return n.toFixed(1);
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{formatNumber(display)}</span>;
}

export default function ScreenTimeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialHours = Number(searchParams.get('h')) || 0;
  const initialAge = Number(searchParams.get('age')) || 0;

  const [hours, setHours] = useState(initialHours || 5);
  const [age, setAge] = useState(initialAge || 30);
  const [lifeExpectancy] = useState(78);
  const [showResults, setShowResults] = useState(!!initialHours);
  const [embedCopied, setEmbedCopied] = useState(false);

  const remainingYears = Math.max(lifeExpectancy - age, 1);
  const lifetimeHours = hours * 365 * remainingYears;
  const lifetimeDays = lifetimeHours / 24;
  const lifetimeYears = lifetimeDays / 365;
  const percentOfLife = (lifetimeYears / remainingYears) * 100;

  const topComparisons = useMemo(() => {
    return COMPARISONS.map((c) => ({
      ...c,
      count: Math.floor(lifetimeHours * c.perHour),
    }))
      .filter((c) => c.count >= 1)
      .slice(0, 4);
  }, [lifetimeHours]);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    const params = new URLSearchParams({ h: String(hours), age: String(age) });
    router.replace(`/tools/screen-time-calculator?${params.toString()}`, { scroll: false });
  }, [hours, age, router]);

  const shareUrl = `https://becandid.io/tools/screen-time-calculator?h=${hours}&age=${age}`;
  const shareTitle = `I'll spend ${lifetimeYears.toFixed(1)} years of my life on screens`;

  const embedCode = `<iframe src="https://becandid.io/embed/screen-time-calculator" width="100%" height="520" style="border:none;border-radius:12px;" title="Screen Time Calculator — Be Candid"></iframe>`;

  const copyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }, [embedCode]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Screen Time Calculator
        </h1>
        <p className="text-stone-400 text-lg">
          How much of your remaining life will you spend on screens?
        </p>
      </div>

      {/* Calculator Inputs */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-8">
        {/* Daily Screen Time */}
        <div className="mb-8">
          <label className="flex items-center justify-between text-white font-medium mb-3">
            <span>Daily screen time</span>
            <span className="text-2xl font-bold text-cyan-400">{hours}h</span>
          </label>
          <input
            type="range"
            min={1}
            max={16}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-cyan-500 h-2 rounded-full bg-white/10 appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1">
            <span>1h</span>
            <span>8h</span>
            <span>16h</span>
          </div>
        </div>

        {/* Age */}
        <div className="mb-8">
          <label className="flex items-center justify-between text-white font-medium mb-3">
            <span>Your age</span>
            <span className="text-2xl font-bold text-cyan-400">{age}</span>
          </label>
          <input
            type="range"
            min={10}
            max={80}
            step={1}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-cyan-500 h-2 rounded-full bg-white/10 appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-stone-500 mt-1">
            <span>10</span>
            <span>45</span>
            <span>80</span>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-lg transition-colors"
        >
          Calculate My Screen Time
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Big Numbers */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">Your remaining screen time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                  <AnimatedNumber value={lifetimeHours} />
                </div>
                <div className="text-xs text-stone-500 mt-1">hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                  <AnimatedNumber value={lifetimeDays} />
                </div>
                <div className="text-xs text-stone-500 mt-1">full days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedNumber value={lifetimeYears} />
                </div>
                <div className="text-xs text-stone-500 mt-1">years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400">
                  <AnimatedNumber value={percentOfLife} />
                  <span className="text-xl">%</span>
                </div>
                <div className="text-xs text-stone-500 mt-1">of remaining life</div>
              </div>
            </div>

            {/* Life Bar */}
            <div className="mt-6">
              <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-1000"
                  style={{ width: `${Math.min(percentOfLife, 100)}%` }}
                />
              </div>
              <p className="text-sm text-stone-400 mt-2 text-center">
                {percentOfLife.toFixed(0)}% of your remaining life on screens
              </p>
            </div>
          </div>

          {/* Comparisons */}
          {topComparisons.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="text-lg font-semibold text-white mb-6">What else you could do with that time</h2>
              <div className="grid grid-cols-2 gap-4">
                {topComparisons.map((c) => (
                  <div key={c.unit} className="rounded-xl bg-white/[0.04] border border-white/5 p-4 text-center">
                    <div className="text-2xl mb-1">{c.icon}</div>
                    <div className="text-2xl font-bold text-white">
                      <AnimatedNumber value={c.count} />
                    </div>
                    <div className="text-xs text-stone-400 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share + Embed */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Share your results</h2>
              <ShareButton url={shareUrl} title={shareTitle} text={shareTitle} size="sm" />
            </div>

            {/* Embed Code */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-medium text-stone-400 mb-3">Embed on your website</h3>
              <div className="relative">
                <pre className="text-xs text-stone-500 bg-black/30 rounded-lg p-3 overflow-x-auto">
                  {embedCode}
                </pre>
                <button
                  onClick={copyEmbed}
                  className="absolute top-2 right-2 text-xs px-3 py-1 rounded-md bg-white/10 text-stone-300 hover:bg-white/20 transition-colors"
                >
                  {embedCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to take control of your screen time?</h3>
            <p className="text-stone-400 text-sm mb-6">
              Be Candid helps you align your digital life with who you actually want to be.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              Start for free
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
