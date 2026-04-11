'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

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
      <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
        {/* Ambient blur backgrounds */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[100px]" />

        {/* Fixed top nav */}
        <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[22px]">shield</span>
              <span className="font-headline font-bold text-on-surface text-[15px] tracking-tight">Be Candid</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[13px] font-label text-on-surface-variant hover:text-on-surface transition-colors">Privacy</Link>
              <Link href="/security" className="text-[13px] font-label text-on-surface-variant hover:text-on-surface transition-colors">Security</Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_40px_rgba(45,112,130,0.06)] ring-1 ring-outline-variant/10 transition-all duration-200 hover:shadow-md hover:shadow-on-surface/[0.04] p-10 sm:p-12 text-center">
            {/* Success icon badge */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[28px]">mark_email_read</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mb-3">
              Check your <em className="text-primary not-italic font-bold italic">email.</em>
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8 font-label max-w-sm mx-auto">
              If an account exists for <strong className="text-on-surface">{email}</strong>, we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>

            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 w-full py-5 text-sm font-headline font-bold rounded-full ring-1 ring-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient blur backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-tertiary-container/10 blur-[100px]" />

      {/* Fixed top nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-lg">
            <img src="/logo.png" alt="Be Candid" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[13px] font-label text-on-surface-variant hover:text-on-surface cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Privacy</Link>
            <Link href="/security" className="text-[13px] font-label text-on-surface-variant hover:text-on-surface cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Security</Link>
          </div>
        </div>
      </nav>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_40px_rgba(45,112,130,0.06)] ring-1 ring-outline-variant/10 transition-all duration-200 hover:shadow-md hover:shadow-on-surface/[0.04] p-10 sm:p-12">
          {/* Icon badge */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">lock_reset</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              Reset your <em className="text-primary not-italic font-bold italic">password.</em>
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 font-label">
              We&apos;ll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div id="reset-error" className="px-4 py-3 rounded-2xl bg-error/5 ring-1 ring-error/20 text-error text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
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
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-5 bg-primary hover:bg-primary-dim hover:brightness-110 text-on-primary text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-8 font-label">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-primary font-semibold hover:text-primary-dim cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
