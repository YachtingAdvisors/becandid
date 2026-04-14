'use client';

import { useState, useEffect } from 'react';

interface BillingData {
  plan: string;
  hasStripe: boolean;
  expiresAt: string | null;
  limits: {
    aiGuidesPerMonth: number;
    regenerationsPerMonth: number;
    maxPartners: number;
    vulnerabilityWindows: number;
    patternDetection: boolean;
  };
}

const PLAN_DISPLAY = {
  free: { label: 'Free', color: 'text-gray-600', bg: 'bg-surface-container-low', border: 'border-gray-200' },
  pro:  { label: 'Pro',  color: 'text-primary', bg: 'bg-primary-container/30', border: 'border-primary/30' },
  team: { label: 'Team', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' },
};

export default function BillingSection() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch('/api/billing')
      .then(r => r.json())
      .then(setBilling)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: 'pro_annual' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert('Billing is not configured yet. Contact support.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setUpgrading(false);
  }

  async function handleManage() {
    const res = await fetch('/api/billing', { method: 'PUT' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (loading) {
    return <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 animate-pulse"><div className="h-20 bg-surface-container-low rounded" /></section>;
  }

  if (!billing) return null;

  const display = PLAN_DISPLAY[billing.plan as keyof typeof PLAN_DISPLAY] ?? PLAN_DISPLAY.free;
  const isPro = billing.plan === 'pro' || billing.plan === 'team';

  return (
    <section className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-lg font-semibold text-on-surface">Plan & Billing</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${display.bg} ${display.color} border ${display.border}`}>
              {display.label}
            </span>
            {billing.expiresAt && (
              <span className="text-xs text-on-surface-variant">
                Access until {new Date(billing.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {isPro && billing.hasStripe ? (
          <button onClick={handleManage}
            className="px-4 py-2 text-xs font-medium text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-muted transition-colors">
            Manage Billing
          </button>
        ) : !isPro ? (
          <button onClick={handleUpgrade} disabled={upgrading}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary disabled:opacity-50 transition-colors">
            {upgrading ? 'Loading…' : 'Upgrade to Pro'}
          </button>
        ) : null}
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-on-surface-variant">AI Guides / month</div>
          <div className="font-semibold text-on-surface">
            {billing.limits.aiGuidesPerMonth === -1 ? 'Unlimited' : billing.limits.aiGuidesPerMonth}
          </div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-on-surface-variant">Partners</div>
          <div className="font-semibold text-on-surface">{billing.limits.maxPartners}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-on-surface-variant">Vulnerability Windows</div>
          <div className="font-semibold text-on-surface">{billing.limits.vulnerabilityWindows}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-on-surface-variant">Pattern Detection</div>
          <div className="font-semibold text-on-surface">{billing.limits.patternDetection ? <><span className="material-symbols-outlined text-sm text-emerald-500 align-middle">check_circle</span> Active</> : <><span className="material-symbols-outlined text-sm text-red-500 align-middle">cancel</span> Pro only</>}</div>
        </div>
      </div>

      {!isPro && (
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-container/30 to-violet-50 border border-primary/20">
          <p className="text-sm text-primary leading-relaxed">
            <strong>Upgrade to Pro</strong> for unlimited AI conversation guides, pattern detection,
            contextual check-in prompts, and up to 10 vulnerability windows.
          </p>
        </div>
      )}
    </section>
  );
}
