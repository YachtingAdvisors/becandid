'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { key: 'c', label: 'Communication', icon: '💬', color: 'text-cyan-400' },
  { key: 't', label: 'Trust', icon: '🤝', color: 'text-emerald-400' },
  { key: 'd', label: 'Digital Boundaries', icon: '📱', color: 'text-amber-400' },
  { key: 'q', label: 'Quality Time', icon: '⏰', color: 'text-purple-400' },
];

const QUESTIONS = [
  // Communication (2)
  {
    text: 'How often do you talk openly about your phone or internet use with your partner?',
    category: 'c',
    options: [
      { label: 'Never — it\'s a sore subject', score: 1 },
      { label: 'Rarely, only when it comes up', score: 2 },
      { label: 'Sometimes, when something concerns me', score: 3 },
      { label: 'Regularly — we check in about it', score: 4 },
    ],
  },
  {
    text: 'If your partner asked to see your phone right now, how would you feel?',
    category: 'c',
    options: [
      { label: 'Panicked — I\'d need to clear things first', score: 1 },
      { label: 'Nervous but I\'d probably let them', score: 2 },
      { label: 'Mostly fine, might be slightly awkward', score: 3 },
      { label: 'Totally comfortable — nothing to hide', score: 4 },
    ],
  },
  // Trust (2)
  {
    text: 'Have you ever deleted messages, browsing history, or apps before your partner could see them?',
    category: 't',
    options: [
      { label: 'Yes, regularly', score: 1 },
      { label: 'Yes, a few times', score: 2 },
      { label: 'Once or twice, but not recently', score: 3 },
      { label: 'Never — or I told them about it', score: 4 },
    ],
  },
  {
    text: 'Does your partner trust how you spend your time online?',
    category: 't',
    options: [
      { label: 'No — it\'s caused real conflict', score: 1 },
      { label: 'They have doubts they don\'t always voice', score: 2 },
      { label: 'Mostly, but some topics are uncomfortable', score: 3 },
      { label: 'Yes — we have transparent digital lives', score: 4 },
    ],
  },
  // Digital Boundaries (2)
  {
    text: 'Do you have agreed-upon rules about phone use (e.g., no phones at dinner)?',
    category: 'd',
    options: [
      { label: 'No rules, and my phone is always around', score: 1 },
      { label: 'We\'ve talked about it but don\'t follow through', score: 2 },
      { label: 'A few loose agreements we mostly keep', score: 3 },
      { label: 'Yes, clear boundaries that we respect', score: 4 },
    ],
  },
  {
    text: 'How often do you use your phone while your partner is talking to you?',
    category: 'd',
    options: [
      { label: 'All the time — I multitask', score: 1 },
      { label: 'Frequently, even when I try not to', score: 2 },
      { label: 'Sometimes, but I catch myself', score: 3 },
      { label: 'Rarely — I put my phone down for conversations', score: 4 },
    ],
  },
  // Quality Time (2)
  {
    text: 'In the last week, how many hours of undistracted time did you spend with your partner?',
    category: 'q',
    options: [
      { label: 'Almost none — screens were always present', score: 1 },
      { label: 'Maybe 1-2 hours', score: 2 },
      { label: '3-5 hours of real quality time', score: 3 },
      { label: '5+ hours of focused, present time together', score: 4 },
    ],
  },
  {
    text: 'When you\'re together, does your phone ever feel like a third person in the room?',
    category: 'q',
    options: [
      { label: 'Yes, constantly', score: 1 },
      { label: 'More often than I\'d like', score: 2 },
      { label: 'Occasionally, but we manage it', score: 3 },
      { label: 'No — we\'re intentional about being present', score: 4 },
    ],
  },
];

