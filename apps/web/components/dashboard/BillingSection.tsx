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
  free: { label: 'Free', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  pro:  { label: 'Pro',  color: 'text-brand-700', bg: 'bg-brand-100', border: 'border-brand-300' },
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
    const res = await fetch('/api/billing', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.fallback) {
      alert('Billing is not configured yet. Contact support.');
    }
    setUpgrading(false);
  }

  async function handleManage() {
    const res = await fetch('/api/billing', { method: 'PUT' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (loading) {
    return <section className="card p-5 animate-pulse"><div className="h-20 bg-gray-100 rounded" /></section>;
  }

  if (!billing) return null;

  const display = PLAN_DISPLAY[billing.plan as keyof typeof PLAN_DISPLAY] ?? PLAN_DISPLAY.free;
  const isPro = billing.plan === 'pro' || billing.plan === 'team';

  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Plan & Billing</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${display.bg} ${display.color} border ${display.border}`}>
              {display.label}
            </span>
            {billing.expiresAt && (
              <span className="text-xs text-ink-muted">
                Access until {new Date(billing.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {isPro && billing.hasStripe ? (
          <button onClick={handleManage}
            className="px-4 py-2 text-xs font-medium text-ink-muted border border-surface-border rounded-xl hover:bg-surface-muted transition-colors">
            Manage Billing
          </button>
        ) : !isPro ? (
          <button onClick={handleUpgrade} disabled={upgrading}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {upgrading ? 'Loading…' : 'Upgrade to Pro'}
          </button>
        ) : null}
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-ink-muted">AI Guides / month</div>
          <div className="font-semibold text-ink">
            {billing.limits.aiGuidesPerMonth === -1 ? 'Unlimited' : billing.limits.aiGuidesPerMonth}
          </div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-ink-muted">Partners</div>
          <div className="font-semibold text-ink">{billing.limits.maxPartners}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-ink-muted">Vulnerability Windows</div>
          <div className="font-semibold text-ink">{billing.limits.vulnerabilityWindows}</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-muted">
          <div className="text-xs text-ink-muted">Pattern Detection</div>
          <div className="font-semibold text-ink">{billing.limits.patternDetection ? <><span className="material-symbols-outlined text-sm text-emerald-500 align-middle">check_circle</span> Active</> : <><span className="material-symbols-outlined text-sm text-red-500 align-middle">cancel</span> Pro only</>}</div>
        </div>
      </div>

      {!isPro && (
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200">
          <p className="text-sm text-brand-700 leading-relaxed">
            <strong>Upgrade to Pro</strong> for unlimited AI conversation guides, pattern detection,
            contextual check-in prompts, and up to 10 vulnerability windows.
          </p>
        </div>
      )}
    </section>
  );
}
