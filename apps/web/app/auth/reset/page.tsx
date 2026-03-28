// ============================================================
// app/auth/reset/page.tsx
//
// Password reset request page.
// User enters email → Supabase sends reset link →
// Link goes to /auth/update-password with token in URL hash.
// ============================================================

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
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-xl font-display font-semibold text-ink mb-2">Check your email</h1>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            It expires in 1 hour.
          </p>
          <Link href="/auth/signin"
            className="block w-full py-3 text-sm font-medium rounded-xl border border-surface-border text-ink-muted hover:bg-gray-50">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand mb-3">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h1 className="text-xl font-display font-semibold text-ink">Reset your password</h1>
          <p className="text-sm text-ink-muted mt-1">We'll send you a link to reset it</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
          </div>
          <button type="submit" disabled={loading || !email.trim()}
            className="w-full py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Remember your password? <Link href="/auth/signin" className="text-brand hover:text-brand-dark font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
