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

    // Create profile row via API (service role handles insert)
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold text-primary">Be Candid</h1>
          <p className="text-sm text-on-surface-variant mt-2 font-body">Start your accountability journey</p>
        </div>

        {!ageVerified ? (
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
            <AgeGate onVerified={() => setAgeVerified(true)} />
          </div>
        ) : (
          <>
            <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
              <form onSubmit={handleSignUp} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-2xl bg-error/5 border border-error/20 text-error text-sm font-body">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Your name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Alex" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="At least 8 characters" />
                </div>

                <SignupConsent checked={consented} onChange={setConsented} />

                <button type="submit" disabled={!consented || loading}
                  className="w-full py-3 bg-primary text-on-primary text-sm font-headline font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-xs text-on-surface-variant text-center mt-4 font-body">
                Developed in partnership with board-certified neurologists and licensed mental health professionals
              </p>
            </div>

            <p className="text-center text-sm text-on-surface-variant mt-6 font-body">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
