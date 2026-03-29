'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import AgeGate from '@/components/auth/AgeGate';
import SignupConsent from '@/components/auth/SignupConsent';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
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
        body: JSON.stringify({ name: name.trim() }),
      }).catch(() => {});
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <main className="min-h-screen pt-16 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Ambient Background Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tertiary-container/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">shield</span>
          <span className="font-headline font-bold tracking-tight text-primary text-xl">Be Candid</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/legal/privacy" className="font-label text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="font-label text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-colors">Security</Link>
        </div>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-[0_4px_40px_rgba(45,112,130,0.06)] relative z-10 border border-outline-variant/15">
        {!ageVerified ? (
          <AgeGate onVerified={() => setAgeVerified(true)} />
        ) : (
          <>
            {/* Signup Form Header */}
            <div className="mb-10 text-center md:text-left">
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-surface-container-low">
                <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
                Create your <span className="text-primary italic">account.</span>
              </h1>
              <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-md">
                Join a community built on integrity, transparency, and growth.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body">{error}</div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Your name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. Alex" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="At least 8 characters" />
              </div>

              <SignupConsent checked={consented} onChange={setConsented} />

              <button type="submit" disabled={!consented || loading}
                className="w-full bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-5 px-8 rounded-full transition-all duration-300 shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <p className="text-xs text-on-surface-variant text-center mt-6 font-body">
              Designed with board-certified neurologists and licensed mental health professionals
            </p>

            <p className="text-center text-sm text-on-surface-variant mt-6 font-body">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>

    </main>
  );
}
