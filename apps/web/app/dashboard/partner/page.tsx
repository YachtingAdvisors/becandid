'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { GoalCategory } from '@be-candid/shared';
import { GOAL_LABELS, getCategoryEmoji } from '@be-candid/shared';

interface PartnerData {
  id: string;
  partner_name: string;
  partner_email: string;
  partner_phone: string | null;
  status: 'pending' | 'active' | 'declined';
  invited_at: string;
  accepted_at: string | null;
}

const RELATIONSHIP_TYPES = ['friend', 'spouse', 'mentor', 'coach', 'therapist', 'pastor'] as const;

export default function PartnerPage() {
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reinviting, setReinviting] = useState(false);

  // Inline invite form state
  const [showForm, setShowForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [userGoals, setUserGoals] = useState<GoalCategory[]>([]);
  const [sharedRivals, setSharedRivals] = useState<GoalCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch partner data
  const fetchPartner = () => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(d => setPartner(d.partner ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartner();
  }, []);

  // Fetch user profile to get goals when form opens
  useEffect(() => {
    if (!showForm) return;
    fetch('/api/auth/profile')
      .then(r => r.json())
      .then(d => {
        const goals: GoalCategory[] = d.profile?.goals ?? d.goals ?? [];
        setUserGoals(goals);
        setSharedRivals(goals); // pre-select all
      })
      .catch(console.error);
  }, [showForm]);

  async function handleReinvite() {
    if (!partner) return;
    setReinviting(true);
    await fetch('/api/partners/reinvite', { method: 'POST' });
    setReinviting(false);
  }

  async function handleInvite() {
    setError('');
    if (!partnerName.trim()) { setError('Please enter your partner\'s name.'); return; }
    if (!partnerEmail.trim()) { setError('Please enter your partner\'s email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail.trim())) { setError('Please enter a valid email address.'); return; }
    if (partnerPhone.trim() && partnerPhone.trim().length < 7) { setError('Please enter a valid phone number (at least 7 digits).'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_name: partnerName.trim(),
          partner_email: partnerEmail.trim().toLowerCase(),
          partner_phone: partnerPhone.trim() || undefined,
          relationship_type: relationship,
          shared_rivals: sharedRivals,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const fields = data.details.fieldErrors;
          const messages: string[] = [];
          if (fields.partner_name) messages.push(`Name: ${fields.partner_name[0]}`);
          if (fields.partner_email) messages.push(`Email: ${fields.partner_email[0]}`);
          if (fields.partner_phone) messages.push(`Phone: ${fields.partner_phone[0]}`);
          if (fields.relationship_type) messages.push(`Relationship: ${fields.relationship_type[0]}`);
          setError(messages.length > 0 ? messages.join('. ') : (data.error || 'Failed to send invite'));
        } else {
          setError(data.error || 'Failed to send invite');
        }
      } else {
        // Success — reset form and refresh
        setShowForm(false);
        setPartnerName('');
        setPartnerEmail('');
        setPartnerPhone('');
        setRelationship('friend');
        setSharedRivals([]);
        setLoading(true);
        fetchPartner();
      }
    } catch {
      setError('Failed to send invite');
    }
    setSubmitting(false);
  }

  function toggleRival(goal: GoalCategory) {
    setSharedRivals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  }

  function handleCancel() {
    setShowForm(false);
    setError('');
    setPartnerName('');
    setPartnerEmail('');
    setPartnerPhone('');
    setRelationship('friend');
    setSharedRivals([]);
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
        <div className="space-y-4">
          {/* No partner — show CTA or inline form */}
          {!showForm ? (
            <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-8 text-center">
              <div className="text-4xl mb-4">{'\uD83E\uDD1D'}</div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No partner yet</h3>
              <p className="text-sm text-on-surface-variant font-body mb-6">
                Invite someone you trust to be your accountability partner.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex px-6 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">
                Invite a Partner
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6 space-y-6">
              {/* Section 1: Partner Details */}
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-1">Partner details</h3>
                <p className="text-sm text-on-surface-variant font-body mb-4">
                  A friend, spouse, mentor, or coach who&apos;ll walk with you.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their name</label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Their email</label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="partner@email.com"
                      className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">
                      Their phone <span className="text-on-surface-variant font-normal">(optional — for SMS alerts)</span>
                    </label>
                    <input
                      type="tel"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 rounded-2xl ring-1 ring-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5 font-label">Relationship</label>
                    <div className="flex flex-wrap gap-2">
                      {RELATIONSHIP_TYPES.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRelationship(r)}
                          className={`px-4 py-2 rounded-full text-sm font-label font-medium border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            relationship === r
                              ? 'border-primary bg-primary-container text-primary'
                              : 'border-outline-variant text-on-surface-variant hover:border-primary/30'
                          }`}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-outline-variant/20" />

              {/* Section 2: Rival Sharing */}
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-1">What would you like your partner to see?</h3>
                <p className="text-sm text-on-surface-variant font-body mb-4">
                  Choose which rivals your partner will have visibility into. You can change this later.
                </p>

                {userGoals.length === 0 ? (
                  <div className="px-4 py-3 rounded-2xl bg-surface-container-low text-center">
                    <p className="text-sm text-on-surface-variant font-body">
                      No rivals configured yet. Your partner will see all future rivals by default.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userGoals.map((goal) => {
                      const isSelected = sharedRivals.includes(goal);
                      return (
                        <button
                          key={goal}
                          onClick={() => toggleRival(goal)}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-label font-medium border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            isSelected
                              ? 'border-primary bg-primary-container/40 text-primary'
                              : 'border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:border-primary/30'
                          }`}>
                          <span className="text-base">{getCategoryEmoji(goal)}</span>
                          <span>{GOAL_LABELS[goal]}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {userGoals.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => setSharedRivals([...userGoals])}
                      className="text-xs font-label font-medium text-primary hover:underline cursor-pointer">
                      Select all
                    </button>
                    <button
                      onClick={() => setSharedRivals([])}
                      className="text-xs font-label font-medium text-on-surface-variant hover:underline cursor-pointer">
                      Deselect all
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && <p className="text-sm text-error font-body">{error}</p>}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 min-h-[44px] text-sm font-label font-semibold rounded-2xl ring-1 ring-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!partnerName.trim() || !partnerEmail.trim() || submitting}
                  className="flex-1 px-6 py-3 min-h-[44px] bg-primary text-on-primary text-sm font-label font-semibold rounded-2xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200">
                  {submitting ? 'Sending invite\u2026' : 'Send Invite'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
