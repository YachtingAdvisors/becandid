'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

const QUESTIONS = [
  'Do you check your phone within 5 minutes of waking up?',
  'Do you feel anxious when your phone is out of reach?',
  'Have you checked your phone while driving?',
  'Do you use your phone in bed past your intended bedtime?',
  'Have others commented on your phone use?',
  'Do you pick up your phone without consciously deciding to?',
  'Have you missed significant moments with loved ones because of your phone?',
  'Do you feel unable to complete tasks without checking your phone?',
  'Do you hide your phone use from others?',
  'Have you tried to reduce phone use and failed?',
];

const LIKERT = [
  { label: 'Never', value: 0 },
  { label: 'Rarely', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Often', value: 3 },
  { label: 'Always', value: 4 },
];

interface Tier {
  min: number;
  max: number;
  label: string;
  title: string;
  description: string;
  recommendation: string;
  color: string;
}

const TIERS: Tier[] = [
  {
    min: 0,
    max: 15,
    label: 'Low severity',
    title: 'Mindful user',
    description: 'Your relationship with your phone looks healthy. You use it as a tool rather than being used by it.',
    recommendation: 'Keep doing what you\'re doing. Protect the habits that work — device-free meals, no phones in the bedroom, intentional check-ins rather than compulsive ones.',
    color: 'emerald',
  },
  {
    min: 16,
    max: 30,
    label: 'Moderate',
    title: 'Developing patterns',
    description: 'You show early signs of compulsive use. Nothing alarming, but patterns are forming that tend to intensify over time.',
    recommendation: 'Start tracking your pickups for a week without changing anything. Awareness alone reduces use by ~20%. Pick one anchor habit: no phone in the first 30 minutes after waking.',
    color: 'amber',
  },
  {
    min: 31,
    max: 40,
    label: 'High',
    title: 'Compulsive patterns',
    description: 'Your phone is pulling you in ways that are crowding out real life. You likely reach for it without deciding to, and feel anxious when you can\'t.',
    recommendation: 'This rarely improves without structural change — a partner who sees what you see, time-locked access, or accountability that goes beyond willpower. You need a system, not more discipline.',
    color: 'orange',
  },
  {
    min: 41,
    max: 999,
    label: 'Severe',
    title: 'Significant impairment',
    description: 'Phone use is significantly interfering with relationships, sleep, focus, and presence. Your score suggests you\'ve already noticed this.',
    recommendation: 'Consider real accountability — a trusted person who can see your activity, plus clear boundaries you don\'t control alone. Willpower has already failed; that\'s not a character flaw, that\'s how compulsion works.',
    color: 'rose',
  },
];

function getTier(score: number): Tier {
  return TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
}

export default function PhoneAddictionSeverityClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialResult = searchParams.get('result');
  const initialScore = initialResult ? Number(initialResult) : null;

  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [currentQ, setCurrentQ] = useState(0);
  const [showResults, setShowResults] = useState(initialScore !== null && !isNaN(initialScore));
  const [finalScore, setFinalScore] = useState<number | null>(initialScore);

  const totalScore = useMemo(() => answers.reduce((acc, v) => acc + (v >= 0 ? v : 0), 0), [answers]);
  const progressPct = ((currentQ + (showResults ? 1 : 0)) / QUESTIONS.length) * 100;
  const answeredCount = answers.filter((a) => a >= 0).length;

  const handleAnswer = useCallback(
    (value: number) => {
      const next = [...answers];
      next[currentQ] = value;
      setAnswers(next);

      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 250);
      } else {
        const score = next.reduce((acc, v) => acc + Math.max(v, 0), 0);
        setFinalScore(score);
        setShowResults(true);
        const params = new URLSearchParams({ result: String(score) });
        router.replace(`/tools/phone-addiction-severity?${params.toString()}`, { scroll: false });
      }
    },
    [answers, currentQ, router],
  );

  const handleReset = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(-1));
    setCurrentQ(0);
    setShowResults(false);
    setFinalScore(null);
    router.replace('/tools/phone-addiction-severity', { scroll: false });
  }, [router]);

  const displayScore = finalScore ?? totalScore;
  const tier = getTier(displayScore);

  const shareUrl = `https://becandid.io/tools/phone-addiction-severity?result=${displayScore}`;
  const shareTitle = `I scored ${displayScore}/40 on the Phone Addiction Severity Assessment — ${tier.title}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Phone Addiction Severity Assessment
        </h1>
        <p className="text-stone-400 text-lg">
          10 questions. Instant, private results. Nothing is stored.
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
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 leading-snug">
              {QUESTIONS[currentQ]}
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

            {/* Back button */}
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
              Your severity score
            </div>
            <div className="text-6xl md:text-7xl font-bold text-cyan-400 mb-1">
              {displayScore}
              <span className="text-3xl text-stone-500">/40</span>
            </div>
            <div className="text-sm font-medium text-stone-400 mb-4">{tier.label}</div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">{tier.title}</h2>
            <p className="text-stone-300 leading-relaxed max-w-lg mx-auto">{tier.description}</p>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              Recommended next step
            </h3>
            <p className="text-stone-200 leading-relaxed">{tier.recommendation}</p>
          </div>

          {/* Share */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Share your results</h3>
                <p className="text-sm text-stone-400">Your answers stay private. Only the score is shared.</p>
              </div>
              <ShareButton url={shareUrl} title={shareTitle} text={shareTitle} size="sm" />
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to change the pattern?
            </h3>
            <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
              Be Candid pairs you with real accountability — structural change that works when willpower alone doesn&apos;t.
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
                Retake assessment
              </button>
            </div>
          </div>

          {/* Answered info */}
          {answeredCount > 0 && answeredCount < QUESTIONS.length && initialScore === null && (
            <p className="text-xs text-stone-500 text-center">
              Showing partial results based on {answeredCount} of {QUESTIONS.length} answers.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
