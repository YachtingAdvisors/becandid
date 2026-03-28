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

type Step = 'goals' | 'stringer' | 'preview' | 'partner' | 'done';

const STRINGER_PILLARS = [
  { icon: '🌊', title: 'Trace the Tributaries', body: "When something comes up, it's never random. There's always a stream you can trace back — stress, loneliness, conflict, exhaustion, feeling unseen." },
  { icon: '💛', title: 'Name the Longing', body: "Beneath every struggle is something legitimate you need — belonging, rest, tenderness, significance. The behavior is a misguided attempt to meet that need." },
  { icon: '🧭', title: 'Follow the Roadmap', body: "Your struggle is a sign pointing to where your pain is. Instead of asking 'How do I stop?' — ask 'What is this revealing about the life I want?'" },
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

  // ── Progress bar ──────────────────────────────────────
  const STEPS: Step[] = ['goals', 'stringer', 'preview', 'partner', 'done'];
  const progress = STEPS.indexOf(step) / (STEPS.length - 1);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* ═══════ STEP 1: Goals ═══════ */}
      {step === 'goals' && (
        <div className="max-w-lg w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-brand font-medium uppercase tracking-widest mb-2">Step 1 of 4</p>
            <h1 className="text-2xl font-display font-semibold text-ink mb-2">Choose your rivals</h1>
            <p className="text-sm text-ink-muted">What do you want accountability for? Select one or many.</p>
          </div>
          <GoalSelector selected={goals} onChange={setGoals} />
          {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
          <button onClick={saveGoals} disabled={goals.length === 0 || loading}
            className="w-full mt-6 py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
            {loading ? 'Saving…' : `Continue with ${goals.length} rival${goals.length !== 1 ? 's' : ''} →`}
          </button>
        </div>
      )}

      {/* ═══════ STEP 2: Stringer Intro ═══════ */}
      {step === 'stringer' && (
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs text-violet-500 font-medium uppercase tracking-widest mb-2">Our Philosophy</p>
            <h1 className="text-2xl font-display font-semibold text-ink mb-2">This isn't about shame</h1>
            {stringerStep === 0 && (
              <p className="text-sm text-ink-muted leading-relaxed">
                Be Candid is grounded in Jay Stringer's research with nearly 4,000 people.
                The core finding: unwanted behavior is never random. It's shaped by the parts of your story that remain unaddressed.
              </p>
            )}
          </div>

          {/* Pillar card */}
          <div key={stringerStep} className="bg-gradient-to-br from-violet-50 to-amber-50 rounded-2xl p-8 border border-violet-100 mb-6" style={{ animation: 'fadeUp 0.4s ease' }}>
            <div className="text-4xl mb-4 text-center">{STRINGER_PILLARS[stringerStep].icon}</div>
            <h2 className="text-lg font-display font-semibold text-ink text-center mb-3">{STRINGER_PILLARS[stringerStep].title}</h2>
            <p className="text-sm text-ink-muted leading-relaxed text-center">{STRINGER_PILLARS[stringerStep].body}</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6 justify-center">
            {STRINGER_PILLARS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= stringerStep ? 'w-8 bg-violet-500' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>

          {stringerStep === STRINGER_PILLARS.length - 1 && (
            <div className="text-center mb-4">
              <p className="text-sm text-violet-600 italic">"Freedom is found through kindness and curiosity."</p>
              <p className="text-xs text-violet-400 mt-1">— Jay Stringer</p>
            </div>
          )}

          <div className="flex gap-3">
            {stringerStep > 0 && (
              <button onClick={() => setStringerStep(stringerStep - 1)} className="flex-1 py-3 text-sm font-medium rounded-xl border border-surface-border text-ink-muted hover:bg-gray-50">Back</button>
            )}
            <button onClick={() => {
              if (stringerStep < STRINGER_PILLARS.length - 1) setStringerStep(stringerStep + 1);
              else setStep('preview');
            }} className="flex-1 py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark">
              {stringerStep === STRINGER_PILLARS.length - 1 ? 'Got it — continue' : 'Next'}
            </button>
          </div>
          {stringerStep === 0 && (
            <button onClick={() => setStep('preview')} className="w-full mt-2 py-2 text-xs text-ink-muted hover:text-ink text-center">Skip introduction</button>
          )}
        </div>
      )}

      {/* ═══════ STEP 3: Partner Preview ═══════ */}
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
            <p className="text-xs text-brand font-medium uppercase tracking-widest mb-2">Step 4 of 4</p>
            <h1 className="text-2xl font-display font-semibold text-ink mb-2">Invite your partner</h1>
            <p className="text-sm text-ink-muted">A friend, spouse, mentor, or coach who'll walk with you.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Their name</label>
              <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                placeholder="First name" className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Their email</label>
              <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@email.com" className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Their phone <span className="text-ink-muted font-normal">(optional — for SMS alerts)</span></label>
              <input type="tel" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567" className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {['friend', 'spouse', 'mentor', 'coach', 'therapist', 'pastor'].map((r) => (
                  <button key={r} onClick={() => setRelationship(r)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      relationship === r ? 'border-brand bg-brand/5 text-brand' : 'border-surface-border text-ink-muted hover:border-brand/30'
                    }`}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('preview')} className="px-6 py-3 text-sm font-medium rounded-xl border border-surface-border text-ink-muted hover:bg-gray-50">← Back</button>
            <button onClick={sendInvite} disabled={!partnerName.trim() || !partnerEmail.trim() || loading}
              className="flex-1 py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50">
              {loading ? 'Sending invite…' : 'Send invite →'}
            </button>
          </div>

          <button onClick={enableSolo} className="w-full mt-3 py-2 text-xs text-ink-muted hover:text-ink text-center">
            I'll start in solo mode instead
          </button>
        </div>
      )}

      {/* ═══════ STEP 5: Done ═══════ */}
      {step === 'done' && (
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">You're set up</h1>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            {partnerName
              ? `${partnerName} will receive an email inviting them to be your accountability partner.`
              : "You're starting in solo mode. Your journal and self-reflection guides are ready."}
          </p>

          <div className="text-left space-y-3 mb-8">
            {[
              { icon: '📱', title: 'Install the mobile app', desc: 'Android: screen monitoring. iOS: daily check-ins.' },
              { icon: '📓', title: 'Write your first journal entry', desc: 'Start tracing the tributaries — before anything happens.' },
              { icon: '💙', title: 'Check-ins start tonight', desc: "You'll receive a journal prompt at your preferred time." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-surface-border">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-ink-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/dashboard')}
            className="w-full py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark">
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
