'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

type Archetype = 'Numb-er' | 'Performer' | 'Escaper' | 'Controller';

interface Option {
  label: string;
  archetype: Archetype;
}

interface Question {
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    text: 'When you\'re feeling anxious, which is most common?',
    options: [
      { label: 'Scrolling news or markets to feel in control', archetype: 'Controller' },
      { label: 'Scrolling social media to feel connected', archetype: 'Performer' },
      { label: 'Watching videos to not feel anything at all', archetype: 'Numb-er' },
      { label: 'Playing games or diving into a show to escape', archetype: 'Escaper' },
    ],
  },
  {
    text: 'Your phone is most likely to be reached for when...',
    options: [
      { label: 'You feel left out or invisible', archetype: 'Performer' },
      { label: 'You feel something uncomfortable rising', archetype: 'Numb-er' },
      { label: 'You feel restless or bored', archetype: 'Escaper' },
      { label: 'You feel uncertain about something', archetype: 'Controller' },
    ],
  },
  {
    text: 'The last time you stayed up too late on your phone, it was probably...',
    options: [
      { label: 'Checking analytics, news, or updates', archetype: 'Controller' },
      { label: 'Scrolling content for stimulation', archetype: 'Escaper' },
      { label: 'Watching others\' lives to fill a void', archetype: 'Performer' },
      { label: 'Consuming to not feel the day', archetype: 'Numb-er' },
    ],
  },
  {
    text: 'Which sentence rings most true?',
    options: [
      { label: '"My phone is my dissociation button"', archetype: 'Numb-er' },
      { label: '"My phone is my external nervous system"', archetype: 'Controller' },
      { label: '"My phone is my stage and audience"', archetype: 'Performer' },
      { label: '"My phone is my escape hatch"', archetype: 'Escaper' },
    ],
  },
  {
    text: 'After an hour of scrolling, what do you most often feel?',
    options: [
      { label: 'Vaguely checked-out and disconnected from my body', archetype: 'Numb-er' },
      { label: 'Unseen — like I still don\'t matter', archetype: 'Performer' },
      { label: 'Behind on the thing I was avoiding', archetype: 'Escaper' },
      { label: 'Vigilant, still scanning for what I might have missed', archetype: 'Controller' },
    ],
  },
  {
    text: 'Which of these would you find hardest to give up for a week?',
    options: [
      { label: 'Posting, likes, and seeing who responded', archetype: 'Performer' },
      { label: 'News, notifications, and real-time updates', archetype: 'Controller' },
      { label: 'Shows, games, or long scroll sessions', archetype: 'Escaper' },
      { label: 'Zoning out to the screen when overwhelmed', archetype: 'Numb-er' },
    ],
  },
  {
    text: 'When you haven\'t checked your phone for a while, the first urge is usually to...',
    options: [
      { label: 'See what I missed — did anything go wrong?', archetype: 'Controller' },
      { label: 'See if anyone reached for me', archetype: 'Performer' },
      { label: 'Get a hit of something stimulating', archetype: 'Escaper' },
      { label: 'Take the edge off whatever I\'m feeling', archetype: 'Numb-er' },
    ],
  },
  {
    text: 'If your phone could talk, what would it say about you?',
    options: [
      { label: '"You use me to stop feeling."', archetype: 'Numb-er' },
      { label: '"You use me to be seen."', archetype: 'Performer' },
      { label: '"You use me to leave the room without leaving."', archetype: 'Escaper' },
      { label: '"You use me so nothing can surprise you."', archetype: 'Controller' },
    ],
  },
];

interface ArchetypeInfo {
  name: Archetype;
  tagline: string;
  description: string;
  insight: string;
  articleTitle: string;
  articleHref: string;
  icon: string;
}

const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  'Numb-er': {
    name: 'Numb-er',
    tagline: 'The screen is your anesthesia',
    description:
      'You reach for your phone to turn down the volume on uncomfortable feelings. Scrolling isn\'t about content — it\'s about not feeling. The screen functions as an off-switch for sensation.',
    insight:
      'The antidote isn\'t less phone — it\'s more capacity to feel. The work is learning that uncomfortable feelings pass, and you don\'t have to dissociate from them.',
    articleTitle: 'From Numbing to Experiencing — Feeling Emotions Without a Phone',
    articleHref: '/blog/numbing-to-experiencing-feeling-emotions-without-phone',
    icon: '🌫️',
  },
  Performer: {
    name: 'Performer',
    tagline: 'The screen is your stage',
    description:
      'You reach for your phone to be seen — posting, checking, measuring. The scroll is about audience and belonging. Validation from likes and views fills a place that wants connection.',
    insight:
      'The antidote isn\'t quitting social media — it\'s learning you\'re enough without an audience. The work is reclaiming a sense of worth that doesn\'t depend on anyone watching.',
    articleTitle: 'From Performing to Belonging — Enough Without an Audience',
    articleHref: '/blog/performing-to-belonging-enough-without-audience',
    icon: '🎭',
  },
  Escaper: {
    name: 'Escaper',
    tagline: 'The screen is your exit door',
    description:
      'You reach for your phone to leave the present moment. Boredom, restlessness, or dread become unbearable, and the screen is where you go. Anywhere but here.',
    insight:
      'The antidote isn\'t forcing yourself to stay — it\'s building tolerance for presence. The work is discovering that this moment, as ordinary as it feels, is survivable.',
    articleTitle: 'From Escaping to Presence — Grounding in Screen Addiction Recovery',
    articleHref: '/blog/escaping-to-presence-grounding-screen-addiction',
    icon: '🚪',
  },
  Controller: {
    name: 'Controller',
    tagline: 'The screen is your radar',
    description:
      'You reach for your phone to manage uncertainty. News, updates, analytics, refreshes — the scroll is scanning for threats or changes. Being informed feels like being safe.',
    insight:
      'The antidote isn\'t less information — it\'s more trust in uncertainty. The work is realizing you can\'t scan your way to safety, and that refreshing doesn\'t change what will happen next.',
    articleTitle: 'From Controlling to Surrendering — Trusting Uncertainty',
    articleHref: '/blog/controlling-to-surrendering-trusting-uncertainty',
    icon: '📡',
  },
};

