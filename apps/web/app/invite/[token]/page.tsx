'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [needsAccount, setNeedsAccount] = useState(false);
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

    // Check if user is signed in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setNeedsAccount(true);
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

    const { error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: name.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setAccepting(false);
      return;
    }

    // Create profile + accept invite
    await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    }).catch(() => {});

    const res = await fetch('/api/partners/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to accept');
      setAccepting(false);
      return;
    }

    router.push('/partner/onboarding');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="card p-8 animate-pulse w-80">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">Invalid Invite</h2>
          <p className="text-sm text-ink-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">You're Invited</h1>
          <p className="text-sm text-ink-muted mt-1">
            <strong>{invite?.inviter_name}</strong> wants you to be their accountability partner on Be Candid.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>
        )}

        {!needsAccount ? (
          <div className="card p-6 space-y-4">
            <div className="px-4 py-3 rounded-xl bg-brand-50 border border-brand-200">
              <p className="text-sm text-brand-700 leading-relaxed">
                As an accountability partner, you'll receive alerts when {invite?.inviter_name} flags activity,
                along with AI-generated conversation guides. You'll also participate in mutual check-ins.
              </p>
            </div>
            <button onClick={handleAccept} disabled={accepting}
              className="w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">
              {accepting ? 'Accepting…' : 'Accept Invitation'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUpAndAccept} className="card p-6 space-y-4">
            <p className="text-sm text-ink-muted">Create a free account to accept this invitation.</p>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <button type="submit" disabled={accepting}
              className="w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">
              {accepting ? 'Creating account…' : 'Create Account & Accept'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
