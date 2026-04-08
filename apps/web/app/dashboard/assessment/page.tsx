'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ─── Rival definitions ─────────────────────────────────── */
type RivalId =
  | 'pornography' | 'sexting' | 'social_media' | 'binge_watching'
  | 'impulse_shopping' | 'doomscrolling' | 'alcohol_drugs' | 'vaping_tobacco'
  | 'gambling' | 'sports_betting' | 'day_trading' | 'dating_apps'
  | 'emotional_affairs' | 'gaming' | 'rage_content' | 'gossip_drama'
  | 'isolation' | 'ai_relationships' | 'overworking' | 'sleep_avoidance'
  | 'self_harm' | 'procrastination' | 'eating_disorder' | 'body_checking';

const RIVAL_META: Record<RivalId, { label: string; icon: string; color: string }> = {
  pornography:      { label: 'Pornography', icon: 'visibility_off', color: 'bg-red-500' },
  sexting:          { label: 'Sexting', icon: 'chat_bubble', color: 'bg-pink-500' },
  social_media:     { label: 'Social Media', icon: 'phone_iphone', color: 'bg-blue-500' },
  binge_watching:   { label: 'Binge Watching', icon: 'tv', color: 'bg-purple-500' },
  impulse_shopping: { label: 'Impulse Shopping', icon: 'shopping_cart', color: 'bg-amber-500' },
  doomscrolling:    { label: 'Doomscrolling', icon: 'trending_down', color: 'bg-orange-500' },
  alcohol_drugs:    { label: 'Alcohol & Drugs', icon: 'local_bar', color: 'bg-rose-600' },
  vaping_tobacco:   { label: 'Vaping & Tobacco', icon: 'smoking_rooms', color: 'bg-gray-500' },
  gambling:         { label: 'Gambling', icon: 'casino', color: 'bg-green-600' },
  sports_betting:   { label: 'Sports Betting', icon: 'sports_soccer', color: 'bg-green-500' },
  day_trading:      { label: 'Day Trading', icon: 'candlestick_chart', color: 'bg-emerald-500' },
  dating_apps:      { label: 'Dating Apps', icon: 'favorite', color: 'bg-pink-400' },
  emotional_affairs:{ label: 'Emotional Affairs', icon: 'heart_broken', color: 'bg-rose-400' },
  gaming:           { label: 'Excessive Gaming', icon: 'sports_esports', color: 'bg-indigo-500' },
  rage_content:     { label: 'Rage & Outrage Content', icon: 'whatshot', color: 'bg-red-600' },
  gossip_drama:     { label: 'Gossip & Drama', icon: 'record_voice_over', color: 'bg-fuchsia-500' },
  isolation:        { label: 'Isolation & Withdrawal', icon: 'person_off', color: 'bg-slate-500' },
  ai_relationships: { label: 'AI Relationships', icon: 'smart_toy', color: 'bg-cyan-500' },
  overworking:      { label: 'Overworking', icon: 'work', color: 'bg-yellow-600' },
  sleep_avoidance:  { label: 'Sleep Avoidance', icon: 'bedtime_off', color: 'bg-indigo-400' },
  self_harm:        { label: 'Self-Harm Risk', icon: 'emergency', color: 'bg-red-700' },
  procrastination:  { label: 'Procrastination', icon: 'hourglass_empty', color: 'bg-amber-400' },
  eating_disorder:  { label: 'Eating Disorder', icon: 'restaurant', color: 'bg-lime-600' },
  body_checking:    { label: 'Body Checking', icon: 'person_search', color: 'bg-teal-500' },
};

/* ─── Word-to-rival weighted mapping ────────────────────── */
interface Word {
  text: string;
  weights: Partial<Record<RivalId, number>>;
}

// Each step has a theme and a set of words
interface Step {
  title: string;
  subtitle: string;
  icon: string;
  words: Word[];
}

