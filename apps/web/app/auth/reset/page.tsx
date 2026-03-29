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
      redirectTo: `${window.location.origin}/auth/update-password`,
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-xl font-headline font-semibold text-on-surface mb-2">Check your email</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-body">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              It expires in 1 hour.
            </p>
            <Link href="/auth/signin"
              className="block w-full py-3 text-sm font-headline font-bold rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold text-primary">Be Candid</h1>
          <p className="text-sm text-on-surface-variant mt-2 font-body">We&apos;ll send you a link to reset your password</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
            </div>
            <button type="submit" disabled={loading || !email.trim()}
              className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6 font-body">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