function getOverallLabel(score: number): { label: string; color: string; description: string } {
  if (score <= 12) return {
    label: 'Needs Attention',
    color: 'text-red-400',
    description: 'Your digital habits are significantly affecting your relationship. The good news: awareness is the first step.',
  };
  if (score <= 20) return {
    label: 'Room to Grow',
    color: 'text-amber-400',
    description: 'There are some friction points between your digital life and your relationship. Small changes can make a big difference.',
  };
  if (score <= 28) return {
    label: 'Mostly Healthy',
    color: 'text-cyan-400',
    description: 'You\'re managing your digital habits reasonably well, with a few areas that could use more intentionality.',
  };
  return {
    label: 'Thriving',
    color: 'text-emerald-400',
    description: 'Your digital habits and relationship coexist beautifully. You\'ve built real trust and healthy boundaries.',
  };
}

export default function HealthCheckClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTotal = Number(searchParams.get('s')) || 0;
  const initialScores = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = Number(searchParams.get(cat.key)) || 0;
    return acc;
  }, {} as Record<string, number>);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ category: string; score: number }[]>([]);
  const [showResults, setShowResults] = useState(!!initialTotal);
  const [embedCopied, setEmbedCopied] = useState(false);

  // Calculate category scores
  const categoryScores = showResults && initialTotal
    ? initialScores
    : answers.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.score;
        return acc;
      }, {} as Record<string, number>);

  const totalScore = initialTotal || Object.values(categoryScores).reduce((a, b) => a + b, 0);
  const overall = getOverallLabel(totalScore);
  const progress = (currentQ / QUESTIONS.length) * 100;

  const handleAnswer = useCallback((score: number) => {
    const q = QUESTIONS[currentQ];
    const newAnswers = [...answers, { category: q.category, score }];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const scores = newAnswers.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.score;
        return acc;
      }, {} as Record<string, number>);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      setShowResults(true);

      const params = new URLSearchParams({ s: String(total) });
      CATEGORIES.forEach((cat) => params.set(cat.key, String(scores[cat.key] || 0)));
      router.replace(`/tools/relationship-health?${params.toString()}`, { scroll: false });
    }
  }, [answers, currentQ, router]);

  const restart = useCallback(() => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
    router.replace('/tools/relationship-health', { scroll: false });
  }, [router]);

  const shareParams = new URLSearchParams({ s: String(totalScore) });
  CATEGORIES.forEach((cat) => shareParams.set(cat.key, String(categoryScores[cat.key] || 0)));
  const shareUrl = `https://becandid.io/tools/relationship-health?${shareParams.toString()}`;
  const shareTitle = `My relationship digital health: ${overall.label}`;

  const embedCode = `<iframe src="https://becandid.io/embed/relationship-health" width="100%" height="600" style="border:none;border-radius:12px;" title="Relationship Health Check — Be Candid"></iframe>`;

  const copyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }, [embedCode]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Relationship Health Check
        </h1>
        <p className="text-stone-400 text-lg">
          How are your digital habits affecting your closest relationship?
        </p>
      </div>

      {!showResults ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
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

          <div className="mb-2">
            <span className="text-xs font-medium text-stone-500">
              {CATEGORIES.find((c) => c.key === QUESTIONS[currentQ].category)?.label}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-white mb-6">
            {QUESTIONS[currentQ].text}
          </h2>

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
          {/* Overall Result */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
            <div className="text-sm text-stone-500 mb-2">Your relationship digital health</div>
            <div className={`text-4xl font-bold mb-2 ${overall.color}`}>
              {overall.label}
            </div>
            <div className="text-sm text-stone-400 mb-4">Score: {totalScore} / 32</div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto">
              {overall.description}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-6">Category breakdown</h3>
            <div className="space-y-4">
              {CATEGORIES.map((cat) => {
                const score = categoryScores[cat.key] || 0;
                const maxScore = 8;
                const pct = (score / maxScore) * 100;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-stone-300 flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.label}
                      </span>
                      <span className={`text-sm font-semibold ${cat.color}`}>{score}/{maxScore}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          background: cat.key === 'c' ? '#22d3ee' : cat.key === 't' ? '#34d399' : cat.key === 'd' ? '#fbbf24' : '#a78bfa',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
              Retake assessment
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
              Build real transparency together
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              Be Candid helps couples create digital accountability with consent-based sharing and honest communication.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              Start together for free
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