const STEPS: Step[] = [
  {
    title: 'Emotional Landscape',
    subtitle: 'Select every word that resonates with how you often feel.',
    icon: 'psychology',
    words: [
      { text: 'Lonely', weights: { pornography: 3, dating_apps: 2, emotional_affairs: 2, isolation: 3, ai_relationships: 2 } },
      { text: 'Bored', weights: { social_media: 3, binge_watching: 3, gaming: 2, doomscrolling: 2, impulse_shopping: 2 } },
      { text: 'Anxious', weights: { doomscrolling: 3, social_media: 2, procrastination: 2, sleep_avoidance: 2, self_harm: 1 } },
      { text: 'Restless', weights: { sleep_avoidance: 3, social_media: 2, gambling: 2, overworking: 2, procrastination: 1 } },
      { text: 'Numb', weights: { pornography: 2, alcohol_drugs: 3, binge_watching: 2, self_harm: 2, gaming: 1 } },
      { text: 'Ashamed', weights: { pornography: 3, sexting: 2, gambling: 2, impulse_shopping: 1, self_harm: 2 } },
      { text: 'Overwhelmed', weights: { procrastination: 3, doomscrolling: 2, isolation: 2, self_harm: 2, sleep_avoidance: 2 } },
      { text: 'Envious', weights: { social_media: 3, impulse_shopping: 2, body_checking: 2, gossip_drama: 1 } },
      { text: 'Angry', weights: { rage_content: 3, alcohol_drugs: 2, gaming: 2, gossip_drama: 1 } },
      { text: 'Driven', weights: { overworking: 3, day_trading: 2, sports_betting: 1 } },
      { text: 'Empty', weights: { pornography: 2, ai_relationships: 2, alcohol_drugs: 2, binge_watching: 2, isolation: 2, self_harm: 2 } },
      { text: 'Insecure', weights: { social_media: 3, body_checking: 3, dating_apps: 2, eating_disorder: 2, gossip_drama: 1 } },
      { text: 'Guilty', weights: { pornography: 2, sexting: 2, emotional_affairs: 2, gambling: 2, impulse_shopping: 2 } },
      { text: 'Trapped', weights: { overworking: 2, isolation: 2, self_harm: 3, sleep_avoidance: 2 } },
      { text: 'Curious', weights: { pornography: 2, dating_apps: 2, day_trading: 2, ai_relationships: 2 } },
      { text: 'Competitive', weights: { gaming: 3, sports_betting: 3, day_trading: 2, overworking: 2 } },
    ],
  },
  {
    title: 'Behavioral Patterns',
    subtitle: 'Select habits or tendencies you recognize in yourself.',
    icon: 'repeat',
    words: [
      { text: 'Staying up too late', weights: { sleep_avoidance: 3, binge_watching: 2, social_media: 2, gaming: 2, pornography: 2 } },
      { text: 'Checking my phone first thing', weights: { social_media: 3, doomscrolling: 2, dating_apps: 1 } },
      { text: 'Losing track of time online', weights: { social_media: 3, binge_watching: 3, gaming: 3, doomscrolling: 2 } },
      { text: 'Spending money I shouldn\'t', weights: { impulse_shopping: 3, gambling: 3, sports_betting: 2, day_trading: 2 } },
      { text: 'Keeping secrets from people close to me', weights: { pornography: 3, sexting: 3, emotional_affairs: 3, gambling: 2, alcohol_drugs: 2 } },
      { text: 'Avoiding responsibilities', weights: { procrastination: 3, gaming: 2, binge_watching: 2, social_media: 1 } },
      { text: 'Working through meals and weekends', weights: { overworking: 3, sleep_avoidance: 1 } },
      { text: 'Comparing myself to others', weights: { social_media: 3, body_checking: 3, eating_disorder: 2, impulse_shopping: 1 } },
      { text: 'Canceling plans to be alone', weights: { isolation: 3, gaming: 2, binge_watching: 1, social_media: 1 } },
      { text: 'Using substances to relax', weights: { alcohol_drugs: 3, vaping_tobacco: 3 } },
      { text: 'Refreshing feeds compulsively', weights: { social_media: 3, doomscrolling: 3, sports_betting: 2, day_trading: 2 } },
      { text: 'Making impulsive decisions', weights: { impulse_shopping: 3, gambling: 3, dating_apps: 2, day_trading: 2, sexting: 1 } },
      { text: 'Chasing the next win', weights: { gambling: 3, sports_betting: 3, day_trading: 3, gaming: 2 } },
      { text: 'Seeking validation from strangers', weights: { social_media: 3, dating_apps: 3, sexting: 2, ai_relationships: 1 } },
      { text: 'Talking to someone I shouldn\'t be', weights: { emotional_affairs: 3, sexting: 3, dating_apps: 2, ai_relationships: 2 } },
      { text: 'Watching "just one more" episode', weights: { binge_watching: 3, procrastination: 2, sleep_avoidance: 2 } },
    ],
  },
  {
    title: 'Trigger Situations',
    subtitle: 'Select situations that tend to pull you off track.',
    icon: 'bolt',
    words: [
      { text: 'After an argument', weights: { alcohol_drugs: 2, pornography: 2, rage_content: 2, emotional_affairs: 2, isolation: 2, self_harm: 2 } },
      { text: 'Late at night alone', weights: { pornography: 3, sleep_avoidance: 3, binge_watching: 2, dating_apps: 2, gambling: 1 } },
      { text: 'When I feel left out', weights: { social_media: 3, gossip_drama: 2, isolation: 2, impulse_shopping: 2, ai_relationships: 1 } },
      { text: 'During stressful deadlines', weights: { procrastination: 3, overworking: 3, vaping_tobacco: 2, social_media: 1 } },
      { text: 'When I\'m home alone', weights: { pornography: 3, binge_watching: 2, gaming: 2, alcohol_drugs: 2, isolation: 1 } },
      { text: 'After a bad day at work', weights: { alcohol_drugs: 3, impulse_shopping: 2, binge_watching: 2, gambling: 1, vaping_tobacco: 2 } },
      { text: 'Scrolling in bed', weights: { social_media: 3, doomscrolling: 3, sleep_avoidance: 3, pornography: 1 } },
      { text: 'When my self-esteem is low', weights: { body_checking: 3, eating_disorder: 2, social_media: 2, dating_apps: 2, self_harm: 2 } },
      { text: 'When boredom hits', weights: { gaming: 3, social_media: 2, binge_watching: 2, impulse_shopping: 2, gambling: 2 } },
      { text: 'During social gatherings', weights: { alcohol_drugs: 3, vaping_tobacco: 2, social_media: 1 } },
      { text: 'When I need to escape reality', weights: { gaming: 3, binge_watching: 3, alcohol_drugs: 2, pornography: 2, ai_relationships: 2 } },
      { text: 'After seeing upsetting news', weights: { doomscrolling: 3, rage_content: 3, alcohol_drugs: 1, gossip_drama: 1 } },
    ],
  },
  {
    title: 'Inner Dialogue',
    subtitle: 'Select thoughts you catch yourself thinking.',
    icon: 'forum',
    words: [
      { text: '"Just this once won\'t hurt"', weights: { pornography: 2, gambling: 3, impulse_shopping: 2, alcohol_drugs: 2, sexting: 1 } },
      { text: '"I deserve this after what I\'ve been through"', weights: { impulse_shopping: 3, binge_watching: 2, alcohol_drugs: 2, gambling: 1 } },
      { text: '"Nobody really understands me"', weights: { isolation: 3, ai_relationships: 3, emotional_affairs: 2, self_harm: 1 } },
      { text: '"I need to be more productive"', weights: { overworking: 3, procrastination: 2, sleep_avoidance: 1 } },
      { text: '"What are they saying about me?"', weights: { gossip_drama: 3, social_media: 3 } },
      { text: '"I\'ll stop after this one"', weights: { binge_watching: 3, gaming: 2, social_media: 2, gambling: 2, doomscrolling: 2 } },
      { text: '"I can win it back"', weights: { gambling: 3, sports_betting: 3, day_trading: 3 } },
      { text: '"If I looked different, things would be better"', weights: { body_checking: 3, eating_disorder: 3, social_media: 2, dating_apps: 1 } },
      { text: '"Everyone else can handle it, why can\'t I?"', weights: { alcohol_drugs: 2, self_harm: 2, social_media: 2, overworking: 1 } },
      { text: '"I just need something to take the edge off"', weights: { alcohol_drugs: 3, vaping_tobacco: 3, pornography: 2, gambling: 1 } },
      { text: '"I\'ll deal with it tomorrow"', weights: { procrastination: 3, sleep_avoidance: 2, binge_watching: 1 } },
      { text: '"They don\'t appreciate me enough"', weights: { emotional_affairs: 3, dating_apps: 2, overworking: 2, rage_content: 1 } },
    ],
  },
];

