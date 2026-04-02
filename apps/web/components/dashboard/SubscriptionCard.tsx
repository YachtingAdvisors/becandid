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
        <div className="space-y-2">
          <button onClick={() => openCheckout('annual')} disabled={actionLoading}
            className="w-full py-3 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary disabled:opacity-50 transition-colors shadow-lg shadow-primary/20">
            {actionLoading ? 'Opening…' : 'Upgrade to Pro — $129/year'}
          </button>
          <p className="text-center text-xs font-semibold text-orange-600">Save $39 — normally $167.88/year</p>
          <button onClick={() => openCheckout('monthly')} disabled={actionLoading}
            className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
            or $13.99/month
          </button>
        </div>
      )}

      {/* Upgrade to Therapy from Pro */}
      {data.plan === 'pro' && (
        <button onClick={() => openCheckout('monthly', 'therapy')} disabled={actionLoading}
          className="w-full mt-2 py-2 text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors">
          Upgrade to Therapy plan ($19.99/mo) for therapist portal →
        </button>
      )}
    </div>
  );
}
