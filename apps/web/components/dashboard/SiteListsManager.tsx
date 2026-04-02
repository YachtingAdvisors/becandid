'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────

interface SiteEntry {
  id: string;
  domain: string;
  list_type: 'whitelist' | 'blacklist';
  added_at: string;
}

interface TrackedSite {
  domain: string;
  category: string;
  count: number;
  last_visit: string;
  list_type: 'whitelist' | 'blacklist' | null;
}

type ListType = 'whitelist' | 'blacklist';

// ─── Category helpers ───────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  pornography:      { bg: 'bg-red-500/20',    text: 'text-red-400' },
  sexting:          { bg: 'bg-red-500/20',    text: 'text-red-400' },
  gambling:         { bg: 'bg-red-500/20',    text: 'text-red-400' },
  sports_betting:   { bg: 'bg-red-500/20',    text: 'text-red-400' },
  day_trading:      { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  dating_apps:      { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  alcohol_drugs:    { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  vaping_tobacco:   { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  eating_disorder:  { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  body_checking:    { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  rage_content:     { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  social_media:     { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  impulse_shopping: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  binge_watching:   { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  gaming:           { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
};

function categoryBadge(category: string) {
  const colors = CATEGORY_COLORS[category] ?? { bg: 'bg-surface-container-low', text: 'text-on-surface-variant' };
  const label = category.replace(/_/g, ' ');
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-label font-semibold capitalize ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

// ─── Loading skeleton ───────────────────────────────────────

function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-surface-container-low animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────

export default function SiteListsManager() {
  // Data state
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [tracked, setTracked] = useState<TrackedSite[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag state
  const [dragDomain, setDragDomain] = useState<string | null>(null);
  const [dragCategory, setDragCategory] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<ListType | null>(null);

  // Mobile tap-to-select
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  // Manual add
  const [manualDomain, setManualDomain] = useState('');
  const [manualListType, setManualListType] = useState<ListType>('blacklist');
  const [adding, setAdding] = useState(false);

  // Removing
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Error
  const [error, setError] = useState('');

  // ── Fetch data ──────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [sitesRes, trackedRes] = await Promise.all([
        fetch('/api/site-lists'),
        fetch('/api/site-lists/tracked'),
      ]);
      const [sitesData, trackedData] = await Promise.all([
        sitesRes.json(),
        trackedRes.json(),
      ]);
      setSites(sitesData.sites ?? []);
      setTracked(trackedData.tracked ?? []);
    } catch {
      setError('Failed to load site data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived data ────────────────────────────────────────

  const uncategorized = tracked.filter(t => t.list_type === null);
  const whitelisted = sites.filter(s => s.list_type === 'whitelist');
  const blacklisted = sites.filter(s => s.list_type === 'blacklist');

  // ── Add site to list ────────────────────────────────────

  async function addToList(domain: string, listType: ListType) {
    setError('');
    try {
      const res = await fetch('/api/site-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, list_type: listType }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to add site');
        return;
      }
      await fetchData();
    } catch {
      setError('Network error');
    }
  }

  // ── Remove site ─────────────────────────────────────────

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/site-lists?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError('Failed to remove site');
    } finally {
      setRemovingId(null);
    }
  }

  // ── Manual add ──────────────────────────────────────────

  async function handleManualAdd() {
    if (!manualDomain.trim()) return;
    setAdding(true);
    await addToList(manualDomain.trim(), manualListType);
    setManualDomain('');
    setAdding(false);
  }

  // ── Drag handlers ───────────────────────────────────────

  function onDragStart(e: React.DragEvent, domain: string, category: string) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ domain, category }));
    e.dataTransfer.effectAllowed = 'move';
    setDragDomain(domain);
    setDragCategory(category);
  }

  function onDragEnd() {
    setDragDomain(null);
    setDragCategory(null);
    setDragOverZone(null);
  }

  function onDragOver(e: React.DragEvent, zone: ListType) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zone);
  }

  function onDragLeave(zone: ListType) {
    if (dragOverZone === zone) setDragOverZone(null);
  }

  async function onDrop(e: React.DragEvent, zone: ListType) {
    e.preventDefault();
    setDragOverZone(null);
    try {
      const raw = e.dataTransfer.getData('text/plain');
      const { domain } = JSON.parse(raw) as { domain: string; category: string };
      if (domain) await addToList(domain, zone);
    } catch {
      setError('Drop failed');
    }
    setDragDomain(null);
    setDragCategory(null);
  }

  // ── Mobile tap-to-select ────────────────────────────────

  function handleTapSelect(domain: string) {
    setSelectedDomain(prev => (prev === domain ? null : domain));
  }

  async function handleMobileAssign(listType: ListType) {
    if (!selectedDomain) return;
    await addToList(selectedDomain, listType);
    setSelectedDomain(null);
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-5 ring-1 ring-outline-variant/10 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Site Lists</h2>
        <p className="text-xs text-on-surface-variant font-body mt-0.5">
          Drag tracked sites into a list, or add domains manually.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="bg-surface-container-low rounded-2xl p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-green-400">verified</span>
          <p className="text-xs text-on-surface-variant font-body">
            Whitelisted sites are <strong className="text-on-surface">visible</strong> to your partner
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">lock</span>
          <p className="text-xs text-on-surface-variant font-body">
            Blacklisted sites are <strong className="text-on-surface">private</strong> — your partner cannot see these
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-error font-body">{error}</p>
      )}

      {loading ? (
        <Skeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Left: Tracked Sites ──────────────────────── */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-label font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">monitoring</span>
                Tracked Sites
              </h3>
              <p className="text-[10px] text-on-surface-variant font-body mt-0.5">
                Most questionable sites appear first. Drag to a list or tap to assign.
              </p>
            </div>

            {uncategorized.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-surface-container-low ring-1 ring-outline-variant/5">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
                  playlist_add_check
                </span>
                <p className="text-xs text-on-surface-variant font-body mt-2">
                  All tracked sites are categorized.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {uncategorized.map((site) => (
                  <li
                    key={site.domain}
                    draggable
                    onDragStart={(e) => onDragStart(e, site.domain, site.category)}
                    onDragEnd={onDragEnd}
                    onClick={() => handleTapSelect(site.domain)}
                    className={`flex items-center justify-between bg-surface-container-low rounded-xl px-3 py-2.5 ring-1 transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                      dragDomain === site.domain
                        ? 'ring-primary/40 opacity-50 scale-95'
                        : selectedDomain === site.domain
                          ? 'ring-primary/60 bg-primary/5'
                          : 'ring-outline-variant/5 hover:ring-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">
                        drag_indicator
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-label font-medium text-on-surface truncate">
                          {site.domain}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {categoryBadge(site.category)}
                          <span className="text-[10px] text-on-surface-variant font-body">
                            {site.count} visit{site.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile assign buttons */}
            {selectedDomain && (
              <div className="flex gap-2 lg:hidden">
                <button
                  onClick={() => handleMobileAssign('whitelist')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-label font-semibold bg-green-500/15 text-green-400 ring-1 ring-green-500/20 hover:bg-green-500/25 transition-all duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Whitelist
                </button>
                <button
                  onClick={() => handleMobileAssign('blacklist')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-label font-semibold bg-red-500/15 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/25 transition-all duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Blacklist
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Drop Zones ────────────────────────── */}
          <div className="space-y-4">
            {/* Whitelist drop zone */}
            <div
              onDragOver={(e) => onDragOver(e, 'whitelist')}
              onDragLeave={() => onDragLeave('whitelist')}
              onDrop={(e) => onDrop(e, 'whitelist')}
              className={`rounded-2xl p-4 ring-1 transition-all duration-200 min-h-[140px] ${
                dragOverZone === 'whitelist'
                  ? 'bg-green-500/10 ring-green-500/40 scale-[1.01]'
                  : 'bg-green-500/5 ring-green-500/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-green-400">verified</span>
                <div>
                  <h3 className="text-sm font-label font-semibold text-on-surface">Whitelist</h3>
                  <p className="text-[10px] text-on-surface-variant font-body">
                    Safe sites — visible to partner
                  </p>
                </div>
                <span className="ml-auto text-[10px] text-on-surface-variant font-body">
                  {whitelisted.length} site{whitelisted.length !== 1 ? 's' : ''}
                </span>
              </div>

              {whitelisted.length === 0 && !dragDomain ? (
                <div className="flex items-center justify-center py-4 border-2 border-dashed border-green-500/15 rounded-xl">
                  <p className="text-[11px] text-on-surface-variant/60 font-body">
                    Drop sites here
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {whitelisted.map((site) => (
                    <li
                      key={site.id}
                      className="flex items-center justify-between bg-surface-container-lowest/60 rounded-xl px-3 py-2 ring-1 ring-green-500/5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-green-400 shrink-0">
                          check_circle
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
                        className="ml-2 p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 disabled:opacity-50 transition-all duration-200 cursor-pointer shrink-0"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {removingId === site.id ? 'hourglass_empty' : 'close'}
                        </span>
                      </button>
                    </li>
                  ))}
                  {/* Show placeholder when dragging over */}
                  {dragDomain && dragOverZone === 'whitelist' && (
                    <li className="flex items-center gap-2 bg-green-500/10 rounded-xl px-3 py-2 ring-1 ring-green-500/20 border-2 border-dashed border-green-500/30">
                      <span className="material-symbols-outlined text-[16px] text-green-400">add_circle</span>
                      <p className="text-sm font-label font-medium text-green-400 truncate">
                        {dragDomain}
                      </p>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Blacklist drop zone */}
            <div
              onDragOver={(e) => onDragOver(e, 'blacklist')}
              onDragLeave={() => onDragLeave('blacklist')}
              onDrop={(e) => onDrop(e, 'blacklist')}
              className={`rounded-2xl p-4 ring-1 transition-all duration-200 min-h-[140px] ${
                dragOverZone === 'blacklist'
                  ? 'bg-red-500/10 ring-red-500/40 scale-[1.01]'
                  : 'bg-red-500/5 ring-red-500/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-red-400">lock</span>
                <div>
                  <h3 className="text-sm font-label font-semibold text-on-surface">Blacklist</h3>
                  <p className="text-[10px] text-on-surface-variant font-body">
                    Sites to avoid — private
                  </p>
                </div>
                <span className="ml-auto text-[10px] text-on-surface-variant font-body">
                  {blacklisted.length} site{blacklisted.length !== 1 ? 's' : ''}
                </span>
              </div>

              {blacklisted.length === 0 && !dragDomain ? (
                <div className="flex items-center justify-center py-4 border-2 border-dashed border-red-500/15 rounded-xl">
                  <p className="text-[11px] text-on-surface-variant/60 font-body">
                    Drop sites here
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {blacklisted.map((site) => (
                    <li
                      key={site.id}
                      className="flex items-center justify-between bg-surface-container-lowest/60 rounded-xl px-3 py-2 ring-1 ring-red-500/5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">
                          block
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
                        className="ml-2 p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 disabled:opacity-50 transition-all duration-200 cursor-pointer shrink-0"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {removingId === site.id ? 'hourglass_empty' : 'close'}
                        </span>
                      </button>
                    </li>
                  ))}
                  {/* Show placeholder when dragging over */}
                  {dragDomain && dragOverZone === 'blacklist' && (
                    <li className="flex items-center gap-2 bg-red-500/10 rounded-xl px-3 py-2 ring-1 ring-red-500/20 border-2 border-dashed border-red-500/30">
                      <span className="material-symbols-outlined text-[16px] text-red-400">add_circle</span>
                      <p className="text-sm font-label font-medium text-red-400 truncate">
                        {dragDomain}
                      </p>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Manual add fallback ────────────────────────────── */}
      <div className="border-t border-outline-variant/10 pt-4">
        <p className="text-[10px] text-on-surface-variant font-body mb-2">
          Add a domain manually
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              language
            </span>
            <input
              type="text"
              value={manualDomain}
              onChange={(e) => setManualDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
              placeholder="example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 ring-1 ring-outline-variant/10 focus:ring-primary/40 focus:outline-none transition-all duration-200"
            />
          </div>
          <select
            value={manualListType}
            onChange={(e) => setManualListType(e.target.value as ListType)}
            className="px-3 py-2.5 rounded-xl bg-surface-container-low text-xs font-label font-semibold text-on-surface ring-1 ring-outline-variant/10 focus:ring-primary/40 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="blacklist">Blacklist</option>
            <option value="whitelist">Whitelist</option>
          </select>
          <button
            onClick={handleManualAdd}
            disabled={adding || !manualDomain.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-label font-semibold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </section>
  );
}
