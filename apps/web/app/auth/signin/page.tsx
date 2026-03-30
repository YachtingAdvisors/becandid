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

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_40px_rgba(45,112,130,0.06)] border border-outline-variant/15 p-10 sm:p-12">
          {/* Icon badge */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">login</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              Welcome <em className="text-primary not-italic font-bold italic">back.</em>
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 font-label">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/auth/reset" className="text-xs text-primary hover:text-primary-dim font-label font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary hover:bg-primary-dim text-on-primary text-sm font-headline font-bold rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-8 font-label">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-semibold hover:text-primary-dim transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
