// ============================================================
// app/auth/update-password/page.tsx
//
// Landed on after clicking the password reset email link.
// Supabase puts the token in the URL hash fragment.
// The client exchanges it for a session, then lets the user
// set a new password.
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token exchange automatically
    // via onAuthStateChange when the page loads with the hash
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // Also check if already in recovery state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    // If no recovery event after 3 seconds, the token is invalid
    const timeout = setTimeout(() => {
      if (!ready) setError('This reset link has expired or is invalid. Please request a new one.');
    }, 3000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-display font-semibold text-ink mb-2">Password updated</h1>
          <p className="text-sm text-ink-muted">Redirecting to your dashboard…</p>
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
          <h1 className="text-xl font-display font-semibold text-ink">Set new password</h1>
          <p className="text-sm text-ink-muted mt-1">Choose a strong password you haven't used before</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" required autoFocus disabled={!ready}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again" required disabled={!ready}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:opacity-50" />
          </div>
          <button type="submit" disabled={loading || !ready || !password || !confirm}
            className="w-full py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        {!ready && !error && (
          <div className="flex justify-center mt-6">
            <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
