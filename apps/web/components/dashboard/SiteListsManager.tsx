'use client';

import { useState, useEffect } from 'react';

interface SiteEntry {
  id: string;
  domain: string;
  list_type: 'whitelist' | 'blacklist';
  added_at: string;
}

type Tab = 'whitelist' | 'blacklist';

export default function SiteListsManager() {
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('whitelist');
  const [domain, setDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/site-lists')
      .then((r) => r.json())
      .then((d) => setSites(d.sites ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = sites.filter((s) => s.list_type === activeTab);

  async function handleAdd() {
    if (!domain.trim()) return;
    setError('');
    setAdding(true);
    try {
      const res = await fetch('/api/site-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), list_type: activeTab }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to add site');
        return;
      }
      // Remove any existing entry for same domain (upsert may have changed list_type)
      setSites((prev) => [
        data.site,
        ...prev.filter((s) => s.domain !== data.site.domain),
      ]);
      setDomain('');
    } catch {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/site-lists?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      console.error('Failed to remove site');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-4 ring-1 ring-outline-variant/10 shadow-sm">
      <div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Site Lists</h2>
        <p className="text-xs text-on-surface-variant font-body mt-0.5">
          Manage your whitelisted and blacklisted sites.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab('whitelist'); setError(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'whitelist'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low/80'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          Whitelist
          <span className="ml-1 opacity-70">
            ({sites.filter((s) => s.list_type === 'whitelist').length})
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('blacklist'); setError(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-label font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'blacklist'
              ? 'bg-error text-on-error shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-low/80'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">block</span>
          Blacklist
          <span className="ml-1 opacity-70">
            ({sites.filter((s) => s.list_type === 'blacklist').length})
          </span>
        </button>
      </div>

      {/* Privacy notice for blacklist */}
      {activeTab === 'blacklist' && (
        <div className="flex items-start gap-2 bg-surface-container-low rounded-xl p-3">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">
            visibility_off
          </span>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Your partner <strong>cannot</strong> see your blacklisted sites. However, they
            will be notified if you remove a site from this list.
          </p>
        </div>
      )}

      {/* Add domain input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            language
          </span>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="example.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 ring-1 ring-outline-variant/10 focus:ring-primary/40 focus:outline-none transition-all duration-200"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !domain.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-label font-semibold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {adding ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-error font-body">{error}</p>
      )}

      {/* Site list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
            {activeTab === 'whitelist' ? 'playlist_add_check' : 'playlist_remove'}
          </span>
          <p className="text-xs text-on-surface-variant font-body mt-2">
            No {activeTab === 'whitelist' ? 'whitelisted' : 'blacklisted'} sites yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((site) => (
            <li
              key={site.id}
              className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 ring-1 ring-outline-variant/5 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
                  {activeTab === 'whitelist' ? 'check_circle' : 'cancel'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-label font-medium text-on-surface truncate">
                    {site.domain}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-body">
                    Added {new Date(site.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(site.id)}
                disabled={removingId === site.id}
                className="ml-2 p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 disabled:opacity-50 transition-all duration-200 cursor-pointer shrink-0"
                title="Remove"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {removingId === site.id ? 'hourglass_empty' : 'delete'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
