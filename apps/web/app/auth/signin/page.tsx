'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import MFAChallenge from '@/components/auth/MFAChallenge';
import AuthCard from '@/components/auth/AuthCard';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const reason = searchParams.get('reason');
  const callbackError = searchParams.get('error');
  const message = searchParams.get('message');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check account lockout before attempting auth
    try {
      const lockoutRes = await fetch('/api/auth/check-lockout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const lockoutData = await lockoutRes.json();
      if (lockoutData.locked) {
        setError(
          `Account temporarily locked. Try again in ${lockoutData.minutes_remaining ?? 'a few'} minute${lockoutData.minutes_remaining === 1 ? '' : 's'}.`
        );
        setLoading(false);
        return;
      }
    } catch {
      // Fail open — don't block login if lockout check fails
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      // Record failed attempt
      fetch('/api/auth/record-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, success: false }),
      }).catch(() => {});
      setLoading(false);
      return;
    }

    // Check if MFA is required before redirecting
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors?.totp && factors.totp.some(f => f.status === 'verified')) {
      setShowMFA(true);
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
        {showMFA ? (
          <MFAChallenge
            redirectTo={redirect}
            onBack={() => {
              setShowMFA(false);
              supabase.auth.signOut();
            }}
          />
        ) : (
          <>
            {/* Icon badge */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-400 text-[28px]">login</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">
                Welcome <em className="text-primary not-italic font-bold italic">back.</em>
              </h1>
              <p className="text-sm text-slate-400 mt-2 font-label">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              {callbackError && !error && (
                <div className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                  </div>
                  {callbackError === 'auth_callback_failed'
                    ? 'The sign-in link has expired or is invalid. Please try again.'
                    : 'Authentication failed. Please try again.'}
                </div>
              )}
              {reason === 'idle' && !error && !callbackError && (
                <div className="px-4 py-3 rounded-2xl bg-amber-900/20 ring-1 ring-amber-500/20 text-amber-400 text-sm font-body flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  You were signed out due to inactivity.
                </div>
              )}
              {message === 'verify_email_then_accept' && !error && !callbackError && !reason && (
                <div className="px-4 py-3 rounded-2xl bg-cyan-900/20 ring-1 ring-cyan-500/20 text-cyan-300 text-sm font-body flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  Verify your email, then sign in with the invited address to accept the partnership.
                </div>
              )}
              {error && (
                <div id="signin-error" className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                  </div>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'signin-error' : undefined}
                  className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'signin-error' : undefined}
                  className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
                />
              </div>

              <div className="flex justify-end">
                <Link href="/auth/reset" className="text-xs text-cyan-400 hover:text-cyan-300 font-label font-medium cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </form>
          </>
        )}
      </AuthCard>

      {!showMFA && (
        <p className="text-center text-sm text-stone-500 mt-8 font-label">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign up</Link>
        </p>
      )}
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
