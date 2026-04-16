'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

interface Question {
  text: string;
  area: string;
}

const QUESTIONS: Question[] = [
  { text: 'My partner is open about their phone use with me', area: 'Openness' },
  { text: 'I know what apps my partner uses regularly', area: 'Transparency' },
  { text: 'We have agreements about phone use during dates/meals', area: 'Agreements' },
  { text: 'I feel my partner prioritizes me over their phone', area: 'Presence' },
  { text: 'My partner knows my passwords (if I choose to share)', area: 'Openness' },
  { text: 'I trust what my partner does online when I\'m not around', area: 'Trust' },
  { text: 'We discuss challenging topics that come up online', area: 'Communication' },
  { text: 'We have healthy boundaries around device-free time', area: 'Agreements' },
  { text: 'I don\'t feel compelled to check my partner\'s phone', area: 'Trust' },
  { text: 'My partner doesn\'t hide their screen from me', area: 'Transparency' },
  { text: 'We can talk about porn/content consumption openly if needed', area: 'Communication' },
  { text: 'We share accountability tools or practices', area: 'Accountability' },
];

const LIKERT = [
  { label: 'Strongly disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly agree', value: 5 },
];

interface Tier {
  min: number;
  max: number;
  title: string;
  subtitle: string;
  percentile: string;
  description: string;
  color: string;
}

const TIERS: Tier[] = [
  {
    min: 48,
    max: 60,
    title: 'Strong digital trust',
    subtitle: 'Top 20% of couples',
    percentile: 'top 20%',
    description: 'You and your partner have built real digital trust. There\'s transparency, aligned agreements, and a felt sense of safety. Protect this — it\'s rarer than you think.',
    color: 'emerald',
  },
  {
    min: 36,
    max: 47,
    title: 'Healthy but growing',
    subtitle: 'Top 50% of couples',
    percentile: 'top 50%',
    description: 'Your relationship has a solid foundation of digital trust with room to deepen. Small intentional habits now will compound over years.',
    color: 'cyan',
  },
  {
    min: 24,
    max: 35,
    title: 'Work to do',
    subtitle: 'Building phase',
    percentile: 'average',
    description: 'Real trust is being built but there are soft spots — hidden screens, quiet resentments, or agreements that haven\'t been made explicit. This is fixable.',
    color: 'amber',
  },
  {
    min: 0,
    max: 23,
    title: 'Needs attention',
    subtitle: 'Rebuilding phase',
    percentile: 'bottom 20%',
    description: 'Digital trust has eroded or never fully formed. This doesn\'t mean the relationship is broken — it means you\'re overdue for honest conversations and structural change.',
    color: 'rose',
  },
];

function getTier(score: number): Tier {
  return TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[TIERS.length - 1];
}

function getImprovementAreas(answers: number[]): string[] {
  const areaScores: Record<string, { sum: number; count: number }> = {};
  QUESTIONS.forEach((q, i) => {
    if (answers[i] > 0) {
      if (!areaScores[q.area]) areaScores[q.area] = { sum: 0, count: 0 };
      areaScores[q.area].sum += answers[i];
      areaScores[q.area].count += 1;
    }
  });
  return Object.entries(areaScores)
    .map(([area, { sum, count }]) => ({ area, avg: sum / count }))
    .filter((a) => a.avg < 3.5)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .map((a) => a.area);
}

const AREA_GUIDANCE: Record<string, string> = {
  Openness: 'Practice sharing small, honest observations about your own phone use first. Openness becomes contagious.',
  Transparency: 'Create a low-stakes ritual — sharing screen time reports weekly, or showing each other what you were scrolling. Normalize visibility.',
  Agreements: 'Set one explicit rule together this week: phones away during dinner, no phones in bed, or similar. Small agreements build trust muscle.',
  Presence: 'When your partner walks into the room, physically set the phone down. The gesture matters more than the minutes.',
  Trust: 'Trust usually erodes when things go unsaid. Name the specific fear or concern out loud — it shrinks when exposed.',
  Communication: 'Pick one hard topic you\'ve been avoiding digitally and discuss it in person this week.',
  Accountability: 'Choose an accountability tool together rather than having one imposed. Shared ownership changes everything.',
};

