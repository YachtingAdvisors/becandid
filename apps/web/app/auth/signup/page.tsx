'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import SignupConsent from '@/components/auth/SignupConsent';
import AuthCard from '@/components/auth/AuthCard';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const referralCode = searchParams.get('ref') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consented, setConsented] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), referral_code: referralCode || undefined }),
      }).catch(() => {});
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <AuthCard>
      {/* Referral banner */}
      {referralCode && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-400" style={{ fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
          <p className="text-sm font-body text-slate-100">
            A friend invited you! Sign up and <span className="font-bold text-teal-400">both of you get 30 days free</span>.
          </p>
        </div>
      )}

      {/* Signup Form Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/[0.05]">
          <span className="material-symbols-outlined text-cyan-400 text-3xl">person_add</span>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
          Create your <span className="text-primary italic">account.</span>
        </h1>
        <p className="font-body text-stone-400 text-lg leading-relaxed max-w-md">
          Join a community built on integrity, transparency, and growth.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-6">
        {error && (
          <div id="signup-error" className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">error</span>
            </div>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="full-name" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Your name</label>
          <input id="full-name" type="text" value={name} onChange={e => setName(e.target.value)} required
            aria-invalid={!!error}
            aria-describedby={error ? 'signup-error' : undefined}
            className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 font-body text-slate-100 placeholder:text-stone-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            placeholder="e.g. Alex" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
            aria-invalid={!!error}
            aria-describedby={error ? 'signup-error' : undefined}
            className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 font-body text-slate-100 placeholder:text-stone-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            placeholder="you@example.com" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
            aria-invalid={!!error}
            aria-describedby={error ? 'signup-error' : undefined}
            className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 font-body text-slate-100 placeholder:text-stone-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200"
            placeholder="At least 8 characters" />
        </div>

        <SignupConsent checked={consented} onChange={setConsented} />

        <button type="submit" disabled={!consented || loading}
          className="w-full bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-on-primary font-headline font-bold py-5 px-8 rounded-full transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none">
          {loading ? 'Creating account...' : 'Create Account'}
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </form>

      <p className="text-xs text-stone-500 text-center mt-6 font-body">
        Designed with board-certified neurologists and licensed mental health professionals
      </p>

      <p className="text-center text-sm text-stone-400 mt-6 font-body">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-1 py-0.5">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
