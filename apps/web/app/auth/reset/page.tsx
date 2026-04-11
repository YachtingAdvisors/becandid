'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import AuthCard from '@/components/auth/AuthCard';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (resetError) {
      // Don't reveal whether the email exists
      // Always show success to prevent enumeration
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthCard>
        {/* Success icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-400 text-[28px]">mark_email_read</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100 mb-3">
            Check your <em className="text-primary not-italic font-bold italic">email.</em>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8 font-label max-w-sm mx-auto">
            If an account exists for <strong className="text-slate-100">{email}</strong>, we&apos;ve sent a password reset link. It expires in 1 hour.
          </p>

          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 w-full py-5 text-sm font-headline font-bold rounded-full ring-1 ring-white/10 text-stone-400 hover:bg-white/[0.03] cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <>
      <AuthCard>
        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-400 text-[28px]">lock_reset</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">
            Reset your <em className="text-primary not-italic font-bold italic">password.</em>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-label">
            We&apos;ll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div id="reset-error" className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'reset-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-stone-500 mt-8 font-label">
        Remember your password?{' '}
        <Link href="/auth/signin" className="text-cyan-400 font-semibold hover:text-cyan-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign in</Link>
      </p>
    </>
  );
}
