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
import type { GoalCategory } from '@be-candid/shared';
import {
  MOTIVATOR_LABELS, MOTIVATOR_DESCRIPTIONS,
  type FoundationalMotivator,
} from '@be-candid/shared';

type Step = 'goals' | 'stringer' | 'motivator' | 'preview' | 'partner' | 'done';

const STRINGER_PILLARS = [
  { icon: 'water_drop', heading: 'alignment', title: 'Trace the Tributaries', body: "Your patterns are never random. There's always a stream you can trace back — stress, loneliness, conflict, exhaustion, feeling unseen. Understanding yourself is the first step to alignment.", image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop' },
  { icon: 'favorite', heading: 'truth', title: 'Name the Longing', body: "Beneath every pattern is something legitimate you need — belonging, rest, tenderness, significance. Naming it honestly is how you build congruence between who you are and who you want to be.", image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop' },
  { icon: 'explore', heading: 'the journey', title: 'Follow the Roadmap', body: "Your patterns are a sign pointing to where your story needs attention. Instead of asking 'How do I stop?' — ask 'What is this revealing about the person I want to become?'", image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop' },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = searchParams.get('step');
  const [step, setStep] = useState<Step>(initialStep === 'partner' ? 'partner' : 'goals');
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [stringerStep, setStringerStep] = useState(0);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [motivators, setMotivators] = useState<FoundationalMotivator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Save goals ────────────────────────────────────────
  const saveGoals = async () => {
    if (goals.length === 0) return;
    setLoading(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals }),
      });
      setStep('stringer');
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
      setStep('done');
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
          relationship_type: relationship,
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
        setStep('done');
      }
    } catch (e) { setError('Failed to send invite'); }
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

  // ── Progress bar ──────────────────────────────────────
  const STEPS: Step[] = ['goals', 'stringer', 'motivator', 'preview', 'partner', 'done'];
  const progress = STEPS.indexOf(step) / (STEPS.length - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-6">
        <img src="/logo.png" alt="Be Candid" className="h-10 w-auto mx-auto" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* ═══════ STEP 1: Goals ═══════ */}
      {step === 'goals' && (
        <div className="max-w-4xl w-full animate-fade-in pb-24">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Step 1 of 4</span>
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
                  Choose your rivals
                </h1>
              </div>
              <p className="max-w-xs text-on-surface-variant text-lg leading-relaxed md:text-right font-body">
                Identify the habits or behaviors you want to master. We&apos;ll help you build the resilience to face them.
              </p>
            </div>
          </div>

          {/* Rivals philosophy */}
          <div className="mb-8 px-5 py-4 rounded-2xl bg-gradient-to-br from-primary-container/30 to-emerald-50/50 ring-1 ring-primary-container/30">
            <p className="text-sm text-on-surface leading-relaxed font-body">
              <strong className="text-primary">Why &ldquo;Rivals&rdquo;?</strong> &mdash; A rival isn&rsquo;t a verdict on your character. It&rsquo;s a worthy opponent &mdash; something that pushes back, and in doing so, reveals where you&rsquo;re growing.
              Every encounter you face honestly makes you sharper. Name the ones that challenge you most. That honesty is the first act of strength.
            </p>
          </div>

          <GoalSelector selected={goals} onChange={setGoals} />
          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          {/* Fixed Footer CTA */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-xl px-6 py-6 border-t border-outline-variant/15 z-40">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-on-surface-variant text-sm font-label font-bold uppercase tracking-widest">Selection Active</p>
                <p className={`font-headline font-bold ${goals.length === 0 ? 'text-on-surface-variant' : 'text-primary'}`}>
                  {goals.length === 0 ? 'No rivals selected' : `${goals.length} Rival${goals.length !== 1 ? 's' : ''} Identified`}
                </p>
              </div>
              <button onClick={saveGoals} disabled={goals.length === 0 || loading}
                className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                {loading ? 'Saving...' : `Continue with ${goals.length} rival${goals.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: Philosophy Intro (editorial layout) ═══════ */}
      {step === 'stringer' && (
        <div className="max-w-5xl w-full animate-fade-in">
          {/* Progress dots */}
          <nav className="flex gap-2 mb-12">
            {STRINGER_PILLARS.map((_, i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-300 ${i === stringerStep ? 'bg-primary' : 'bg-surface-container-high'}`} />
            ))}
            <div className="h-1.5 w-12 rounded-full bg-surface-container-high" />
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-5xl overflow-hidden">
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
                <span className="material-symbols-outlined text-on-secondary-container text-2xl lg:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {STRINGER_PILLARS[stringerStep].icon}
                </span>
              </div>
            </div>

            {/* Content side */}
            <div className="lg:col-span-7 flex flex-col space-y-8 order-1 lg:order-2">
              <div>
                <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-4 block">Transformation Phase</span>
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface leading-tight">
                  This is about <br />
                  <span className="text-primary italic">{STRINGER_PILLARS[stringerStep].heading}</span>
                </h1>
              </div>

              {stringerStep === 0 && (
                <p className="text-base text-on-surface-variant leading-relaxed font-body max-w-lg">
                  Be Candid is grounded in clinical research and backed by a team of psychiatrists and mental health counselors. The core finding: your patterns are never random. They&apos;re shaped by the parts of your story that remain unaddressed. Understanding them is how you align your digital life with your real life. That alignment is the foundation of authentic communication, reduced anxiety, and a nervous system that no longer carries the weight of a double life.
                </p>
              )}

              <div className="space-y-6" key={stringerStep} style={{ animation: 'fadeUp 0.4s ease' }}>
                <h3 className="font-headline text-xl font-bold text-secondary">{STRINGER_PILLARS[stringerStep].title}</h3>
                <div className="relative pl-8 border-l-2 border-primary-container">
                  <p className="text-xl md:text-2xl font-medium text-on-surface leading-snug">
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
                {stringerStep > 0 && (
                  <button
                    onClick={() => setStringerStep(stringerStep - 1)}
                    className="text-on-surface/60 font-label font-bold text-sm uppercase tracking-widest hover:text-primary transition-all duration-200 px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full"
                  >
                    Back
                  </button>
                )}
                {stringerStep === 0 && (
                  <button
                    onClick={() => setStep('motivator')}
                    className="text-on-surface/60 font-label font-bold text-sm uppercase tracking-widest hover:text-primary transition-all duration-200 px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full"
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
              <div className="p-8 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-tertiary-container" />
                <p className="font-body text-lg italic text-on-surface-variant leading-relaxed mb-4">
                  &ldquo;Freedom is found through kindness and curiosity.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-outline-variant/30" />
                  <span className="font-label text-xs uppercase tracking-widest text-outline">Be Candid</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ STEP 3: Foundational Motivator ═══════ */}
      {step === 'motivator' && (
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Step 2b of 4</p>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">What grounds you?</h1>
            <p className="text-sm text-on-surface-variant font-body leading-relaxed">
              Pick as many as you like — we&apos;ll blend quotes and reflections to match your selection.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-primary-container/40 text-primary text-xs font-label font-semibold">
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
                      ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20'
                      : 'border-outline-variant bg-surface-container-lowest hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-label font-semibold text-on-surface">{MOTIVATOR_LABELS[key]}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-body mt-1 leading-relaxed">{MOTIVATOR_DESCRIPTIONS[key]}</p>
                </button>
              );
            })}
          </div>

          <p className={`text-xs font-label text-center mb-1 transition-colors duration-200 ${motivators.length > 0 ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
            {motivators.length} of {Object.keys(MOTIVATOR_LABELS).length} selected
          </p>

          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('stringer')} className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">&larr; Back</button>
            <button onClick={saveMotivator} disabled={motivators.length === 0 || loading}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              {loading ? 'Saving...' : 'Continue →'}
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
          />
        </div>
      )}

      {/* ═══════ STEP 4: Partner Invite ═══════ */}
      {step === 'partner' && (
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Step 4 of 4</p>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">Invite your partner</h1>
            <p className="text-sm text-on-surface-variant font-body">A friend, spouse, mentor, or coach who&apos;ll walk with you.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their name</label>
              <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                placeholder="First name" className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their email</label>
              <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@email.com" className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their phone <span className="text-on-surface-variant font-normal">(optional — for SMS alerts)</span></label>
              <input type="tel" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {['friend', 'spouse', 'mentor', 'coach', 'therapist', 'pastor'].map((r) => (
                  <button key={r} onClick={() => setRelationship(r)}
                    className={`px-4 py-2 rounded-full text-sm font-label font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      relationship === r ? 'border-primary bg-primary-container text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
                    }`}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-error mt-3 font-body">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button onClick={() => initialStep === 'partner' ? router.push('/dashboard') : setStep('preview')} className="px-6 py-3 text-sm font-headline font-bold rounded-full ring-1 ring-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">{initialStep === 'partner' ? '\u2190 Dashboard' : '\u2190 Back'}</button>
            <button onClick={sendInvite} disabled={!partnerName.trim() || !partnerEmail.trim() || loading}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              {loading ? 'Sending invite...' : 'Send invite →'}
            </button>
          </div>

          <button onClick={enableSolo} className="w-full mt-3 py-2 text-xs text-on-surface-variant hover:text-on-surface text-center font-body cursor-pointer transition-colors duration-200">
            I&apos;ll start in solo mode instead
          </button>
        </div>
      )}

      {/* ═══════ STEP 5: Done — redirect to dashboard ═══════ */}
      {step === 'done' && (
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">You&apos;re all set</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-body">
            {partnerName
              ? `${partnerName} will receive an email inviting them to be your accountability partner.`
              : "You're starting in solo mode. Your journal and self-reflection guides are ready."}
          </p>

          <button onClick={() => router.push('/dashboard')}
            className="w-full py-4 text-sm font-headline font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            Go to Dashboard →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeUp 0.4s ease; }
      `}</style>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-on-surface-variant">Loading...</p></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
