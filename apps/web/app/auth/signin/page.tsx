'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Record login session
    fetch('/api/auth/sessions', { method: 'POST' }).catch(() => {});

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Be Candid" className="h-8 w-auto mx-auto" />
          <p className="text-sm text-on-surface-variant mt-2 font-body">Sign in to your account</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="you@example.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-on-surface font-label">Password</label>
                <Link href="/auth/reset" className="text-xs text-primary hover:underline font-label">Forgot password?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-on-primary text-sm font-headline font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6 font-body">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
