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
        <div className="card p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Your Partner</h1>
        <p className="text-sm text-ink-muted">Manage your accountability partnership.</p>
      </div>

      {partner ? (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl flex-shrink-0">
                {partner.partner_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-ink">{partner.partner_name}</h3>
                <p className="text-sm text-ink-muted">{partner.partner_email}</p>
                {partner.partner_phone && (
                  <p className="text-xs text-ink-muted">{partner.partner_phone}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                partner.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : partner.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {partner.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="px-3 py-2 rounded-xl bg-surface-muted">
                <div className="text-xs text-ink-muted">Invited</div>
                <div className="font-medium text-ink">
                  {new Date(partner.invited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {partner.accepted_at && (
                <div className="px-3 py-2 rounded-xl bg-surface-muted">
                  <div className="text-xs text-ink-muted">Accepted</div>
                  <div className="font-medium text-ink">
                    {new Date(partner.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {partner.status === 'pending' && (
            <div className="card p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800 mb-3">
                {partner.partner_name} hasn't accepted your invitation yet. You can resend it.
              </p>
              <button onClick={handleReinvite} disabled={reinviting}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50">
                {reinviting ? 'Sending…' : 'Resend Invite'}
              </button>
            </div>
          )}

          {partner.status === 'active' && (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/partner/focus"
                className="card p-4 hover:shadow-md transition-shadow text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-sm font-medium text-ink">Their Focus Board</div>
              </Link>
              <Link href="/partner/checkins"
                className="card p-4 hover:shadow-md transition-shadow text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm font-medium text-ink">Check-ins</div>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-2">No partner yet</h3>
          <p className="text-sm text-ink-muted mb-6">
            Invite someone you trust to be your accountability partner.
          </p>
          <Link href="/onboarding"
            className="inline-flex px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
            Invite a Partner
          </Link>
        </div>
      )}
    </div>
  );
}