const ARCHETYPE_KEYS: Archetype[] = ['Numb-er', 'Performer', 'Escaper', 'Controller'];

function computeResult(answers: Archetype[]): { primary: Archetype; counts: Record<Archetype, number> } {
  const counts: Record<Archetype, number> = {
    'Numb-er': 0,
    Performer: 0,
    Escaper: 0,
    Controller: 0,
  };
  answers.forEach((a) => {
    if (a) counts[a] += 1;
  });
  let primary: Archetype = 'Numb-er';
  let max = -1;
  ARCHETYPE_KEYS.forEach((key) => {
    if (counts[key] > max) {
      max = counts[key];
      primary = key;
    }
  });
  return { primary, counts };
}

export default function DigitalShadowSelfClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialResult = searchParams.get('result') as Archetype | null;
  const initialArchetype =
    initialResult && ARCHETYPE_KEYS.includes(initialResult) ? initialResult : null;

  const [answers, setAnswers] = useState<(Archetype | null)[]>(Array(QUESTIONS.length).fill(null));
  const [currentQ, setCurrentQ] = useState(0);
  const [showResults, setShowResults] = useState(initialArchetype !== null);
  const [finalArchetype, setFinalArchetype] = useState<Archetype | null>(initialArchetype);

  const progressPct = ((currentQ + (showResults ? 1 : 0)) / QUESTIONS.length) * 100;

  const handleAnswer = useCallback(
    (archetype: Archetype) => {
      const next = [...answers];
      next[currentQ] = archetype;
      setAnswers(next);

      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 250);
      } else {
        const { primary } = computeResult(next.filter(Boolean) as Archetype[]);
        setFinalArchetype(primary);
        setShowResults(true);
        const params = new URLSearchParams({ result: primary });
        router.replace(`/tools/digital-shadow-self?${params.toString()}`, { scroll: false });
      }
    },
    [answers, currentQ, router],
  );

  const handleReset = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrentQ(0);
    setShowResults(false);
    setFinalArchetype(null);
    router.replace('/tools/digital-shadow-self', { scroll: false });
  }, [router]);

  const result = useMemo(() => {
    if (finalArchetype) {
      const cleanAnswers = answers.filter(Boolean) as Archetype[];
      if (cleanAnswers.length > 0) {
        return computeResult(cleanAnswers);
      }
      return {
        primary: finalArchetype,
        counts: { 'Numb-er': 0, Performer: 0, Escaper: 0, Controller: 0 } as Record<Archetype, number>,
      };
    }
    return null;
  }, [finalArchetype, answers]);

  const archetypeInfo = result ? ARCHETYPES[result.primary] : null;

  const shareUrl = archetypeInfo
    ? `https://becandid.io/tools/digital-shadow-self?result=${encodeURIComponent(archetypeInfo.name)}`
    : '';
  const shareTitle = archetypeInfo
    ? `My digital shadow archetype: ${archetypeInfo.name} — ${archetypeInfo.tagline}`
    : '';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Digital Shadow Self Discovery
        </h1>
        <p className="text-stone-400 text-lg">
          8 questions. Find out which shadow pattern is running your scroll.
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
              {QUESTIONS[currentQ].text}
            </h2>

            <div className="space-y-2">
              {QUESTIONS[currentQ].options.map((opt, i) => {
                const selected = answers[currentQ] === opt.archetype;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.archetype)}
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

      {showResults && archetypeInfo && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Result card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
            <div className="text-5xl mb-3">{archetypeInfo.icon}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">
              Your primary digital shadow
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              The <span className="text-cyan-400">{archetypeInfo.name}</span>
            </h2>
            <p className="text-stone-400 italic mb-6">{archetypeInfo.tagline}</p>
            <p className="text-stone-200 leading-relaxed max-w-lg mx-auto">
              {archetypeInfo.description}
            </p>
          </div>

          {/* Breakdown (only shown when fresh answers exist) */}
          {result.counts[result.primary] > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4">
                Your shadow mix
              </h3>
              <div className="space-y-3">
                {ARCHETYPE_KEYS.map((key) => {
                  const count = result.counts[key];
                  const pct = (count / QUESTIONS.length) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white font-medium">{key}</span>
                        <span className="text-stone-400">{count} of {QUESTIONS.length}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            key === result.primary
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-400'
                              : 'bg-white/30'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insight + article */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              The shadow work
            </h3>
            <p className="text-stone-200 leading-relaxed mb-6">{archetypeInfo.insight}</p>
            <Link
              href={archetypeInfo.articleHref}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Read: {archetypeInfo.articleTitle}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Share */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Share your archetype</h3>
                <p className="text-sm text-stone-400">Which shadow runs your scroll?</p>
              </div>
              <ShareButton url={shareUrl} title={shareTitle} text={shareTitle} size="sm" />
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to do the work your shadow is pointing at?
            </h3>
            <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
              Be Candid is built around the Stringer framework — turning unconscious patterns into conscious ones, with real accountability.
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
                Retake quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
