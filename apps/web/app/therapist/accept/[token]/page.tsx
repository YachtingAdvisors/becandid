'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Status = 'loading' | 'needs_auth' | 'accepting' | 'success' | 'error';

export default function TherapistAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/sessions')
      .then(r => {
        if (r.status === 401) {
          setStatus('needs_auth');
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (data) acceptInvite();
      })
      .catch(() => setStatus('needs_auth'));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  async function acceptInvite() {
    setStatus('accepting');
    try {
      const res = await fetch('/api/therapist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_token: token, action: 'accept' }),
      });
      const data = await res.json();
      if (res.ok) {
        setClientName(data.client_name || 'your client');
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Failed to accept invitation');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Be Candid" className="h-12 w-auto mx-auto" />

        {status === 'loading' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 animate-pulse">
            <div className="h-6 bg-surface-container-low rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-surface-container-low rounded w-64 mx-auto" />
          </div>
        )}

        {status === 'needs_auth' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 space-y-4">
            <span className="material-symbols-outlined text-4xl text-primary">medical_services</span>
            <h1 className="font-headline text-xl font-extrabold text-on-surface">Therapist Invitation</h1>
            <p className="text-sm text-on-surface-variant font-body">
              You&apos;ve been invited to join Be Candid as a therapist. Sign in or create an account to accept.
            </p>
            <div className="space-y-2">
              <Link
                href={`/auth/signin?redirect=/therapist/accept/${token}`}
                className="btn-primary w-full justify-center"
              >
                Sign in to accept
              </Link>
              <Link
                href={`/auth/signup?redirect=/therapist/accept/${token}`}
                className="btn-ghost w-full justify-center"
              >
                Create an account
              </Link>
            </div>
          </div>
        )}

        {status === 'accepting' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-on-surface-variant font-body">Accepting invitation...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 space-y-4">
            <span className="material-symbols-outlined text-4xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h1 className="font-headline text-xl font-extrabold text-on-surface">You&apos;re Connected!</h1>
            <p className="text-sm text-on-surface-variant font-body">
              You now have therapist access to <strong>{clientName}</strong>&apos;s data, subject to their consent settings. Their privacy is in your hands.
            </p>
            <Link href="/therapist/dashboard" className="btn-primary w-full justify-center">
              Go to Therapist Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 space-y-4">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
            <h1 className="font-headline text-xl font-extrabold text-on-surface">Invitation Error</h1>
            <p className="text-sm text-on-surface-variant font-body">{errorMsg}</p>
            <div className="space-y-2">
              <button onClick={acceptInvite} className="btn-primary w-full justify-center">
                Try Again
              </button>
              <Link href="/" className="btn-ghost w-full justify-center">
                Go Home
              </Link>
            </div>
          </div>
        )}

        <p className="text-[10px] text-on-surface-variant/60 font-body">
          Be Candid therapist accounts are free. Read our <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
