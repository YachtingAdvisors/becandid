// ============================================================
// app/onboarding/page.tsx — COMPLETE REWRITE
//
// Five-step onboarding:
//   1. Goals (rival categories)
//   2. Stringer philosophy introduction
//   3. Partner preview (what they see / don't see)
//   4. Partner invite OR solo mode
//   5. Done — next steps
// ============================================================

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GoalSelector from '@/components/onboarding/GoalSelector';
import PartnerPreview from '@/components/onboarding/PartnerPreview';
import type { GoalCategory, TrackedSubstance } from '@be-candid/shared';
import {
  MOTIVATOR_LABELS, MOTIVATOR_DESCRIPTIONS,
  GOAL_LABELS,
  type FoundationalMotivator,
} from '@be-candid/shared';
import { GOAL_TIPS } from '@/lib/goalTips';
import { getDefaultWidgets } from '@/lib/widgets/registry';
import MaterialIcon from '@/components/ui/MaterialIcon';

type Step = 'goals' | 'goal-tips' | 'stringer' | 'motivator' | 'preview' | 'partner' | 'rival-assessment' | 'done' | 'first-journal';

const STEP_BACKGROUNDS: Record<Step, string> = {
  goals: '#0f1218',
  'goal-tips': '#111419',
  stringer: '#1a1520',
  motivator: '#2d1f2e',
  preview: '#5c3a2e',
  partner: '#c47a4a',
  'rival-assessment': '#e0c8a8',
  done: '#fbf9f8',
  'first-journal': '#fbf9f8',
};

// Progressive lightening through the Stringer pillars (alignment → truth → journey)
const STRINGER_SUB_BACKGROUNDS = ['#12101a', '#1a1422', '#22182a'];

const FULL_PHRASE_LINES = ['Come out', 'of darkness', 'and into', 'the light'];

// Rising sun: maps each step to translateY offset, opacity, and color
const SUN_STATES: Record<Step, { y: number; opacity: number; color: string; glow: string }> = {
  goals:            { y: 38,  opacity: 1, color: '#6b3020', glow: 'none' },
  'goal-tips':      { y: 34,  opacity: 1, color: '#7b3820', glow: '0 0 6px rgba(123,56,32,0.15)' },
  stringer:         { y: 28,  opacity: 1, color: '#8b4020', glow: '0 0 10px rgba(139,64,32,0.2)' },
  motivator:        { y: 18,  opacity: 1, color: '#a04820', glow: '0 0 15px rgba(160,72,32,0.25)' },
  preview:          { y: 8,   opacity: 1, color: '#d4803a', glow: '0 0 20px rgba(212,128,58,0.3)' },
  partner:          { y: 0,   opacity: 1, color: '#e8a84c', glow: '0 0 30px rgba(232,168,76,0.4)' },
  'rival-assessment': { y: -4, opacity: 1, color: '#ecc454', glow: '0 0 35px rgba(236,196,84,0.45)' },
  done:             { y: -8,  opacity: 1, color: '#f0c060', glow: '0 0 40px rgba(240,192,96,0.5)' },
  'first-journal':  { y: -8,  opacity: 1, color: '#f0c060', glow: '0 0 40px rgba(240,192,96,0.5)' },
};

