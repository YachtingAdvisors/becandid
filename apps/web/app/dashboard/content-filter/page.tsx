'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type FilterLevel = 'off' | 'standard' | 'strict' | 'custom';

interface FilterLog {
  id: string;
  domain: string;
  action: 'blocked' | 'flagged';
  timestamp: string;
  category: string;
}

interface ContentFilterPageData {
  level: FilterLevel;
  blocklist: string[];
  allowlist: string[];
  recent_log: FilterLog[];
  is_teen: boolean;
  guardian_locked: boolean;
}

const LEVEL_OPTIONS: { value: FilterLevel; label: string; desc: string }[] = [
  { value: 'off', label: 'Off', desc: 'No content filtering active' },
  { value: 'standard', label: 'Standard', desc: 'Blocks explicit and harmful content' },
  { value: 'strict', label: 'Strict', desc: 'Blocks explicit, harmful, and age-restricted content' },
  { value: 'custom', label: 'Custom', desc: 'Use your own block and allow lists' },
];

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContentFilterPage() {
  const [data, setData] = useState<ContentFilterPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [newBlockDomain, setNewBlockDomain] = useState('');
  const [newAllowDomain, setNewAllowDomain] = useState('');

  useEffect(() => {
    fetch('/api/content-filter/details')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {
        setFetchError('Failed to load settings. Using defaults.');
        setData({
          level: 'standard',
          blocklist: [],
          allowlist: [],
          recent_log: [],
          is_teen: false,
          guardian_locked: false,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded w-48" />
          <div className="h-40 bg-surface-container-low rounded-3xl" />
        </div>
      </div>
    );
  }

  const level = data?.level ?? 'standard';
  const blocklist = data?.blocklist ?? [];
  const allowlist = data?.allowlist ?? [];
  const recentLog = data?.recent_log ?? [];
  const isTeen = data?.is_teen ?? false;
  const guardianLocked = data?.guardian_locked ?? false;

  const handleAddBlock = () => {
    const domain = newBlockDomain.trim().toLowerCase();
    if (!domain || blocklist.includes(domain)) return;
    setData((prev) =>
      prev ? { ...prev, blocklist: [...prev.blocklist, domain] } : prev
    );
    setNewBlockDomain('');
  };

  const handleRemoveBlock = (domain: string) => {
    setData((prev) =>
      prev ? { ...prev, blocklist: prev.blocklist.filter((d) => d !== domain) } : prev
    );
  };

  const handleAddAllow = () => {
    const domain = newAllowDomain.trim().toLowerCase();
    if (!domain || allowlist.includes(domain)) return;
    setData((prev) =>
      prev ? { ...prev, allowlist: [...prev.allowlist, domain] } : prev
    );
    setNewAllowDomain('');
  };

  const handleRemoveAllow = (domain: string) => {
    setData((prev) =>
      prev ? { ...prev, allowlist: prev.allowlist.filter((d) => d !== domain) } : prev
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Safety</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Content Filter</h1>
        <p className="text-sm text-on-surface-variant font-body">
          Manage content filtering to block harmful or unwanted websites.
        </p>
      </div>

      {fetchError && (
        <div className="bg-error/10 rounded-2xl px-4 py-3 text-xs text-error font-body flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          {fetchError}
        </div>
      )}

      {isTeen && guardianLocked && (
        <div className="bg-tertiary-container/40 rounded-2xl px-4 py-3 text-xs text-on-tertiary-container font-body">
          Content filter settings are managed by your guardian. Contact them to make changes.
        </div>
      )}

      {/* Filter Level */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Filter Level</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={guardianLocked}
              onClick={() =>
                setData((prev) => (prev ? { ...prev, level: opt.value } : prev))
              }
              className={`rounded-2xl px-3 py-3 text-center border transition-all duration-200 ${
                level === opt.value
                  ? 'border-primary bg-primary-container/30 shadow-lg shadow-primary/10'
                  : 'border-outline-variant/50 hover:border-primary/30 hover:shadow-md'
              } ${guardianLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div
                className={`text-sm font-label font-bold ${
                  level === opt.value ? 'text-primary' : 'text-on-surface'
                }`}
              >
                {opt.label}
              </div>
              <div className="text-[10px] text-on-surface-variant font-label mt-1">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Blocklist */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Custom Blocklist</h2>
        {!guardianLocked && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="example.com"
              value={newBlockDomain}
              onChange={(e) => setNewBlockDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
              className="flex-1 px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
            <button
              onClick={handleAddBlock}
              className="px-4 py-2 min-h-[44px] bg-primary text-on-primary text-sm font-label font-medium rounded-xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
            >
              Add
            </button>
          </div>
        )}
        {blocklist.length === 0 ? (
          <p className="text-xs text-on-surface-variant font-body">No blocked domains.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blocklist.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error/5 text-error text-xs font-label font-medium"
              >
                {domain}
                {!guardianLocked && (
                  <button
                    onClick={() => handleRemoveBlock(domain)}
                    className="hover:text-error/70 ml-0.5 cursor-pointer transition-colors duration-200"
                  >
                    {'\u2715'}
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Allowlist */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5 space-y-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">Custom Allowlist</h2>
        {!guardianLocked && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="safe-site.com"
              value={newAllowDomain}
              onChange={(e) => setNewAllowDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAllow()}
              className="flex-1 px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
            <button
              onClick={handleAddAllow}
              className="px-4 py-2 min-h-[44px] bg-primary text-on-primary text-sm font-label font-medium rounded-xl cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200"
            >
              Add
            </button>
          </div>
        )}
        {allowlist.length === 0 ? (
          <p className="text-xs text-on-surface-variant font-body">No allowed domains.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowlist.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-container/40 text-primary text-xs font-label font-medium"
              >
                {domain}
                {!guardianLocked && (
                  <button
                    onClick={() => handleRemoveAllow(domain)}
                    className="hover:text-primary/70 ml-0.5 cursor-pointer transition-colors duration-200"
                  >
                    {'\u2715'}
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent Filter Log */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20">
          <h2 className="font-headline text-lg font-bold text-on-surface">Recent Filter Log</h2>
        </div>
        {recentLog.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
            No items filtered recently.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {recentLog.slice(0, 20).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold ${
                    item.action === 'blocked'
                      ? 'bg-error/10 text-error'
                      : 'bg-tertiary-container text-on-tertiary-container'
                  }`}
                >
                  {item.action}
                </span>
                <span className="text-sm font-body text-on-surface flex-1 truncate">
                  {item.domain}
                </span>
                <span className="text-xs text-on-surface-variant font-label capitalize">
                  {item.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-on-surface-variant font-label">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-on-surface-variant font-body text-center">
        Content filtering powered by AI and curated blocklists.
      </p>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-sm text-primary font-label font-medium hover:underline cursor-pointer transition-colors duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
