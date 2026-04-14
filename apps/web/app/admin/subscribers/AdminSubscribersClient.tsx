'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function AdminSubscribersClient() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      const db = createClient();
      const { data, count } = await db
        .from('email_subscribers')
        .select('*', { count: 'exact' })
        .order('subscribed_at', { ascending: false })
        .limit(100);

      setSubscribers(data ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleExport() {
    const csv = [
      'email,source,subscribed_at',
      ...subscribers.map(s => `${s.email},${s.source},${s.subscribed_at}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-headline font-bold text-on-surface">Email Subscribers</h1>
          <p className="text-sm text-on-surface-variant font-body mt-1">
            Blog and lead capture subscribers — {loading ? '...' : `${total} total`}
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-label font-bold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container rounded-2xl p-4">
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Total</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">{loading ? '—' : total}</p>
        </div>
        <div className="bg-surface-container rounded-2xl p-4">
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Blog</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {loading ? '—' : subscribers.filter(s => s.source === 'blog').length}
          </p>
        </div>
        <div className="bg-surface-container rounded-2xl p-4">
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Active</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {loading ? '—' : subscribers.filter(s => !s.unsubscribed_at).length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-on-surface-variant text-sm font-body">Loading...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-surface-container rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">mark_email_read</span>
          <p className="text-sm text-on-surface-variant font-body">No subscribers yet</p>
          <p className="text-xs text-on-surface-variant/60 font-body mt-1">
            Subscribers will appear here when visitors sign up on blog posts.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 font-label font-bold text-on-surface-variant text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-label font-bold text-on-surface-variant text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 font-label font-bold text-on-surface-variant text-xs uppercase tracking-wider">Subscribed</th>
                <th className="text-left px-4 py-3 font-label font-bold text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-b border-outline-variant/50 last:border-0">
                  <td className="px-4 py-3 font-body text-on-surface">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-label font-bold">
                      {s.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-body">
                    {new Date(s.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {s.unsubscribed_at ? (
                      <span className="text-xs text-error font-label">Unsubscribed</span>
                    ) : (
                      <span className="text-xs text-emerald-500 font-label">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
