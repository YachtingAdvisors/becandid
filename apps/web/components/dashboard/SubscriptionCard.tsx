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

import { useState, useEffect } from 'react';

const PLAN_DISPLAY: Record<string, { name: string; emoji: string; color: string }> = {
  free: { name: 'Free', emoji: 'eco', color: 'text-on-surface-variant' },
  pro: { name: 'Pro', emoji: 'bolt', color: 'text-primary' },
  therapy: { name: 'Therapy', emoji: 'medical_services', color: 'text-violet-600' },
};

export default function SubscriptionCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    fetch('/api/billing')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      {/* Trial banner */}
      {data.trial?.active && (
        <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary font-medium">
            Free trial — {data.trial.days_left} day{data.trial.days_left !== 1 ? 's' : ''} left
          </p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            Your card won't be charged until {new Date(data.trial.ends_at).toLocaleDateString()}.
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
            {actionLoading ? 'Opening…' : 'Upgrade to Pro — $99/year'}
          </button>
          <p className="text-center text-xs font-semibold text-orange-600">Save $20 — normally $119.88/year</p>
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
