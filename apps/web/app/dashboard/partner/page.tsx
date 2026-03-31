'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PartnerData {
  id: string;
  partner_name: string;
  partner_email: string;
  partner_phone: string | null;
  status: 'pending' | 'active' | 'declined';
  invited_at: string;
  accepted_at: string | null;
}

export default function PartnerPage() {
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reinviting, setReinviting] = useState(false);

  useEffect(() => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(d => setPartner(d.partner ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleReinvite() {
    if (!partner) return;
    setReinviting(true);
    await fetch('/api/partners/reinvite', { method: 'POST' });
    setReinviting(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-8 animate-pulse">
          <div className="h-6 bg-surface-container rounded w-48 mb-4" />
          <div className="h-4 bg-surface-container-low rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Accountability</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Your Partner</h1>
        <p className="text-sm text-on-surface-variant font-body">Manage your accountability partnership.</p>
      </div>

      {partner ? (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary font-headline font-bold text-xl flex-shrink-0">
                {partner.partner_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-lg font-bold text-on-surface">{partner.partner_name}</h3>
                <p className="text-sm text-on-surface-variant font-body">{partner.partner_email}</p>
                {partner.partner_phone && (
                  <p className="text-xs text-on-surface-variant font-label">{partner.partner_phone}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-label font-semibold ${
                partner.status === 'active'
                  ? 'bg-primary-container text-primary'
                  : partner.status === 'pending'
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-error/10 text-error'
              }`}>
                {partner.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="px-3 py-2 rounded-2xl bg-surface-container-low">
                <div className="text-xs text-on-surface-variant font-label">Invited</div>
                <div className="font-label font-medium text-on-surface">
                  {new Date(partner.invited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {partner.accepted_at && (
                <div className="px-3 py-2 rounded-2xl bg-surface-container-low">
                  <div className="text-xs text-on-surface-variant font-label">Accepted</div>
                  <div className="font-label font-medium text-on-surface">
                    {new Date(partner.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {partner.status === 'pending' && (
            <div className="bg-tertiary-container/30 rounded-3xl border border-tertiary-container p-4">
              <p className="text-sm text-on-tertiary-container font-body mb-3">
                {partner.partner_name} hasn&apos;t accepted your invitation yet. You can resend it.
              </p>
              <button onClick={handleReinvite} disabled={reinviting}
                className="px-4 py-2 min-h-[44px] bg-tertiary text-on-primary text-sm font-label font-medium rounded-2xl cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
                {reinviting ? 'Sending\u2026' : 'Resend Invite'}
              </button>
            </div>
          )}

          {partner.status === 'active' && (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/partner/focus"
                className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-4 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] cursor-pointer transition-all duration-200 text-center">
                <div className="text-2xl mb-1">{'\uD83C\uDFAF'}</div>
                <div className="text-sm font-label font-medium text-on-surface">Their Focus Board</div>
              </Link>
              <Link href="/partner/checkins"
                className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-4 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] cursor-pointer transition-all duration-200 text-center">
                <div className="text-2xl mb-1">{'\uD83D\uDCCB'}</div>
                <div className="text-sm font-label font-medium text-on-surface">Check-ins</div>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-8 text-center">
          <div className="text-4xl mb-4">{'\uD83E\uDD1D'}</div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No partner yet</h3>
          <p className="text-sm text-on-surface-variant font-body mb-6">
            Invite someone you trust to be your accountability partner.
          </p>
          <Link href="/onboarding"
            className="inline-flex px-6 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
            Invite a Partner
          </Link>
        </div>
      )}
    </div>
  );
}
