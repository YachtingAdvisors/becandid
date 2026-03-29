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
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container mb-4">
              <span className="text-2xl text-primary">✓</span>
            </div>
            <h1 className="text-xl font-headline font-semibold text-on-surface mb-2">Password updated</h1>
            <p className="text-sm text-on-surface-variant font-body">Redirecting to your dashboard...</p>
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
          <p className="text-sm text-on-surface-variant mt-2 font-body">Choose a strong password you haven&apos;t used before</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" required autoFocus disabled={!ready}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again" required disabled={!ready}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50" />
            </div>
            <button type="submit" disabled={loading || !ready || !password || !confirm}
              className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity">
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {!ready && !error && (
          <div className="flex justify-center mt-6">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