export default function DigitalTrustCalculatorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialResult = searchParams.get('result');
  const initialScore = initialResult ? Number(initialResult) : null;

  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(0));
  const [currentQ, setCurrentQ] = useState(0);
  const [showResults, setShowResults] = useState(initialScore !== null && !isNaN(initialScore));
  const [finalScore, setFinalScore] = useState<number | null>(initialScore);

  const totalScore = useMemo(() => answers.reduce((acc, v) => acc + v, 0), [answers]);
  const progressPct = ((currentQ + (showResults ? 1 : 0)) / QUESTIONS.length) * 100;

  const handleAnswer = useCallback(
    (value: number) => {
      const next = [...answers];
      next[currentQ] = value;
      setAnswers(next);

      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 250);
      } else {
        const score = next.reduce((acc, v) => acc + v, 0);
        setFinalScore(score);
        setShowResults(true);
        const params = new URLSearchParams({ result: String(score) });
        router.replace(`/tools/digital-trust-calculator?${params.toString()}`, { scroll: false });
      }
    },
    [answers, currentQ, router],
  );

  const handleReset = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(0));
    setCurrentQ(0);
    setShowResults(false);
    setFinalScore(null);
    router.replace('/tools/digital-trust-calculator', { scroll: false });
  }, [router]);

  const displayScore = finalScore ?? totalScore;
  const tier = getTier(displayScore);
  const improvementAreas = useMemo(() => getImprovementAreas(answers), [answers]);

  const shareUrl = `https://becandid.io/tools/digital-trust-calculator?result=${displayScore}`;
  const shareTitle = `Our digital trust score: ${displayScore}/60 — ${tier.title}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Couple&apos;s Digital Trust Calculator
        </h1>
        <p className="text-stone-400 text-lg">
          12 questions. Take it solo or together. Fully private.
        </p>
      </div>

      {!showResults && (
        <>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span>
                Question {currentQ + 1} of {QUESTIONS.length}
              </span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div
            key={currentQ}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 animate-in fade-in slide-in-from-bottom-3 duration-300"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-cyan-400 mb-3">
              {QUESTIONS[currentQ].area}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 leading-snug">
              {QUESTIONS[currentQ].text}
            </h2>

            <div className="space-y-2">
              {LIKERT.map((opt) => {
                const selected = answers[currentQ] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      selected
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-stone-300 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ(currentQ - 1)}
                className="mt-6 text-sm text-stone-400 hover:text-white transition-colors"
              >
                ← Previous question
              </button>
            )}
          </div>
        </>
      )}

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">
              Your digital trust score
            </div>
            <div className="text-6xl md:text-7xl font-bold text-cyan-400 mb-1">
              {displayScore}
              <span className="text-3xl text-stone-500">/60</span>
            </div>
            <div className="inline-block text-xs font-medium text-cyan-300 bg-cyan-500/10 rounded-full px-3 py-1 mt-2 mb-4">
              {tier.subtitle}
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">{tier.title}</h2>
            <p className="text-stone-300 leading-relaxed max-w-lg mx-auto">{tier.description}</p>

            {/* Bar */}
            <div className="mt-6">
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-1000"
                  style={{ width: `${(displayScore / 60) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Improvement areas */}
          {improvementAreas.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">
                Where to focus first
              </h3>
              <div className="space-y-4">
                {improvementAreas.map((area) => (
                  <div key={area} className="border-l-2 border-cyan-500/40 pl-4">
                    <div className="text-white font-semibold mb-1">{area}</div>
                    <p className="text-sm text-stone-300 leading-relaxed">
                      {AREA_GUIDANCE[area] ?? 'Open a conversation about this area with your partner.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Share with your partner</h3>
                <p className="text-sm text-stone-400">Compare your answers and start the conversation.</p>
              </div>
              <ShareButton url={shareUrl} title={shareTitle} text={shareTitle} size="sm" />
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to build stronger digital trust?
            </h3>
            <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
              Be Candid gives couples shared accountability tools — the structural support that turns good intentions into lasting habits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
              >
                Start for free
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-stone-300 hover:bg-white/[0.04] transition-colors"
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