const TOTAL_WORDS = STEPS.reduce((sum, s) => sum + s.words.length, 0);

/* ─── Scoring ────────────────────────────────────────────── */
function calculateResults(selected: Set<string>): { id: RivalId; label: string; icon: string; color: string; pct: number }[] {
  const scores: Partial<Record<RivalId, number>> = {};
  const maxPossible: Partial<Record<RivalId, number>> = {};

  for (const step of STEPS) {
    for (const word of step.words) {
      for (const [rival, weight] of Object.entries(word.weights)) {
        const rid = rival as RivalId;
        maxPossible[rid] = (maxPossible[rid] ?? 0) + weight;
        if (selected.has(word.text)) {
          scores[rid] = (scores[rid] ?? 0) + weight;
        }
      }
    }
  }

  const results = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([id, score]) => {
      const rid = id as RivalId;
      const max = maxPossible[rid] ?? 1;
      const pct = Math.round((score / max) * 100);
      return { id: rid, ...RIVAL_META[rid], pct };
    })
    .sort((a, b) => b.pct - a.pct);

  return results;
}

/* ─── Component ──────────────────────────────────────────── */
export default function AssessmentPage() {
  const [step, setStep] = useState(0); // 0..3 = questions, 4 = results
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isResults = step >= STEPS.length;

  const results = useMemo(
    () => (isResults ? calculateResults(selected) : []),
    [isResults, selected]
  );

  function toggle(word: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  function next() {
    if (step < STEPS.length) setStep(step + 1);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  async function saveResults() {
    setSaving(true);
    const topRivals = results.slice(0, 8).map(r => r.id);
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: topRivals }),
      });
    } catch {}
    setSaving(false);
    window.location.href = '/dashboard';
  }

  const progress = ((step) / STEPS.length) * 100;
  const selectedInStep = currentStep ? currentStep.words.filter(w => selected.has(w.text)).length : 0;

  /* ── Results Screen ──────────────────────────────────── */
  if (isResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Your Rival Profile
          </h1>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
            Based on your responses, here are the digital rivals most likely to challenge you — ranked by match strength.
          </p>
          <p className="text-xs text-on-surface-variant/60 font-label">
            {selected.size} of {TOTAL_WORDS} indicators selected
          </p>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">check_circle</span>
            <h3 className="font-headline font-bold text-on-surface text-lg mb-2">No strong matches</h3>
            <p className="text-sm text-on-surface-variant">You didn&apos;t select enough indicators. Go back and answer honestly — this is just for you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((rival, idx) => (
              <div
                key={rival.id}
                className={`bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 transition-all duration-200 ${
                  idx < 3 ? 'shadow-md' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-headline font-black text-sm ${
                    idx === 0 ? 'bg-red-100 text-red-700' :
                    idx === 1 ? 'bg-orange-100 text-orange-700' :
                    idx === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${rival.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{rival.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-headline font-bold text-sm text-on-surface">{rival.label}</h3>
                      <span className={`font-headline font-bold text-sm ${
                        rival.pct >= 70 ? 'text-red-600' :
                        rival.pct >= 45 ? 'text-amber-600' :
                        'text-on-surface-variant'
                      }`}>
                        {rival.pct}%
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          rival.pct >= 70 ? 'bg-red-500' :
                          rival.pct >= 45 ? 'bg-amber-500' :
                          'bg-primary/60'
                        }`}
                        style={{ width: `${rival.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-on-surface-variant font-label">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>High (70%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>Moderate (45-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <span>Low (&lt;45%)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={saveResults}
            disabled={saving || results.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? 'Saving...' : 'Save & Set as My Rivals'}
          </button>
          <button
            onClick={() => { setStep(0); setSelected(new Set()); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-label font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Retake Assessment
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-label font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            Skip for now
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-on-surface-variant/50 font-body leading-relaxed max-w-md mx-auto">
          This assessment is for self-awareness purposes only and is not a clinical diagnosis.
          Results are based on behavioral pattern indicators from your self-reported responses.
          If you are in crisis, call or text 988.
        </p>
      </div>
    );
  }

  /* ── Question Screen ──────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-label text-on-surface-variant">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{selected.size} selected total</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{currentStep.icon}</span>
        </div>
        <div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">{currentStep.title}</h1>
          <p className="text-sm text-on-surface-variant font-body">{currentStep.subtitle}</p>
        </div>
      </div>

      {/* Word grid */}
      <div className="flex flex-wrap gap-2.5">
        {currentStep.words.map(word => {
          const isSelected = selected.has(word.text);
          return (
            <button
              key={word.text}
              onClick={() => toggle(word.text)}
              className={`px-4 py-2.5 rounded-xl text-sm font-label font-medium cursor-pointer transition-all duration-200 select-none active:scale-[0.96] ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20 ring-2 ring-primary'
                  : 'bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant/20 hover:ring-primary/30 hover:bg-primary/5'
              }`}
            >
              {word.text}
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      <p className="text-xs text-on-surface-variant font-label text-center">
        {selectedInStep} selected in this step
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prev}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-label font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>

        <button
          onClick={next}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          {step === STEPS.length - 1 ? 'See My Results' : 'Next'}
          <span className="material-symbols-outlined text-lg">
            {step === STEPS.length - 1 ? 'analytics' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
}
