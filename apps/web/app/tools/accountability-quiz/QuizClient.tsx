'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

const QUESTIONS = [
  {
    text: 'When you fall short of a personal goal, what\'s your first instinct?',
    options: [
      { label: 'Hide it — nobody needs to know', score: 1 },
      { label: 'Feel bad but move on quickly', score: 2 },
      { label: 'Reflect on what went wrong', score: 3 },
      { label: 'Tell someone I trust and ask for support', score: 4 },
    ],
  },
  {
    text: 'How comfortable are you sharing your struggles with another person?',
    options: [
      { label: 'Very uncomfortable — I keep things private', score: 1 },
      { label: 'It depends on the person', score: 2 },
      { label: 'I can open up if I feel safe', score: 3 },
      { label: 'I actively seek trusted people to share with', score: 4 },
    ],
  },
  {
    text: 'If someone pointed out a blind spot in your behavior, how would you react?',
    options: [
      { label: 'Defensive — they don\'t know the full story', score: 1 },
      { label: 'Uncomfortable but I\'d think about it later', score: 2 },
      { label: 'Grateful, even if it stings', score: 3 },
      { label: 'I\'d ask for more detail so I can grow', score: 4 },
    ],
  },
  {
    text: 'How often do you track or journal about your habits?',
    options: [
      { label: 'Never — I don\'t see the point', score: 1 },
      { label: 'I\'ve tried but can\'t stick with it', score: 2 },
      { label: 'Occasionally when motivation strikes', score: 3 },
      { label: 'Regularly — it\'s part of my routine', score: 4 },
    ],
  },
  {
    text: 'When temptation hits, what typically happens?',
    options: [
      { label: 'I give in most of the time', score: 1 },
      { label: 'I resist sometimes but often slip', score: 2 },
      { label: 'I have strategies that work about half the time', score: 3 },
      { label: 'I have a plan and people who help me stay on track', score: 4 },
    ],
  },
  {
    text: 'How do you feel about someone else seeing your screen time data?',
    options: [
      { label: 'Absolutely not', score: 1 },
      { label: 'Nervous but maybe it would help', score: 2 },
      { label: 'I\'d be open to it with the right person', score: 3 },
      { label: 'I think transparency would make me stronger', score: 4 },
    ],
  },
  {
    text: 'What\'s your relationship with consistency?',
    options: [
      { label: 'I start strong but always fizzle out', score: 1 },
      { label: 'I have streaks but they break easily', score: 2 },
      { label: 'I can maintain habits for weeks at a time', score: 3 },
      { label: 'I\'ve built lasting habits that stuck for months', score: 4 },
    ],
  },
  {
    text: 'Why are you taking this quiz?',
    options: [
      { label: 'Just curious, not really looking to change', score: 1 },
      { label: 'Something needs to change but I\'m not sure what', score: 2 },
      { label: 'I know what needs to change and I\'m exploring options', score: 3 },
      { label: 'I\'m ready to commit and looking for the right tool', score: 4 },
    ],
  },
];

type Level = 'not-ready' | 'getting-there' | 'ready' | 'highly-motivated';

const LEVELS: Record<Level, { label: string; color: string; description: string; tips: string[] }> = {
  'not-ready': {
    label: 'Not Ready Yet',
    color: 'text-stone-400',
    description: 'That\'s okay. Real change starts with honest self-awareness — and you\'re here, which counts for something.',
    tips: [
      'Start with small wins: notice one digital habit this week',
      'Read about others\' accountability journeys on our blog',
      'Come back when something shifts — this quiz will be here',
    ],
  },
  'getting-there': {
    label: 'Getting There',
    color: 'text-amber-400',
    description: 'You\'re aware something needs to change but haven\'t fully committed yet. That tension is a sign you\'re close.',
    tips: [
      'Try journaling about one digital trigger each day',
      'Identify one person you could trust with your journey',
      'Take our Rival Assessment to discover your specific patterns',
    ],
  },
  'ready': {
    label: 'Ready',
    color: 'text-cyan-400',
    description: 'You have the self-awareness and willingness needed for real accountability. The next step is finding the right structure.',
    tips: [
      'Set up accountability with a trusted partner or friend',
      'Start tracking your screen time patterns daily',
      'Consider professional support to accelerate your growth',
    ],
  },
  'highly-motivated': {
    label: 'Highly Motivated',
    color: 'text-emerald-400',
    description: 'You\'re not just ready — you\'re equipped. You have the mindset, habits, and openness that make accountability transformative.',
    tips: [
      'Pair up with an accountability partner today',
      'Use daily journaling to deepen your self-awareness',
      'Share your journey — your story could inspire someone else',
    ],
  },
};

