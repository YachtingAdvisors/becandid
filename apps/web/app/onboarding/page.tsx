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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoalSelector from '@/components/onboarding/GoalSelector';
import PartnerPreview from '@/components/onboarding/PartnerPreview';
import type { GoalCategory } from '@be-candid/shared';
import {
  MOTIVATOR_LABELS, MOTIVATOR_DESCRIPTIONS,
  type FoundationalMotivator,
} from '@be-candid/shared';

type Step = 'goals' | 'stringer' | 'motivator' | 'preview' | 'partner' | 'done';

const STRINGER_PILLARS = [
  { icon: '🌊', title: 'Trace the Tributaries', body: "Your patterns are never random. There's always a stream you can trace back — stress, loneliness, conflict, exhaustion, feeling unseen. Understanding yourself is the first step to alignment." },
  { icon: '💛', title: 'Name the Longing', body: "Beneath every pattern is something legitimate you need — belonging, rest, tenderness, significance. Naming it honestly is how you build congruence between who you are and who you want to be." },
  { icon: '🧭', title: 'Follow the Roadmap', body: "Your patterns are a sign pointing to where your story needs attention. Instead of asking 'How do I stop?' — ask 'What is this revealing about the person I want to become?'" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('goals');
  const [goals, setGoals] = useState<GoalCategory[]>([]);
  const [stringerStep, setStringerStep] = useState(0);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [motivator, setMotivator] = useState<FoundationalMotivator>('general');
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
    if (!partnerName.trim() || !partnerEmail.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: partnerName.trim(),
          partner_email: partnerEmail.trim().toLowerCase(),
          partner_phone: partnerPhone.trim() || undefined,
          relationship,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send invite');
      } else {
        setStep('done');
      }
    } catch (e) { setError('Failed to send invite'); }
    setLoading(false);
  };

  // ── Save motivator ──────────────────────────────────────
  const saveMotivator = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundational_motivator: motivator }),
      });
      setStep('preview');
    } catch (e) { setError('Failed to save motivator'); }
    setLoading(false);
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

          <GoalSelector selected={goals} onChange={setGoals} />
          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          {/* Fixed Footer CTA */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-xl px-6 py-6 border-t border-outline-variant/15 z-40">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-on-surface-variant text-sm font-label font-bold uppercase tracking-widest">Selection Active</p>
                <p className="text-primary font-headline font-bold">
                  {goals.length === 0 ? 'No rivals selected' : `${goals.length} Rival${goals.length !== 1 ? 's' : ''} Identified`}
                </p>
              </div>
              <button onClick={saveGoals} disabled={goals.length === 0 || loading}
                className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {loading ? 'Saving...' : `Continue with ${goals.length} rival${goals.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: Stringer Intro ═══════ */}
      {step === 'stringer' && (
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Our Philosophy</p>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">This is about alignment</h1>
            {stringerStep === 0 && (
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                Be Candid is grounded in clinical research with nearly 4,000 people.
                The core finding: your patterns are never random. They&apos;re shaped by the parts of your story that remain unaddressed. Understanding them is how you align your digital life with your real life.
              </p>
            )}
          </div>

          {/* Pillar card */}
          <div key={stringerStep} className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-[0_2px_20px_rgba(0,0,0,0.06)] mb-6" style={{ animation: 'fadeUp 0.4s ease' }}>
            <div className="text-4xl mb-4 text-center">{STRINGER_PILLARS[stringerStep].icon}</div>
            <h2 className="text-lg font-headline font-semibold text-on-surface text-center mb-3">{STRINGER_PILLARS[stringerStep].title}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed text-center font-body">{STRINGER_PILLARS[stringerStep].body}</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6 justify-center">
            {STRINGER_PILLARS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= stringerStep ? 'w-8 bg-primary' : 'w-4 bg-surface-container'}`} />
            ))}
          </div>

          {stringerStep === STRINGER_PILLARS.length - 1 && (
            <div className="text-center mb-4">
              <p className="text-sm text-primary italic font-body">&ldquo;Freedom is found through kindness and curiosity.&rdquo;</p>
            </div>
          )}

          <div className="flex gap-3">
            {stringerStep > 0 && (
              <button onClick={() => setStringerStep(stringerStep - 1)} className="flex-1 py-3 text-sm font-headline font-bold rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">Back</button>
            )}
            <button onClick={() => {
              if (stringerStep < STRINGER_PILLARS.length - 1) setStringerStep(stringerStep + 1);
              else setStep('motivator');
            }} className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
              {stringerStep === STRINGER_PILLARS.length - 1 ? 'Got it — continue' : 'Next'}
            </button>
          </div>

          {stringerStep === 0 && (
            <button onClick={() => setStep('motivator')} className="w-full mt-2 py-2 text-xs text-on-surface-variant hover:text-on-surface text-center font-body">Skip introduction</button>
          )}

          <p className="text-xs text-on-surface-variant text-center mt-6 font-body leading-relaxed">
            Our approach is grounded in clinical research and informed by a multidisciplinary team of neurologists and licensed counselors \u2014 designed to help you understand yourself, not restrict yourself.
          </p>
        </div>
      )}

      {/* ═══════ STEP 3: Foundational Motivator ═══════ */}
      {step === 'motivator' && (
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Step 2b of 4</p>
            <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">What grounds you?</h1>
            <p className="text-sm text-on-surface-variant font-body leading-relaxed">
              Choose the perspective that resonates most. We&apos;ll tailor quotes and reflections to match.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {(Object.keys(MOTIVATOR_LABELS) as FoundationalMotivator[]).map((key) => (
              <button
                key={key}
                onClick={() => setMotivator(key)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                  motivator === key
                    ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-primary/30'
                }`}
              >
                <span className="text-sm font-label font-semibold text-on-surface">{MOTIVATOR_LABELS[key]}</span>
                <p className="text-xs text-on-surface-variant font-body mt-1 leading-relaxed">{MOTIVATOR_DESCRIPTIONS[key]}</p>
              </button>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant text-center font-body mb-4 leading-relaxed">
            Therapeutic insights are always included regardless of your choice. You can change this anytime in Settings.
          </p>

          {error && <p className="text-sm text-error mt-3 text-center font-body">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('stringer')} className="px-6 py-3 text-sm font-headline font-bold rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">&larr; Back</button>
            <button onClick={saveMotivator} disabled={loading}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity">
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
                placeholder="First name" className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their email</label>
              <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@email.com" className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their phone <span className="text-on-surface-variant font-normal">(optional — for SMS alerts)</span></label>
              <input type="tel" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {['friend', 'spouse', 'mentor', 'coach', 'therapist', 'pastor'].map((r) => (
                  <button key={r} onClick={() => setRelationship(r)}
                    className={`px-4 py-2 rounded-full text-sm font-label font-medium border transition-all ${
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
            <button onClick={() => setStep('preview')} className="px-6 py-3 text-sm font-headline font-bold rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">&larr; Back</button>
            <button onClick={sendInvite} disabled={!partnerName.trim() || !partnerEmail.trim() || loading}
              className="flex-1 py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity">
              {loading ? 'Sending invite...' : 'Send invite →'}
            </button>
          </div>

          <button onClick={enableSolo} className="w-full mt-3 py-2 text-xs text-on-surface-variant hover:text-on-surface text-center font-body">
            I&apos;ll start in solo mode instead
          </button>
        </div>
      )}

      {/* ═══════ STEP 5: Done ═══════ */}
      {step === 'done' && (
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">You&apos;re set up</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-body">
            {partnerName
              ? `${partnerName} will receive an email inviting them to be your accountability partner.`
              : "You're starting in solo mode. Your journal and self-reflection guides are ready."}
          </p>

          <div className="text-left space-y-3 mb-8">
            {[
              { icon: '📱', title: 'Install the mobile app', desc: 'Android: screen awareness. iOS: daily check-ins.' },
              { icon: '📓', title: 'Write your first journal entry', desc: 'Start tracing the tributaries — before anything happens.' },
              { icon: '💙', title: 'Check-ins start tonight', desc: "You'll receive a journal prompt at your preferred time." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-on-surface font-label">{item.title}</p>
                  <p className="text-xs text-on-surface-variant font-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/dashboard')}
            className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
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
