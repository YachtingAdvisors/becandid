'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AuthCard from '@/components/auth/AuthCard';

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
      <AuthCard>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
              <span className="material-symbols-outlined text-cyan-400 text-[28px]">check_circle</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100 mb-3">
            Password <em className="text-primary not-italic font-bold italic">updated.</em>
          </h1>
          <p className="text-sm text-slate-400 font-label">Redirecting to your dashboard...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <>
      <AuthCard>
        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-400 text-[28px]">key</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100">
            Choose a new <em className="text-primary not-italic font-bold italic">password.</em>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-label">
            Choose a strong password you haven&apos;t used before
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div id="update-password-error" className="px-4 py-3 rounded-2xl bg-red-900/20 ring-1 ring-red-500/20 text-red-400 text-sm font-body flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-900/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">error</span>
              </div>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoFocus
              disabled={!ready}
              aria-invalid={!!error}
              aria-describedby={error ? 'update-password-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-400 mb-1.5 font-label">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              required
              disabled={!ready}
              aria-invalid={!!error}
              aria-describedby={error ? 'update-password-error' : undefined}
              className="w-full bg-stone-800 border-none rounded-xl py-4 px-4 text-sm font-body text-slate-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !ready || !password || !confirm}
            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-white text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 motion-reduce:transition-none"
          >
            {loading ? 'Updating...' : 'Update Password'}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>
      </AuthCard>

      {!ready && !error && (
        <div className="flex justify-center mt-8">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