const STRINGER_PILLARS = [
  { icon: 'water_drop', heading: 'alignment', title: 'Trace the Tributaries', body: "Your patterns are never random. There's always a stream you can trace back — stress, loneliness, conflict, exhaustion, feeling unseen. Understanding yourself is the first step to alignment.", image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop' },
  { icon: 'favorite', heading: 'truth', title: 'Name the Longing', body: "Beneath every pattern is something legitimate you need — belonging, rest, tenderness, significance. Naming it honestly is how you build congruence between who you are and who you want to be.", image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop' },
  { icon: 'explore', heading: 'the journey', title: 'Follow the Roadmap', body: "Your patterns are a sign pointing to where your story needs attention. Instead of asking 'How do I stop?' — ask 'What is this revealing about the person I want to become?'", image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop' },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get('step');
  const [step, setStepRaw] = useState<Step>(
    initialStep === 'partner' ? 'partner'
    : initialStep === 'done' ? 'done'
    : 'goals'
  );
  const [showFullPhrase, setShowFullPhrase] = useState(false);
  const setStep = (s: Step) => {
    // When transitioning to 'done', show the full phrase animation first
    if (s === 'done') {
      // Fire-and-forget: save default dashboard widgets based on goals + motivator
      fetch('/api/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: getDefaultWidgets(goals, motivators.join(',')) }),
      }).catch(() => {});

      setShowFullPhrase(true);
      setTimeout(() => {
        setShowFullPhrase(false);
        setStepRaw(s);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 4000);
      return;
    }
    setStepRaw(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [trackedSubstances, setTrackedSubstances] = useState<TrackedSubstance[]>([]);
  const [stringerStep, setStringerStep] = useState(0);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [relationships, setRelationships] = useState<string[]>(['friend']);
  const [customRelationship, setCustomRelationship] = useState('');
  const relationship = relationships.join(', ');
  const [invitedPartners, setInvitedPartners] = useState<Array<{ name: string; email: string }>>([]);

  // Format phone as +1 (XXX) XXX-XXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    // Assume US if no country code and starts with area code
    const d = digits.startsWith('1') ? digits : '1' + digits;
    if (d.length <= 1) return '+1';
    if (d.length <= 4) return `+1 (${d.slice(1)}`;
    if (d.length <= 7) return `+1 (${d.slice(1, 4)}) ${d.slice(4)}`;
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '+') { setPartnerPhone(''); return; }
    setPartnerPhone(formatPhone(raw));
  };
  const [motivators, setMotivators] = useState<FoundationalMotivator[]>([]);
  const [checkedTips, setCheckedTips] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Save goals ────────────────────────────────────────
  const saveGoals = async () => {
    // Allow proceeding with no goals — awareness will show as inactive
    setLoading(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals, tracked_substances: trackedSubstances }),
      });
      setStep(goals.length > 0 ? 'goal-tips' : 'stringer');
    } catch (e) { setError('Failed to save goals'); }
    setLoading(false);
  };

  // ── Enable solo mode ──────────────────────────────────
  const enableSolo = async () => {
    setLoading(true);
    try {
      await fetch('/api/solo-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solo_mode: true }),
      });
      setStep('rival-assessment');
    } catch (e) { setError('Failed to enable solo mode'); }
    setLoading(false);
  };

  // ── Send partner invite ───────────────────────────────
  const sendInvite = async () => {
    setError('');
    if (!partnerName.trim()) { setError('Please enter your partner\'s name.'); return; }
    if (!partnerEmail.trim()) { setError('Please enter your partner\'s email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail.trim())) { setError('Please enter a valid email address.'); return; }
    if (partnerPhone.trim() && partnerPhone.trim().length < 7) { setError('Please enter a valid phone number (at least 7 digits).'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: partnerName.trim(),
          partner_email: partnerEmail.trim().toLowerCase(),
          partner_phone: partnerPhone.trim() || undefined,
          relationship_type: relationships.includes('other') && customRelationship.trim()
            ? [...relationships.filter(r => r !== 'other'), customRelationship.trim()].join(', ')
            : relationships.join(', '),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        // Extract specific field errors from Zod validation
        if (data.details?.fieldErrors) {
          const fields = data.details.fieldErrors;
          const messages = [];
          if (fields.partner_name) messages.push(`Name: ${fields.partner_name[0]}`);
          if (fields.partner_email) messages.push(`Email: ${fields.partner_email[0]}`);
          if (fields.partner_phone) messages.push(`Phone: ${fields.partner_phone[0]}`);
          if (fields.relationship_type) messages.push(`Relationship: ${fields.relationship_type[0]}`);
          setError(messages.length > 0 ? messages.join('. ') : (data.error || 'Failed to send invite'));
        } else {
          setError(data.error || 'Failed to send invite');
        }
      } else {
        // Track invited partner and reset form for another
        setInvitedPartners(prev => [...prev, { name: partnerName.trim(), email: partnerEmail.trim() }]);
        setPartnerName('');
        setPartnerEmail('');
        setPartnerPhone('');
        setRelationships(['friend']);
        setCustomRelationship('');
      }
    } catch (e: any) { setError(e?.message || 'Network error — please try again.'); }
    setLoading(false);
  };

  // ── Save motivator ──────────────────────────────────────
  const saveMotivator = async () => {
    if (motivators.length === 0) return;
    setLoading(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundational_motivator: motivators.join(',') }),
      });
      setStep('preview');
    } catch (e) { setError('Failed to save motivator'); }
    setLoading(false);
  };

  // ── Toggle motivator selection ────────────────────────────
  const toggleMotivator = (key: FoundationalMotivator) => {
    setMotivators((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  // ── First journal prompt state ────────────────────────
  const [journalBecause, setJournalBecause] = useState('');
  const [journalHardest, setJournalHardest] = useState('');
  const [journalHope, setJournalHope] = useState('');
  const [journalSubmitting, setJournalSubmitting] = useState(false);

  const submitFirstJournal = async () => {
    setJournalSubmitting(true);
    try {
      const rivalNames = goals.map((g) => g).join(', ') || 'my rivals';
      const text = [
        `Today I'm starting because ${journalBecause.trim() || '___'}.`,
        `The hardest part about ${rivalNames} is ${journalHardest.trim() || '___'}.`,
        `One thing I hope to gain from this journey: ${journalHope.trim() || '___'}.`,
      ].join('\n\n');
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freewrite: text,
          trigger_type: 'onboarding',
          tags: ['first-entry', 'onboarding'],
        }),
      });
      router.push('/dashboard?first=true');
    } catch {
      router.push('/dashboard?first=true');
    }
    setJournalSubmitting(false);
  };

  // ── Progress bar ──────────────────────────────────────
  const STEPS: Step[] = ['goals', 'goal-tips', 'stringer', 'motivator', 'preview', 'partner', 'rival-assessment', 'done', 'first-journal'];
  const progress = STEPS.indexOf(step) / (STEPS.length - 1);

  const isDoneStep = step === 'rival-assessment' || step === 'done' || step === 'first-journal';

  // Compute background — within the stringer step, progressively lighten
  const currentBg = step === 'stringer'
    ? STRINGER_SUB_BACKGROUNDS[stringerStep] ?? STEP_BACKGROUNDS.stringer
    : STEP_BACKGROUNDS[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-12 overflow-x-hidden w-full max-w-full transition-colors duration-1000"
      style={{ backgroundColor: currentBg }}
    >
      {/* Full phrase reveal — "Come out of darkness and into the light" */}
      {showFullPhrase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #0f1218, #2d1f2e, #c47a4a, #fbf9f8)' }}>
          <div className="text-center space-y-2">
            {FULL_PHRASE_LINES.map((line, i) => (
              <h1
                key={i}
                className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight"
                style={{
                  animation: `phraseReveal 0.6s ease both`,
                  animationDelay: `${i * 0.6}s`,
                  color: i < 2 ? 'white' : i === 2 ? '#e8a84c' : '#f0c060',
                }}
              >
                {line}
              </h1>
            ))}
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="mb-6">
        <img src="/logo.png" alt="Be Candid" className={`h-10 w-auto mx-auto ${isDoneStep ? '' : 'brightness-[10]'}`} style={isDoneStep ? undefined : { filter: 'brightness(10)' }} />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className={`h-1.5 rounded-full overflow-hidden ${isDoneStep ? 'bg-surface-container' : 'bg-white/10'}`}>
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Rising sun */}
      <div className="relative w-full max-w-md mb-4 flex justify-center overflow-hidden" style={{ height: '48px' }}>
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            transform: `translateY(${SUN_STATES[step].y}px)`,
            opacity: SUN_STATES[step].opacity,
            filter: SUN_STATES[step].glow !== 'none' ? `drop-shadow(${SUN_STATES[step].glow})` : 'none',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            {/* Rays */}
            <line x1="20" y1="2" x2="20" y2="7" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="20" y1="33" x2="20" y2="38" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="7" y1="20" x2="2" y2="20" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="33" y1="20" x2="38" y2="20" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="9.4" y1="9.4" x2="5.9" y2="5.9" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="30.6" y1="30.6" x2="34.1" y2="34.1" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="9.4" y1="30.6" x2="5.9" y2="34.1" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            <line x1="30.6" y1="9.4" x2="34.1" y2="5.9" stroke={SUN_STATES[step].color} strokeWidth="2" strokeLinecap="round" className="transition-colors duration-1000" />
            {/* Sun circle */}
            <circle cx="20" cy="20" r="8" fill={SUN_STATES[step].color} className="transition-colors duration-1000" />
          </svg>
        </div>
      </div>

      {/* ═══════ STEP 1: Goals ═══════ */}
      {step === 'goals' && (
        <div className="max-w-4xl w-full animate-fade-slide pb-24">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold">Step 1 of 4</span>
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
                  Choose your rivals
                </h1>
              </div>
              <p className="max-w-xs text-slate-400 text-lg leading-relaxed md:text-right font-body">
                Identify the habits or behaviors you want to master. We&apos;ll help you build the resilience to face them.
              </p>
            </div>
          </div>

          {/* Rivals philosophy */}
          <div className="mb-8 px-5 py-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 ring-1 ring-primary/10">
            <p className="text-sm text-slate-300 leading-relaxed font-body mb-3">
              <strong className="text-cyan-400">Why &ldquo;Rivals&rdquo;?</strong> &mdash; A rival isn&rsquo;t a verdict on your character. It&rsquo;s a worthy opponent &mdash; something that pushes back, and in doing so, reveals where you&rsquo;re growing.
              Every encounter you face honestly makes you sharper. Name the ones that challenge you most. That honesty is the first act of strength.
            </p>
            <p className="text-xs text-cyan-400/80 font-label italic">
              Shine a light on the things that far too often stay in the dark.
            </p>
          </div>

          <GoalSelector selected={goals} onChange={setGoals} trackedSubstances={trackedSubstances} onSubstancesChange={setTrackedSubstances} />
          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          {/* Fixed Footer CTA */}
          <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl px-6 py-6 border-t border-white/5 z-40" style={{ backgroundColor: 'rgba(20, 26, 31, 0.7)' }}>
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-slate-400 text-sm font-label font-bold uppercase tracking-widest">Selection Active</p>
                <p className={`font-headline font-bold ${goals.length === 0 ? 'text-slate-400' : 'text-primary'}`}>
                  {goals.length === 0 ? 'No rivals selected' : `${goals.length} Rival${goals.length !== 1 ? 's' : ''} Identified`}
                </p>
              </div>
              <button onClick={saveGoals} disabled={loading}
                className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                {loading ? 'Saving...' : `Continue with ${goals.length} rival${goals.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 1b: Goal-Specific Tips ═══════ */}
      {step === 'goal-tips' && (
        <div className="max-w-lg w-full my-auto animate-fade-slide">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MaterialIcon name="lightbulb" filled className="text-primary text-xl" />
            </div>
            <h1 className="text-2xl font-headline font-semibold text-slate-100 mb-2">Tips for your journey</h1>
            <p className="text-sm text-slate-400 font-body leading-relaxed">
              Tap each tip to mark it as noted. Quick wins to set yourself up for success.
            </p>
          </div>

          <div className="space-y-5">
            {goals.slice(0, 3).map((category, cardIdx) => {
              const tips = GOAL_TIPS[category];
              if (!tips || tips.length === 0) return null;
              return (
                <div
                  key={category}
                  className="rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/5 ring-1 ring-primary/10"
                  style={{ animation: `fadeSlideUp 0.5s ease-out ${cardIdx * 0.15}s both` }}
                >
                  <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                    <MaterialIcon name={tips[0].icon} filled className="text-primary text-lg" />
                    <span className="text-sm font-label font-bold text-slate-100">
                      {GOAL_LABELS[category]}
                    </span>
                  </div>
                  <ul className="px-5 py-3 space-y-1">
                    {tips.map((t, i) => {
                      const tipKey = `${category}-${i}`;
                      const checked = checkedTips.has(tipKey);
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => setCheckedTips(prev => {
                              const next = new Set(prev);
                              if (next.has(tipKey)) next.delete(tipKey); else next.add(tipKey);
                              return next;
                            })}
                            className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 ${
                              checked
                                ? 'bg-primary/[0.06]'
                                : 'hover:bg-white/[0.04]'
                            }`}
                            style={{ animation: `fadeSlideUp 0.4s ease-out ${cardIdx * 0.15 + (i + 1) * 0.08}s both` }}
                          >
                            <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
                              checked
                                ? 'bg-primary border-primary text-on-primary'
                                : 'border-white/20 text-transparent'
                            }`}>
                              {checked && (
                                <MaterialIcon name="check" className="text-sm" />
                              )}
                            </span>
                            <span className={`text-sm font-body leading-relaxed transition-all duration-300 ${
                              checked ? 'text-slate-400' : 'text-slate-300'
                            }`}>
                              {t.tip}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {goals.length > 3 && (
            <p className="text-xs text-slate-500 text-center mt-3 font-body">
              +{goals.length - 3} more — you can review all tips in Settings later.
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setStep('goals')}
              className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-white/10 text-slate-400 hover:bg-white/5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep('stringer')}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Got it &mdash; continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: Philosophy Intro (editorial layout) ═══════ */}
      {step === 'stringer' && (
        <div className="max-w-5xl w-full animate-fade-slide">
          {/* Progress dots */}
          <nav className="flex gap-2 mb-12">
            {STRINGER_PILLARS.map((_, i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-300 ${i === stringerStep ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
            <div className="h-1.5 w-12 rounded-full bg-white/10" />
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-5xl overflow-hidden">
            {/* Illustration side */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="aspect-[2/1] w-full bg-surface-container-low rounded-2xl overflow-hidden relative shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={STRINGER_PILLARS[stringerStep].image}
                  alt={STRINGER_PILLARS[stringerStep].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              </div>
              {/* Floating icon */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 lg:w-20 lg:h-20 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]">
                <MaterialIcon name={STRINGER_PILLARS[stringerStep].icon} filled className="text-on-secondary-container text-2xl lg:text-3xl" />
              </div>
            </div>

            {/* Content side */}
            <div className="lg:col-span-7 flex flex-col space-y-8 order-1 lg:order-2">
              <div>
                <span className="font-label text-xs uppercase tracking-[0.2em] text-slate-400 mb-4 block">Transformation Phase</span>
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
                  This is about <br />
                  <span className="text-primary italic">{STRINGER_PILLARS[stringerStep].heading}</span>
                </h1>
              </div>

              <div className="space-y-6" key={stringerStep} style={{ animation: 'fadeUp 0.4s ease' }}>
                <h3 className="font-headline text-xl font-bold text-primary">{STRINGER_PILLARS[stringerStep].title}</h3>
                <div className="relative pl-8 border-l-2 border-primary/30">
                  <p className="text-xl md:text-2xl font-medium text-slate-100 leading-snug">
                    &ldquo;{STRINGER_PILLARS[stringerStep].body}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <button
                  onClick={() => {
                    if (stringerStep < STRINGER_PILLARS.length - 1) setStringerStep(stringerStep + 1);
                    else setStep('motivator');
                  }}
                  className="bg-primary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {stringerStep === STRINGER_PILLARS.length - 1 ? 'Got it \u2014 continue' : 'Next'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (stringerStep > 0) setStringerStep(stringerStep - 1);
                    else setStep(goals.length > 0 ? 'goal-tips' : 'goals');
                  }}
                  className="text-slate-400 font-label font-bold text-sm uppercase tracking-widest hover:text-primary transition-all duration-200 px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full"
                >
                  Back
                </button>
                {stringerStep === 0 && (
                  <button
                    type="button"
                    onClick={() => setStep('motivator')}
                    className="text-slate-400 font-label font-bold text-sm uppercase tracking-widest hover:text-primary transition-all duration-200 px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full"
                  >
                    Skip introduction
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quote footer */}
          {stringerStep === STRINGER_PILLARS.length - 1 && (
            <div className="mt-24 w-full max-w-2xl self-end ml-auto">
              <div className="p-8 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-primary/30" />
                <p className="font-body text-lg italic text-slate-300 leading-relaxed mb-4">
                  &ldquo;Freedom is found through kindness and curiosity.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-white/10" />
                  <span className="font-label text-xs uppercase tracking-widest text-slate-400">Be Candid</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ STEP 3: Foundational Motivator ═══════ */}
      {step === 'motivator' && (
        <div className="max-w-md w-full animate-fade-slide">
          <div className="text-center mb-6">
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Step 2b of 4</p>
            <h1 className="text-2xl font-headline font-semibold text-slate-100 mb-2">What grounds you?</h1>
            <p className="text-sm text-slate-400 font-body leading-relaxed">
              Pick as many as you like — we&apos;ll blend quotes and reflections to match your selection.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-primary/10 text-primary text-xs font-label font-semibold">
              <span className="material-symbols-outlined text-sm">checklist</span>
              Select multiple
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {(Object.keys(MOTIVATOR_LABELS) as FoundationalMotivator[]).map((key) => {
              const isSelected = motivators.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleMotivator(key)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-white/10 bg-white/[0.03] hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-label font-semibold text-slate-100">{MOTIVATOR_LABELS[key]}</span>
                    {isSelected && (
                      <MaterialIcon name="check_circle" filled className="text-primary text-lg" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-body mt-1 leading-relaxed">{MOTIVATOR_DESCRIPTIONS[key]}</p>
                </button>
              );
            })}
          </div>

          <p className={`text-xs font-label text-center mb-1 transition-colors duration-200 ${motivators.length > 0 ? 'text-primary font-semibold' : 'text-slate-400'}`}>
            {motivators.length} of {Object.keys(MOTIVATOR_LABELS).length} selected
          </p>

          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('stringer')} className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-white/10 text-slate-400 hover:bg-white/5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">&larr; Back</button>
            <button onClick={saveMotivator} disabled={motivators.length === 0 || loading}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              {loading ? 'Saving...' : 'Continue \u2192'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 4: Partner Preview ═══════ */}
      {step === 'preview' && (
        <div className="animate-fade-in">
          <PartnerPreview
            onContinue={() => setStep('partner')}
            onSolo={enableSolo}
            onBack={() => setStep('motivator')}
          />
        </div>
      )}

      {/* ═══════ STEP 4: Partner Invite ═══════ */}
      {step === 'partner' && (
        <div className="max-w-md w-full animate-fade-slide overflow-hidden">
          <div className="text-center mb-6">
            <p className="text-xs text-cyan-400 font-label font-medium uppercase tracking-widest mb-2">Step 4 of 4</p>
            <h1 className="text-2xl font-headline font-semibold text-slate-100 mb-2">Invite your partners</h1>
            <p className="text-sm text-slate-400 font-body">A friend, spouse, mentor, or coach who&apos;ll walk with you.</p>
            <div className="relative mt-5 mb-2 px-5 py-5 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(34,103,121,0.3) 100%)' }}>
              {/* Background painting */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Simeon_Solomon_-_King_Solomon_and_his_mother_%28Bathsheba%29.jpg/400px-Simeon_Solomon_-_King_Solomon_and_his_mother_%28Bathsheba%29.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="relative z-10 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Simeon_Solomon_-_King_Solomon_and_his_mother_%28Bathsheba%29.jpg/200px-Simeon_Solomon_-_King_Solomon_and_his_mother_%28Bathsheba%29.jpg"
                  alt="King Solomon"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg shrink-0"
                />
                <div className="text-left">
                  <p className="text-sm text-white font-body italic leading-relaxed">
                    &ldquo;A cord of three strands is not easily broken.&rdquo;
                  </p>
                  <p className="text-xs font-label font-bold text-cyan-300 mt-1">&mdash; King Solomon, Ecclesiastes 4:12</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-cyan-400 font-label font-medium mt-2">Add 1 partner free. Upgrade to Pro for up to 5.</p>
          </div>

          {/* Invited partners list */}
          {invitedPartners.length > 0 && (
            <div className="space-y-2 mb-4">
              {invitedPartners.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 rounded-2xl ring-1 ring-emerald-500/20">
                  <MaterialIcon name="check_circle" filled className="text-emerald-400 text-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-label font-bold text-slate-100 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.email}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-label font-bold">Invited</span>
                </div>
              ))}
            </div>
          )}

          {/* Form - greyed out after 2 invites on free plan */}
          {invitedPartners.length >= 2 ? (
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl p-6 opacity-50 pointer-events-none">
              <div className="text-center space-y-3">
                <span className="material-symbols-outlined text-3xl text-slate-500">lock</span>
                <p className="text-sm font-headline font-bold text-slate-100">Free plan limit reached</p>
                <p className="text-xs text-slate-400 font-body">Upgrade to Pro to add up to 5 accountability partners.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-4">
              {invitedPartners.length > 0 && (
                <p className="text-xs text-primary font-label font-bold text-center">Add another partner ({2 - invitedPartners.length} remaining on free plan)</p>
              )}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5 font-label">Their name</label>
              <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                placeholder="First name" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400 text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5 font-label">Their email</label>
              <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@email.com" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400 text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5 font-label">Their phone <span className="text-slate-400 font-normal">(optional — for SMS alerts)</span></label>
              <input type="tel" value={partnerPhone} onChange={handlePhoneChange}
                placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400 text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5 font-label">Relationship <span className="text-slate-400 font-normal">(select all that apply)</span></label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'friend', label: 'Friend' },
                  { key: 'spouse', label: 'Spouse' },
                  { key: 'mentor', label: 'Mentor' },
                  { key: 'family', label: 'Family' },
                  { key: 'coach', label: 'Coach' },
                  { key: 'therapist', label: 'Therapist' },
                  { key: 'spiritual_leader', label: 'Spiritual Leader' },
                  { key: 'other', label: 'Other' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => {
                    setRelationships(prev =>
                      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
                    );
                  }}
                    className={`px-4 py-2 rounded-full text-sm font-label font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      relationships.includes(key) ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-slate-400 hover:border-primary/30'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {relationships.includes('other') && (
                <input
                  type="text"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  placeholder="Describe your relationship"
                  maxLength={50}
                  className="mt-2 w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400 text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
                />
              )}
            </div>
          </div>
          )}

          {error && <p className="text-sm text-error mt-3 font-body">{error}</p>}

          <div className="flex gap-3 mt-6">
            {invitedPartners.length > 0 ? (
              <button onClick={() => setStep('rival-assessment')} className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-white/10 text-slate-400 hover:bg-white/5 transition-all duration-200 cursor-pointer">
                Continue \u2192
              </button>
            ) : (
              <button onClick={() => initialStep === 'partner' ? router.push('/dashboard') : setStep('preview')} className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-white/10 text-slate-400 hover:bg-white/5 transition-all duration-200 cursor-pointer">
                {initialStep === 'partner' ? '\u2190 Dashboard' : '\u2190 Back'}
              </button>
            )}
            {invitedPartners.length < 2 && (
              <button onClick={sendInvite} disabled={!partnerName.trim() || !partnerEmail.trim() || loading}
                className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer">
                {loading ? 'Sending invite...' : invitedPartners.length > 0 ? 'Send another invite →' : 'Send invite →'}
              </button>
            )}
            {invitedPartners.length >= 2 && (
              <button onClick={() => setStep('rival-assessment')}
                className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer">
                Continue →
              </button>
            )}
          </div>

          <button onClick={enableSolo} className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-slate-200 text-center font-body cursor-pointer transition-colors duration-200">
            I&apos;ll start in solo mode instead
          </button>

          <div className="mt-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 ring-1 ring-primary/10">
            <p className="text-xs text-slate-300 font-body leading-relaxed">
              <span className="font-bold text-cyan-400">Why invite a partner?</span> Users with a confirmed partner get <span className="font-bold text-slate-100">30 free days</span>, the ability to <span className="font-bold text-slate-100">challenge false flags</span> to protect their streaks, and eligibility for <span className="font-bold text-slate-100">physical and digital awards</span> tied to streak milestones.
            </p>
          </div>
        </div>
      )}

      {/* ═══════ STEP 5: Rival Assessment (Optional) ═══════ */}
      {step === 'rival-assessment' && (
        <div className="max-w-md w-full animate-fade-slide">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon name="psychology_alt" filled className="text-primary text-3xl" />
            </div>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">Discover Your Rivals</h1>
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-4">Optional</p>
            <p className="text-sm text-on-surface-variant leading-relaxed font-body max-w-sm mx-auto">
              Not sure which rivals to focus on? Our Rival Assessment walks you through a series of reflective prompts to uncover the behavioral patterns that challenge you most — ranked by match strength.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6 space-y-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MaterialIcon name="checklist" filled className="text-primary text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-label font-bold text-on-surface mb-1">4 reflective categories</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">Emotions, behaviors, triggers, and inner dialogue — select the words that resonate.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MaterialIcon name="analytics" filled className="text-primary text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-label font-bold text-on-surface mb-1">Personalized rival profile</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">See which rivals are most likely to challenge you, ranked by how closely they match your responses.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MaterialIcon name="timer" filled className="text-primary text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-label font-bold text-on-surface mb-1">Takes about 3 minutes</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">Quick, private, and completely optional. You can always take it later from your dashboard.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/dashboard/assessment?return_to=onboarding"
              className="block w-full py-4 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
            >
              Take Assessment
            </Link>
            <button
              onClick={() => setStep('done')}
              className="w-full py-3 text-sm text-on-surface-variant hover:text-on-surface text-center font-body cursor-pointer transition-colors duration-200"
            >
              Skip for Now
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 6: Done — transition to first journal ═══════ */}
      {step === 'done' && (
        <div className="max-w-md w-full text-center animate-fade-slide">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
            <MaterialIcon name="check_circle" filled className="text-primary text-3xl" />
          </div>
          <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">You&apos;re all set</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-body">
            {invitedPartners.length > 0
              ? `Your partner${invitedPartners.length > 1 ? 's' : ''} will receive an email inviting them to join you.`
              : "You're starting in solo mode. Your journal and self-reflection guides are ready."}
          </p>

          <button
            onClick={() => setStep('first-journal')}
            className="block w-full py-4 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 text-center">
            Write Your First Entry →
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-3 py-2 text-xs text-on-surface-variant hover:text-on-surface text-center font-body cursor-pointer transition-colors duration-200">
            Skip for now
          </button>
        </div>
      )}

      {/* ═══════ STEP 6: First Journal Prompt ═══════ */}
      {step === 'first-journal' && (
        <div className="max-w-md w-full animate-fade-slide">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-3">
              <MaterialIcon name="edit_note" filled className="text-primary text-xl" />
            </div>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">Your first journal entry</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed font-body">
              Fill in the blanks. No pressure — just honest words to mark this moment.
            </p>
          </div>

          <div className="space-y-5 bg-surface-container-lowest rounded-3xl p-6 ring-1 ring-outline-variant/10 shadow-sm">
            {/* Prompt 1 */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-2">
                Today I&apos;m starting because...
              </label>
              <input
                type="text"
                value={journalBecause}
                onChange={(e) => setJournalBecause(e.target.value)}
                placeholder="I want to be honest with myself"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
              />
            </div>

            {/* Prompt 2 */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-2">
                The hardest part about {goals.length > 0 ? 'my rivals' : 'this'} is...
              </label>
              <input
                type="text"
                value={journalHardest}
                onChange={(e) => setJournalHardest(e.target.value)}
                placeholder="feeling like I can't control it"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
              />
            </div>

            {/* Prompt 3 */}
            <div>
              <label className="block text-sm font-label font-medium text-on-surface mb-2">
                One thing I hope to gain from this journey:
              </label>
              <input
                type="text"
                value={journalHope}
                onChange={(e) => setJournalHope(e.target.value)}
                placeholder="freedom from the shame cycle"
                className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={submitFirstJournal}
              disabled={journalSubmitting || (!journalBecause.trim() && !journalHardest.trim() && !journalHope.trim())}
              className="block w-full py-4 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 text-center">
              {journalSubmitting ? 'Saving...' : 'Save & Go to Dashboard →'}
            </button>
            <button
              onClick={() => router.push('/dashboard?first=true')}
              className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface text-center font-body cursor-pointer transition-colors duration-200">
              Skip this step
            </button>
          </div>

          <p className="text-center text-[10px] text-on-surface-variant/50 mt-4 font-body">
            This becomes your first Candid Journal entry — encrypted and private.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeUp 0.4s ease; }
        @keyframes phraseReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#141a1f' }}><p className="text-slate-400">Loading...</p></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