function getLevel(score: number): Level {
  if (score <= 12) return 'not-ready';
  if (score <= 20) return 'getting-there';
  if (score <= 28) return 'ready';
  return 'highly-motivated';
}

export default function QuizClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialScore = Number(searchParams.get('score')) || 0;
  const initialLevel = (searchParams.get('level') || '') as Level;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(!!initialScore && !!initialLevel);
  const [embedCopied, setEmbedCopied] = useState(false);

  const totalScore = initialScore || answers.reduce((a, b) => a + b, 0);
  const level = initialLevel || getLevel(totalScore);
  const levelData = LEVELS[level];
  const progress = (currentQ / QUESTIONS.length) * 100;

  const handleAnswer = useCallback((score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      const lvl = getLevel(total);
      setShowResults(true);
      router.replace(`/tools/accountability-quiz?score=${total}&level=${lvl}`, { scroll: false });
    }
  }, [answers, currentQ, router]);

  const restart = useCallback(() => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
    router.replace('/tools/accountability-quiz', { scroll: false });
  }, [router]);

  const shareUrl = `https://becandid.io/tools/accountability-quiz?score=${totalScore}&level=${level}`;
  const shareTitle = `My accountability readiness: ${levelData.label}`;

  const embedCode = `<iframe src="https://becandid.io/embed/accountability-quiz" width="100%" height="600" style="border:none;border-radius:12px;" title="Accountability Readiness Quiz — Be Candid"></iframe>`;

  const copyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }, [embedCode]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Accountability Readiness Quiz
        </h1>
        <p className="text-stone-400 text-lg">
          8 questions. No sign-up. Honest results.
        </p>
      </div>

      {!showResults ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-stone-500 mb-2">
              <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-white mb-6">
            {QUESTIONS[currentQ].text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {QUESTIONS[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.score)}
                className="w-full text-left px-5 py-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/30 text-stone-300 hover:text-white transition-all text-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Result Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
            <div className="text-sm text-stone-500 mb-2">Your accountability readiness</div>
            <div className={`text-4xl font-bold mb-2 ${levelData.color}`}>
              {levelData.label}
            </div>
            <div className="text-sm text-stone-400 mb-4">Score: {totalScore} / 32</div>

            {/* Score bar */}
            <div className="h-3 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto mb-6">
              <div
                className="h-full rounded-full bg-gradient-to-r from-stone-500 via-amber-500 via-cyan-500 to-emerald-500 transition-all duration-1000"
                style={{ width: `${(totalScore / 32) * 100}%` }}
              />
            </div>

            <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto">
              {levelData.description}
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-4">What to do next</h3>
            <ul className="space-y-3">
              {levelData.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-stone-400">
                  <span className="text-cyan-400 mt-0.5 material-symbols-outlined text-base">check_circle</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Share + Embed */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-white">Share your results</h3>
              <ShareButton url={shareUrl} title={shareTitle} text={shareTitle} size="sm" />
            </div>

            <button
              onClick={restart}
              className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              Retake quiz
            </button>

            <div className="border-t border-white/10 pt-6 mt-6">
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
            <h3 className="text-xl font-semibold text-white mb-2">
              {level === 'not-ready' || level === 'getting-there'
                ? 'Discover your specific patterns first'
                : 'Ready to start your accountability journey?'}
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              {level === 'not-ready' || level === 'getting-there'
                ? 'Take the Rival Assessment to understand what drives your digital habits.'
                : 'Be Candid gives you the tools and transparency to make lasting change.'}
            </p>
            <Link
              href={level === 'not-ready' || level === 'getting-there' ? '/assessment' : '/auth/signup'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              {level === 'not-ready' || level === 'getting-there' ? 'Take the assessment' : 'Start for free'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
