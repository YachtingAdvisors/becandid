// ============================================================
// components/dashboard/SubscriptionCard.tsx
//
// Shows in Settings. Displays:
//   - Current plan + status
//   - Trial countdown (if trialing)
//   - AI guide usage this month (for free users)
//   - Upgrade button (for free users)
//   - Manage billing button (for paid users)
// ============================================================

'use client';

import { useState } from 'react';
import useSWR from 'swr';

const PLAN_DISPLAY: Record<string, { name: string; emoji: string; color: string }> = {
  free: { name: 'Free', emoji: 'eco', color: 'text-on-surface-variant' },
  pro: { name: 'Pro', emoji: 'bolt', color: 'text-primary' },
  therapy: { name: 'Therapy', emoji: 'medical_services', color: 'text-violet-600' },
};

export default function SubscriptionCard() {
  const { data, error, isLoading: loading, mutate } = useSWR<any>('/api/billing');
  const [actionLoading, setActionLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);

  const openCheckout = async (billing: 'monthly' | 'annual', plan: 'pro' | 'therapy' = 'pro') => {
    setActionLoading(true);
    const priceKey = `${plan}_${billing}`;
    const priceId = data?.prices?.[priceKey];
    if (!priceId) { setActionLoading(false); return; }

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId }),
      });
      const result = await res.json();
      if (result.url) window.location.href = result.url;
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const openPortal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing', { method: 'PATCH' });
      const result = await res.json();
      if (result.url) window.location.href = result.url;
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  if (loading) return <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5"><div className="h-24 animate-pulse bg-surface-container-low rounded-lg" /></div>;
  if (!data) return null;

  const planInfo = PLAN_DISPLAY[data.plan] || PLAN_DISPLAY.free;
  const isPaid = data.plan !== 'free';
  const isPastDue = data.status === 'past_due';
  const isGrandfathered = data.grandfathered === true;

  // BETA MODE: everyone gets full access
  const BETA_MODE = true;
  if (BETA_MODE) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-violet-600" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Subscription</h3>
              <p className="text-xs font-medium text-violet-600">Free Beta Access</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-label font-bold">
            All Features Unlocked
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-50 to-primary/5 border border-violet-100">
          <p className="text-xs text-violet-800 font-body leading-relaxed">
            You&apos;re part of the Be Candid beta. All features are free during this period &mdash; no limits, no credit card required. Your feedback shapes what we build.
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <a href="https://discord.gg/sCkyPuqf6" target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-label font-semibold text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
            <span className="material-symbols-outlined text-sm">forum</span>
            Join Discord
          </a>
          <a href="/donate"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-label font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-sm">volunteer_activism</span>
            Support the Project
          </a>
        </div>
      </div>
    );
  }

  // Grandfathered users see a special card
  if (isGrandfathered) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Subscription</h3>
              <p className="text-xs font-medium text-emerald-600">Founding Member</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label font-bold">
            Full Access
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-primary/5 border border-emerald-100">
          <p className="text-xs text-emerald-800 font-body leading-relaxed">
            Thank you for being an early supporter of Be Candid. You have permanent free access to all features — no limits, no trial, no payment required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">{planInfo.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Subscription</h3>
            <p className={`text-xs font-medium ${planInfo.color}`}>{planInfo.name} Plan</p>
          </div>
        </div>
        {isPastDue && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
            Payment Issue
          </span>
        )}
      </div>

      {/* Trial countdown */}
      {data.trial?.active && (
        <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-r from-primary/8 to-tertiary/5 border border-primary/15">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-label font-bold text-primary">
              {data.trial.days_left} day{data.trial.days_left !== 1 ? 's' : ''} left
            </p>
            <span className="text-[10px] font-label text-on-surface-variant">
              Free trial ends {new Date(data.trial.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dim transition-all"
              style={{ width: `${Math.max(5, ((30 - data.trial.days_left) / 30) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5">
            Invite a partner to earn 30 free days. No card required.
          </p>
        </div>
      )}

      {/* Past due warning */}
      {isPastDue && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-700 font-medium">Your last payment failed</p>
          <p className="text-[10px] text-red-600 mt-0.5">
            Please update your payment method to keep your {planInfo.name} features.
          </p>
          <button onClick={openPortal} disabled={actionLoading}
            className="mt-2 text-xs text-red-700 font-medium underline">
            Update payment method →
          </button>
        </div>
      )}

      {/* AI guide usage (free users) */}
      {!isPaid && data.usage?.ai_guides_limit && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-on-surface-variant mb-1">
            <span>AI Guides this month</span>
            <span>{data.usage.ai_guides_used}/{data.usage.ai_guides_limit}</span>
          </div>
          <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.usage.ai_guides_used >= data.usage.ai_guides_limit ? 'bg-red-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (data.usage.ai_guides_used / data.usage.ai_guides_limit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {isPaid ? (
        <button onClick={openPortal} disabled={actionLoading}
          className="w-full py-2.5 text-sm font-medium rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low disabled:opacity-50 transition-colors">
          {actionLoading ? 'Opening…' : 'Manage Billing'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pro-logo.png" alt="Be Candid Pro" className="w-12 h-12 rounded-xl shadow-md" />
            <div className="flex-1">
              <p className="text-sm font-headline font-bold text-on-surface">Be Candid Pro</p>
              <p className="text-[10px] text-on-surface-variant">5 partners, unlimited AI guides, pattern detection</p>
            </div>
          </div>
          <button onClick={() => openCheckout('annual')} disabled={actionLoading}
            className="w-full py-3 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary disabled:opacity-50 transition-colors shadow-lg shadow-primary/20">
            {actionLoading ? 'Opening…' : 'Upgrade to Pro — $6.58/mo'}
          </button>
          <p className="text-center text-[10px] text-on-surface-variant">$79/year billed annually</p>
          <p className="text-center text-xs font-semibold text-orange-600">Save 34% vs monthly</p>
          <button onClick={() => openCheckout('monthly')} disabled={actionLoading}
            className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            or $9.99/month
          </button>
        </div>
      )}

      {/* Promo code */}
      {!isPaid && (
        <div className="mt-3">
          {!showPromo ? (
            <button onClick={() => setShowPromo(true)} className="w-full text-xs text-on-surface-variant hover:text-primary font-label transition-colors cursor-pointer">
              Have a promo code?
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoError(''); setPromoSuccess(''); }}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
                />
                <button
                  onClick={async () => {
                    if (!promoCode.trim()) return;
                    setApplyingPromo(true);
                    setPromoError('');
                    setPromoSuccess('');
                    try {
                      const res = await fetch('/api/billing/promo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: promoCode.trim() }),
                      });
                      const d = await res.json();
                      if (res.ok) {
                        setPromoSuccess(d.message);
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        setPromoError(d.error || 'Invalid code');
                      }
                    } catch {
                      setPromoError('Failed to apply code');
                    } finally {
                      setApplyingPromo(false);
                    }
                  }}
                  disabled={applyingPromo || !promoCode.trim()}
                  className="px-4 py-2 text-sm font-label font-bold rounded-lg bg-primary text-on-primary hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {applyingPromo ? '...' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-xs text-error font-label">{promoError}</p>}
              {promoSuccess && <p className="text-xs text-emerald-600 font-label font-bold">{promoSuccess}</p>}
            </div>
          )}
        </div>
      )}

      {/* Supporter badge */}
      {data.supporter?.is_supporter && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 ring-1 ring-amber-200/30">
          <span className="material-symbols-outlined text-amber-500 text-base">favorite</span>
          <span className="text-xs font-bold text-amber-700">Supporter</span>
          {data.supporter.supporter_until && (
            <span className="text-[10px] text-amber-600 ml-auto">
              Pro until {new Date(data.supporter.supporter_until).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Support / Donate */}
      <div className="mt-3 p-3 rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-base text-amber-500">volunteer_activism</span>
          <p className="text-xs font-semibold text-on-surface">Support Be Candid</p>
        </div>
        <p className="text-[10px] text-on-surface-variant mb-2.5">
          Any donation gives you 30 days of Pro + a Supporter badge.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={donationAmount}
              onChange={e => setDonationAmount(e.target.value)}
              placeholder="5"
              className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-amber-400/30 font-body"
            />
          </div>
          <button
            onClick={async () => {
              const amt = parseFloat(donationAmount);
              if (!amt || amt < 1) return;
              setDonationLoading(true);
              try {
                const res = await fetch('/api/billing/donate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount: amt }),
                });
                const result = await res.json();
                if (result.url) window.location.href = result.url;
              } catch (e) { console.error(e); }
              setDonationLoading(false);
            }}
            disabled={donationLoading || !donationAmount || parseFloat(donationAmount) < 1}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            {donationLoading ? '...' : 'Donate'}
          </button>
        </div>
      </div>

      {/* Upgrade to Therapy from Pro */}
      {data.plan === 'pro' && (
        <div className="mt-3 p-3 rounded-xl bg-violet-50 ring-1 ring-violet-200/30">
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/therapy-logo.png" alt="Be Candid Therapy" className="w-10 h-10 rounded-xl shadow-md" />
            <div className="flex-1">
              <p className="text-sm font-headline font-bold text-on-surface">Therapist Portal</p>
              <p className="text-[10px] text-on-surface-variant">Inpatient-level insights for your therapist</p>
            </div>
          </div>
          <button onClick={() => openCheckout('monthly', 'therapy')} disabled={actionLoading}
            className="w-full py-2 text-xs text-violet-600 hover:text-violet-800 font-bold transition-colors">
            Upgrade — $19.99/mo →
          </button>
        </div>
      )}
    </div>
  );
}
