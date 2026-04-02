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
    <div className="relative min-h-screen bg-[#0f1419] flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient blur backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px]" />

      {/* Fixed top nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#0f1419]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-lg">
            <img src="/logo.png" alt="Be Candid" className="h-10 w-auto brightness-[10]" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[13px] font-label text-stone-500 hover:text-stone-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Privacy</Link>
            <Link href="/security" className="text-[13px] font-label text-stone-500 hover:text-stone-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Security</Link>
          </div>
        </div>
      </nav>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl">
        <div
          className="rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.3)] p-10 sm:p-12 transition-all duration-200 hover:ring-white/[0.1]"
          style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
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
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                </div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
        </div>

        <p className="text-center text-sm text-stone-500 mt-8 font-label">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
