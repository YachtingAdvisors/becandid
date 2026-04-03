'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error' | 'unauthenticated';

export default function TherapistAcceptPage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    async function acceptInvite() {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus('unauthenticated');
        return;
      }

      // Call PATCH /api/therapist to accept the invite
      try {
        const res = await fetch('/api/therapist', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invite_token: token, action: 'accept' }),
        });

        const data = await res.json();

        if (res.ok) {
          setConnectionId(data.connection_id);
          setStatus('success');
        } else {
          // Already accepted is still a "success" scenario
          if (res.status === 400 && data.error === 'Already accepted') {
            setConnectionId(data.connection_id);
            setStatus('success');
          } else {
            setErrorMessage(data.error || 'Failed to accept invitation');
            setStatus('error');
          }
        }
      } catch {
        setErrorMessage('Network error. Please try again.');
        setStatus('error');
      }
    }

    acceptInvite();
  }, [token, supabase]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Be Candid" className="h-10 w-auto mx-auto mb-4" />
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="material-symbols-outlined text-primary text-3xl">hourglass_top</span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
              Accepting Invitation
            </h2>
            <p className="text-sm text-on-surface-variant font-body">
              Setting up your therapist portal access...
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
              Invitation Accepted
            </h2>
            <p className="text-sm text-on-surface-variant font-body mb-6 leading-relaxed">
              You now have read-only access to your client&apos;s progress. Their consent settings
              control exactly what you can see.
            </p>
            <Link
              href="/therapist/dashboard"
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Unauthenticated state */}
        {status === 'unauthenticated' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">login</span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
              Sign In Required
            </h2>
            <p className="text-sm text-on-surface-variant font-body mb-6 leading-relaxed">
              You need to sign in to your Be Candid account before accepting this therapist
              portal invitation.
            </p>
            <Link
              href={`/auth/signin?redirect=/therapist/accept/${token}`}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Sign In to Continue
            </Link>
            <p className="text-xs text-on-surface-variant mt-4 font-label">
              Don&apos;t have an account?{' '}
              <Link href={`/auth/signup?redirect=/therapist/accept/${token}`} className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-3xl">error</span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
              Invitation Error
            </h2>
            <p className="text-sm text-on-surface-variant font-body mb-6">{errorMessage}</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/therapist/dashboard"
                className="btn-ghost w-full inline-flex items-center justify-center gap-2 text-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
