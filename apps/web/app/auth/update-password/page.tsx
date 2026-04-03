'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    let resolved = false;
    const supabase = createClient();

    const markReady = () => {
      if (!resolved) {
        resolved = true;
        setReady(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY fires on implicit (hash) flow token exchange
      // SIGNED_IN fires on fresh sign-in
      // INITIAL_SESSION fires when the client loads with an existing cookie session
      //   (this is the normal path after PKCE code exchange in the callback route)
      //   — but it also fires with session=null if there's no session, so check both.
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        markReady();
      } else if (event === 'INITIAL_SESSION' && session) {
        markReady();
      }
    });

    // Also check if there's already a session (e.g. token was auto-exchanged
    // server-side via the /auth/callback route in the PKCE flow)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    // Give Supabase enough time to exchange the token from the URL hash.
    // The token exchange can take several seconds on slow connections.
    const timeout = setTimeout(() => {
      if (!resolved) {
        setError('This reset link has expired or is invalid. Please request a new one.');
      }
    }, 15000);

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
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mb-3">
              Password <em className="text-primary not-italic font-bold italic">updated.</em>
            </h1>
            <p className="text-sm text-on-surface-variant font-label">Redirecting to your dashboard...</p>
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
              <span className="material-symbols-outlined text-primary text-[28px]">key</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              Choose a new <em className="text-primary not-italic font-bold italic">password.</em>
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 font-label">
              Choose a strong password you haven&apos;t used before
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-error/5 ring-1 ring-error/20 text-error text-sm font-body flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                </div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoFocus
                disabled={!ready}
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                required
                disabled={!ready}
                className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !ready || !password || !confirm}
              className="w-full py-5 bg-primary hover:bg-primary-dim hover:brightness-110 text-on-primary text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
            >
              {loading ? 'Updating...' : 'Update Password'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        {!ready && !error && (
          <div className="flex justify-center mt-8">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
