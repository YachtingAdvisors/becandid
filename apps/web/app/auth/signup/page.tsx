'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import SignupConsent from '@/components/auth/SignupConsent';
import AuthCard from '@/components/auth/AuthCard';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const referralCode = searchParams.get('ref') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consented, setConsented] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setError('');

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        data: { name: name.trim() },
      },
    });

    if (otpError) {
      setError(otpError.message || 'Failed to send code. Please try again.');
      setLoading(false);
      return;
    }

    setStep('otp');
    setLoading(false);
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email',
    });

    if (verifyError || !data.user) {
      setError('Invalid or expired code. Please check the email and try again.');
      setLoading(false);
      return;
    }

    // Create the DB profile — retry once on failure since this is critical
    let profileCreated = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), referral_code: referralCode || undefined }),
        });
        if (res.ok || res.status === 200 || res.status === 201) {
          profileCreated = true;
          break;
        }
        console.error(`[signup] Profile creation attempt ${attempt + 1} returned ${res.status}`);
      } catch (err) {
        console.error(`[signup] Profile creation attempt ${attempt + 1} failed:`, err);
      }
      if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
    }

    if (!profileCreated) {
      setError('Account created but profile setup failed. Please sign out and sign back in, or contact support.');
      setLoading(false);
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <AuthCard>
      {/* Referral banner */}
      {referralCode && step === 'form' && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-400" style={{ fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
          <p className="text-sm font-body text-slate-100">
            A friend invited you! Sign up and <span className="font-bold text-teal-400">both of you get 30 days free</span>.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/[0.05]">
          <span className="material-symbols-outlined text-cyan-400 text-3xl">
            {step === 'otp' ? 'mark_email_read' : 'person_add'}
          </span>
        </div>
        {step === 'form' ? (
          <>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
              Create your <span className="text-primary italic">account.</span>
            </h1>
            <p className="font-body text-stone-400 text-lg leading-relaxed max-w-md">
              Join a community built on integrity, transparency, and growth.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-headline text-3xl font-extrabold text-slate-100 mb-4">
              Check your <span className="text-primary italic">email.</span>
            </h1>
            <p className="font-body text-stone-400 text-base leading-relaxed">
              We sent a 6-digit code to <span className="text-slate-200">{email}</span>
            </p>
          </>
        )}
      </div>

      {error && (
        <div id="signup-error" className="mb-5 px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">error</span>
          </div>
          {error}
        </div>
      )}

      {step === 'form' ? (
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="full-name" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Your name</label>
            <input id="full-name" type="text" value={name} onChange={e => setName(e.target.value)} required
              aria-invalid={!!error}
              aria-describedby={error ? 'signup-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              placeholder="e.g. Alex" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              aria-invalid={!!error}
              aria-describedby={error ? 'signup-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              placeholder="you@example.com" />
          </div>

          <SignupConsent checked={consented} onChange={setConsented} />

          <button type="submit" disabled={!consented || loading}
            className="w-full bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-on-primary font-headline font-bold py-5 px-8 rounded-full transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none">
            {loading ? 'Sending code…' : 'Create Account'}
            {!loading && <span className="material-symbols-outlined text-xl">send</span>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">6-digit code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
              aria-invalid={!!error}
              aria-describedby={error ? 'signup-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-center text-2xl tracking-[0.4em] font-body text-slate-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
          >
            {loading ? 'Verifying…' : 'Verify & Continue'}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>

          <button
            type="button"
            onClick={() => { setStep('form'); setOtp(''); setError(''); }}
            className="w-full text-sm text-stone-400 hover:text-stone-300 font-label cursor-pointer transition-colors duration-200"
          >
            ← Use a different email
          </button>
        </form>
      )}

      <p className="text-xs text-stone-500 text-center mt-6 font-body">
        Designed with board-certified neurologists and licensed mental health professionals
      </p>

      {step === 'form' && (
        <p className="text-center text-sm text-stone-400 mt-6 font-body">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign in</Link>
        </p>
      )}
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
