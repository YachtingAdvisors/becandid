'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface MFAChallengeProps {
  /** Where to redirect after successful verification */
  redirectTo?: string;
  /** Called when user wants to go back to sign-in */
  onBack?: () => void;
}

export default function MFAChallenge({ redirectTo = '/dashboard', onBack }: MFAChallengeProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState('');

  useEffect(() => {
    // Get the TOTP factor ID
    async function getFactorId() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data.totp.length) return;
      const verified = data.totp.find(f => f.status === 'verified');
      if (verified) setFactorId(verified.id);
    }
    getFactorId();
    inputRef.current?.focus();
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    if (!factorId) {
      setError('No authenticator factor found. Please contact support.');
      return;
    }

    setLoading(true);
    setError('');

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError('Invalid code. Please check your authenticator app and try again.');
      setCode('');
      setLoading(false);
      inputRef.current?.focus();
      return;
    }

    // Record login session (fire-and-forget; may 401 if cookies not yet
    // synced — the dashboard self-heals on next request).
    fetch('/api/auth/sessions', { method: 'POST' }).catch(() => {});

    // Hard navigation, not router.push — see signin/page.tsx for why.
    window.location.href = redirectTo;
  }

  return (
    <div className="w-full">
      {/* Icon badge */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
          <span className="material-symbols-outlined text-cyan-400 text-[28px]">security</span>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">
          Two-Factor <em className="text-primary not-italic font-bold italic">Verification</em>
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-label">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        {error && (
          <div id="mfa-error" className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">error</span>
            </div>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="mfa-code" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">
            Authentication Code
          </label>
          <input
            id="mfa-code"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              setCode(val);
              setError('');
            }}
            placeholder="000000"
            autoFocus
            autoComplete="one-time-code"
            aria-invalid={!!error}
            aria-describedby={error ? 'mfa-error' : undefined}
            className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
        >
          {loading ? 'Verifying...' : 'Verify'}
          {!loading && <span className="material-symbols-outlined text-[18px]">shield</span>}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 text-sm font-label font-medium text-stone-500 hover:text-stone-300 cursor-pointer transition-all duration-200 rounded-xl"
          >
            Back to sign in
          </button>
        )}
      </form>
    </div>
  );
}
