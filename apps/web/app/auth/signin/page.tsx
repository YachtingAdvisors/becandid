'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import AuthCard from '@/components/auth/AuthCard';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();
  const reason = searchParams.get('reason');
  const callbackError = searchParams.get('error');
  const message = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // sign-in only; signup has its own page
      },
    });

    if (otpError) {
      // Supabase returns a generic error for unknown emails to prevent enumeration.
      // Show a neutral message regardless.
      setError('We couldn\'t send a code. Make sure you\'re using the email you signed up with.');
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

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email',
    });

    if (verifyError) {
      setError('Invalid or expired code. Please check the email and try again.');
      setLoading(false);
      return;
    }

    // Record login session
    fetch('/api/auth/sessions', { method: 'POST' }).catch(() => {});

    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <AuthCard>
        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-400 text-[28px]">
              {step === 'otp' ? 'mark_email_read' : 'login'}
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">
            {step === 'otp'
              ? <>Check your <em className="text-primary not-italic font-bold italic">email.</em></>
              : <>Welcome <em className="text-primary not-italic font-bold italic">back.</em></>
            }
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-label">
            {step === 'otp'
              ? `We sent a 6-digit code to ${email}`
              : 'Sign in to continue your journey'
            }
          </p>
        </div>

        {/* Contextual notices */}
        {step === 'email' && (
          <>
            {callbackError && !error && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                </div>
                {callbackError === 'auth_callback_failed'
                  ? 'The sign-in link has expired or is invalid. Please try again.'
                  : 'Authentication failed. Please try again.'}
              </div>
            )}
            {reason === 'idle' && !error && !callbackError && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-amber-900/20 ring-1 ring-amber-500/20 text-amber-400 text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                You were signed out due to inactivity.
              </div>
            )}
            {message === 'verify_email_then_accept' && !error && !callbackError && !reason && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-cyan-900/20 ring-1 ring-cyan-500/20 text-cyan-300 text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                Verify your email, then sign in with the invited address to accept the partnership.
              </div>
            )}
          </>
        )}

        {error && (
          <div id="signin-error" className="mb-5 px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">error</span>
            </div>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoFocus
                aria-invalid={!!error}
                aria-describedby={error ? 'signin-error' : undefined}
                className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
            >
              {loading ? 'Sending code…' : 'Send Code'}
              {!loading && <span className="material-symbols-outlined text-[18px]">send</span>}
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
                aria-describedby={error ? 'signin-error' : undefined}
                className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-center text-2xl tracking-[0.4em] font-body text-slate-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
            >
              {loading ? 'Verifying…' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError(''); }}
              className="w-full text-sm text-stone-400 hover:text-stone-300 font-label cursor-pointer transition-colors duration-200"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </AuthCard>

      <p className="text-center text-sm text-stone-500 mt-8 font-label">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign up</Link>
      </p>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
