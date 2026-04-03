'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetch(`/api/partners/invite?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setInvite(d.invite);
      })
      .catch(() => setError('Failed to load invite'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowSignup(true);
      setAccepting(false);
      return;
    }

    const res = await fetch('/api/partners/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to accept invite');
      setAccepting(false);
      return;
    }

    router.push('/partner/onboarding');
  }

  async function handleSignUpAndAccept(e: React.FormEvent) {
    e.preventDefault();
    setAccepting(true);
    setError('');

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: name.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setAccepting(false);
      return;
    }

    // signUp may return a user even when email confirmation is required
    // (user.identities will be empty if the email is already taken)
    const newUserId = signUpData?.user?.id;
    if (!newUserId) {
      setError('Signup succeeded but no user was returned. Please check your email and try signing in.');
      setAccepting(false);
      return;
    }

    // If email confirmation is required, the session won't exist yet.
    // Check whether we actually got a session.
    const hasSession = !!signUpData?.session;

    // Try to create the profile — this may 401 if no session cookie yet,
    // which is fine; the accept endpoint will create the user row via ensureUserRow.
    if (hasSession) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), invited_as_partner: true }),
      }).catch(() => {});
    }

    // Accept the invite, passing userId for the inline signup flow
    // so the accept endpoint can work even without a session cookie.
    const res = await fetch('/api/partners/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: newUserId }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to accept');
      setAccepting(false);
      return;
    }

    // If we have a session, go to onboarding; otherwise prompt to verify email
    if (hasSession) {
      router.push('/partner/onboarding');
    } else {
      router.push('/auth/signin?message=invite_accepted_verify_email');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-8 animate-pulse w-80">
          <div className="h-6 bg-surface-container-low rounded-xl w-48 mx-auto mb-4" />
          <div className="h-4 bg-surface-container-low rounded-xl w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-8 text-center max-w-sm relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
          </div>
          <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Invalid Invite</h2>
          <p className="text-sm text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Be Candid" className="h-10 w-auto mx-auto mb-4" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-4xl">favorite</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            {invite?.inviter_name} needs your support
          </h1>
          <p className="text-sm font-body text-on-surface-variant mt-2 leading-relaxed">
            {invite?.inviter_name} is on a journey to align their digital life with who they want to be.
            They&apos;ve chosen <strong>you</strong> as someone they trust to walk with them.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 ring-1 ring-red-200 text-red-700 text-sm mb-4">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {!showSignup ? (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
            {/* What being a partner means */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-sm font-body text-on-surface-variant">You&apos;ll receive alerts with AI conversation guides &mdash; no judgment, just support</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-sm font-body text-on-surface-variant">No setup required &mdash; just accept and you&apos;re connected</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-sm font-body text-on-surface-variant">Optionally start your own journey and enjoy the full Be Candid experience</p>
              </div>
            </div>

            {/* Bonus callout */}
            <div className="px-4 py-3 rounded-2xl bg-amber-50 ring-1 ring-amber-200/50">
              <p className="text-xs text-amber-800 font-body leading-relaxed">
                <span className="material-symbols-outlined text-amber-600 text-sm align-text-bottom mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
                <strong>Bonus:</strong> If you also add a partner of your own during signup, you get <strong>30 free days</strong> instead of the standard 15.
              </p>
            </div>

            <button onClick={handleAccept} disabled={accepting}
              className="w-full py-3.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {accepting ? 'Accepting...' : 'Accept & Support ' + (invite?.inviter_name?.split(' ')[0] ?? 'Them')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUpAndAccept} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
            <p className="text-sm font-body text-on-surface-variant">
              Create a free account to be {invite?.inviter_name?.split(' ')[0]}&apos;s partner. No rivals or setup required &mdash; just your presence.
            </p>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1 font-label">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1 font-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1 font-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                placeholder="At least 8 characters"
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="px-4 py-3 rounded-2xl bg-amber-50 ring-1 ring-amber-200/50">
              <p className="text-xs text-amber-800 font-body">
                <strong>30 free days</strong> if you add a partner of your own during onboarding (instead of the standard 15).
              </p>
            </div>

            <button type="submit" disabled={accepting}
              className="w-full py-3.5 bg-primary text-on-primary text-sm font-headline font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">person_add</span>
              {accepting ? 'Creating account...' : 'Create Account & Accept'}
            </button>

            <p className="text-center text-sm text-on-surface-variant font-label">
              Already have an account?{' '}
              <Link href={`/auth/signin?redirect=/invite/${token}`} className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
