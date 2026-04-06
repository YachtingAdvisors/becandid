'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

// ─── Component ───────────────────────────────────────────────

export default function AdminFeaturesClient() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/feature-flags')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load flags');
        return r.json();
      })
      .then((d) => setFlags(d.flags || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    setToggling(flag.key);
    setToast('');

    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: flag.key, enabled: !flag.enabled }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast(`Error: ${data.error || 'Failed to update'}`);
        return;
      }

      // Update local state immutably
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, ...data.flag } : f)),
      );
      setToast(`"${flag.key}" ${!flag.enabled ? 'enabled' : 'disabled'}`);
    } catch {
      setToast('Network error');
    } finally {
      setToggling(null);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-20 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 rounded-3xl p-6 text-center">
        <span className="material-symbols-outlined text-3xl text-error mb-2 block">error</span>
        <p className="text-sm text-error font-body">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">toggle_on</span>
        <h2 className="font-headline text-lg font-bold text-on-surface">
          Feature Flags
        </h2>
        <span className="text-xs text-on-surface-variant font-body">
          ({flags.length} flags)
        </span>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-body ${
            toast.startsWith('Error')
              ? 'bg-error/10 text-error'
              : 'bg-primary/10 text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.startsWith('Error') ? 'error' : 'check_circle'}
          </span>
          {toast}
        </div>
      )}

      {/* Flags list */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5
                       flex items-center justify-between gap-4 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-semibold text-on-surface">
                  {flag.key}
                </code>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    flag.enabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
              </div>
              {flag.description && (
                <p className="text-xs text-on-surface-variant font-body mt-1">
                  {flag.description}
                </p>
              )}
              {flag.updated_by && (
                <p className="text-xs text-on-surface-variant/60 font-body mt-1">
                  Updated by {flag.updated_by} &middot;{' '}
                  {new Date(flag.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => handleToggle(flag)}
              disabled={toggling === flag.key}
              aria-label={`Toggle ${flag.key}`}
              className={`
                relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30
                disabled:opacity-50 disabled:cursor-not-allowed
                ${flag.enabled ? 'bg-primary' : 'bg-outline-variant'}
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 rounded-full bg-white shadow-sm
                  transition-transform duration-200 ease-in-out
                  ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
