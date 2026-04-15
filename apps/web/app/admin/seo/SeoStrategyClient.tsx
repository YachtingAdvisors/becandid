'use client';

import { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface ArticleMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PersonalizeTag {
  priority: 'critical' | 'recommended';
  reason: string;
}

interface SeoArticle {
  slug: string;
  title: string;
  track: 'A' | 'B';
  status: 'published' | 'draft';
  generated_at: string;
  days_live: number;
  description: string;
  keywords: string[];
  tags: string[];
  metrics: ArticleMetrics | null;
  personalization: PersonalizeTag | null;
}

interface Totals {
  clicks_30d: number;
  impressions_30d: number;
  avg_position: number | null;
  articles_published: number;
  articles_draft: number;
  articles_needing_attention: number;
}

interface TopQuery {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
}

interface SeoData {
  articles: SeoArticle[];
  totals: Totals;
  top_queries: TopQuery[];
  gsc_available: boolean;
}

type SortKey = 'clicks' | 'impressions' | 'position' | 'date';

// ─── Main Component ──────────────────────────────────────────

export default function SeoStrategyClient() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortKey>('clicks');
  const [trackFilter, setTrackFilter] = useState<'all' | 'A' | 'B'>('all');
  const [showOnlyAttention, setShowOnlyAttention] = useState(false);

  useEffect(() => {
    fetch('/api/admin/seo')
      .then(r => { if (!r.ok) throw new Error('Failed to load SEO data'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error || !data) return <ErrorState message={error} />;

  const { articles, totals, top_queries, gsc_available } = data;

  // Filter
  let filtered = articles.filter(a => {
    if (trackFilter !== 'all' && a.track !== trackFilter) return false;
    if (showOnlyAttention && a.personalization?.priority !== 'critical') return false;
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'date') return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime();
    if (sort === 'clicks') return (b.metrics?.clicks ?? -1) - (a.metrics?.clicks ?? -1);
    if (sort === 'impressions') return (b.metrics?.impressions ?? -1) - (a.metrics?.impressions ?? -1);
    if (sort === 'position') {
      // Lower position = better; no data goes last
      const pa = a.metrics?.position ?? 999;
      const pb = b.metrics?.position ?? 999;
      return pa - pb;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* GSC warning banner */}
      {!gsc_available && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-sm font-label font-semibold text-amber-800">Search Console unavailable</p>
            <p className="text-xs text-amber-700 font-body mt-0.5">
              Add the service account as a verified user in Google Search Console, or set <code className="bg-amber-100 px-1 rounded">GSC_SITE_URL</code> to your verified property. Content data is shown below without performance metrics.
            </p>
          </div>
        </div>
      )}

      {/* Stat summary row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Clicks (30d)" value={totals.clicks_30d.toLocaleString()} icon="ads_click" ok />
        <StatCard label="Impressions (30d)" value={totals.impressions_30d.toLocaleString()} icon="visibility" ok />
        <StatCard
          label="Avg Position"
          value={totals.avg_position ? `#${totals.avg_position}` : '—'}
          icon="leaderboard"
          ok={totals.avg_position !== null && totals.avg_position <= 20}
        />
        <StatCard label="Published" value={totals.articles_published.toString()} icon="check_circle" ok />
        <StatCard
          label="Needs Your Voice"
          value={totals.articles_needing_attention.toString()}
          icon="edit_note"
          ok={totals.articles_needing_attention === 0}
          highlight={totals.articles_needing_attention > 0}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider mr-1">Sort:</span>
        {(['clicks', 'impressions', 'position', 'date'] as SortKey[]).map(k => (
          <button
            key={k}
            onClick={() => setSort(k)}
            className={`text-xs font-label font-semibold px-3 py-1.5 rounded-full transition-colors ${
              sort === k
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {k === 'clicks' ? 'Clicks' : k === 'impressions' ? 'Impressions' : k === 'position' ? 'Position' : 'Newest'}
          </button>
        ))}
        <div className="w-px h-4 bg-outline-variant mx-1" />
        {(['all', 'A', 'B'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTrackFilter(t)}
            className={`text-xs font-label font-semibold px-3 py-1.5 rounded-full transition-colors ${
              trackFilter === t
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {t === 'all' ? 'All tracks' : t === 'A' ? 'Track A — Competitor' : 'Track B — Pillar'}
          </button>
        ))}
        <div className="w-px h-4 bg-outline-variant mx-1" />
        <button
          onClick={() => setShowOnlyAttention(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-label font-semibold px-3 py-1.5 rounded-full transition-colors ${
            showOnlyAttention
              ? 'bg-amber-500 text-white'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-sm">edit_note</span>
          Needs personalization
        </button>
      </div>

      {/* Article cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant font-body text-sm">
          No articles match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(article => (
            <ArticleCard key={article.slug} article={article} gscAvailable={gsc_available} />
          ))}
        </div>
      )}

      {/* Top queries */}
      {gsc_available && top_queries.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
          <h2 className="font-headline text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">search</span>
            Top Queries (30d)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-label font-medium text-on-surface-variant border-b border-outline-variant">
                  <th className="pb-2 pr-4">Query</th>
                  <th className="pb-2 pr-4 text-right">Clicks</th>
                  <th className="pb-2 pr-4 text-right">Impressions</th>
                  <th className="pb-2 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {top_queries.map(q => (
                  <tr key={q.query} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-2 pr-4 font-body text-on-surface">{q.query}</td>
                    <td className="py-2 pr-4 text-right font-label font-semibold text-on-surface">{q.clicks}</td>
                    <td className="py-2 pr-4 text-right font-label text-on-surface-variant">{q.impressions.toLocaleString()}</td>
                    <td className="py-2 text-right">
                      <PositionBadge position={q.position} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────

function ArticleCard({ article, gscAvailable }: { article: SeoArticle; gscAvailable: boolean }) {
  const { slug, title, track, status, days_live, keywords, metrics, personalization } = article;
  const url = `https://becandid.io/blog/${slug}`;
  const hasMetrics = metrics !== null && metrics.impressions > 0;

  return (
    <div className={`bg-surface-container-lowest rounded-3xl border p-5 space-y-4 transition-colors ${
      personalization?.priority === 'critical'
        ? 'border-amber-300'
        : 'border-outline-variant'
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <TrackBadge track={track} />
          <StatusBadge status={status} />
          <span className="text-xs font-label text-on-surface-variant">
            {days_live === 0 ? 'Today' : `${days_live}d live`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {personalization?.priority === 'critical' && (
            <PersonalizeBadge priority="critical" />
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-label font-medium text-primary hover:underline"
          >
            View
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-headline text-sm font-bold text-on-surface leading-snug">{title}</h3>
        {keywords.length > 0 && (
          <p className="text-xs font-body text-on-surface-variant mt-1 line-clamp-1">
            {keywords.join(' · ')}
          </p>
        )}
      </div>

      {/* Metrics row */}
      {gscAvailable && (
        <div className="grid grid-cols-4 gap-2">
          {hasMetrics ? (
            <>
              <MetricCell label="Clicks" value={metrics!.clicks.toLocaleString()} good={metrics!.clicks > 10} />
              <MetricCell label="Impressions" value={metrics!.impressions.toLocaleString()} />
              <MetricCell
                label="CTR"
                value={`${(metrics!.ctr * 100).toFixed(1)}%`}
                good={metrics!.ctr >= 0.03}
                warn={metrics!.ctr < 0.02 && metrics!.impressions > 50}
              />
              <div className="rounded-xl bg-surface-container p-3 text-center">
                <p className="text-xs font-label text-on-surface-variant mb-1">Position</p>
                <PositionBadge position={metrics!.position} large />
              </div>
            </>
          ) : (
            <div className="col-span-4 flex items-center gap-2 rounded-xl bg-surface-container p-3">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">hourglass_empty</span>
              <p className="text-xs font-body text-on-surface-variant">
                {days_live < 4
                  ? `No data yet — Google typically picks up new content within 3–5 days`
                  : `No impressions recorded in the last 30 days`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Personalization callout */}
      {personalization && (
        <div className={`flex items-start gap-2.5 rounded-2xl p-3 ${
          personalization.priority === 'critical'
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
            personalization.priority === 'critical' ? 'text-amber-600' : 'text-blue-500'
          }`}>
            edit_note
          </span>
          <div>
            <p className={`text-xs font-label font-semibold ${
              personalization.priority === 'critical' ? 'text-amber-800' : 'text-blue-800'
            }`}>
              {personalization.priority === 'critical' ? 'Human voice recommended' : 'Consider personalizing'}
            </p>
            <p className={`text-xs font-body mt-0.5 ${
              personalization.priority === 'critical' ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {personalization.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function StatCard({
  label, value, icon, ok, highlight,
}: {
  label: string; value: string; icon: string; ok: boolean; highlight?: boolean;
}) {
  return (
    <div className={`rounded-3xl border p-4 space-y-2 ${
      highlight ? 'bg-amber-50 border-amber-200' : 'bg-surface-container-lowest border-outline-variant'
    }`}>
      <div className="flex items-center gap-1.5">
        <span className={`material-symbols-outlined text-lg ${
          highlight ? 'text-amber-600' : ok ? 'text-primary' : 'text-error'
        }`}>{icon}</span>
        <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider leading-none">{label}</span>
      </div>
      <p className={`font-headline text-xl font-extrabold ${
        highlight ? 'text-amber-800' : ok ? 'text-on-surface' : 'text-error'
      }`}>{value}</p>
    </div>
  );
}

function TrackBadge({ track }: { track: 'A' | 'B' }) {
  return (
    <span className={`text-xs font-label font-semibold px-2.5 py-0.5 rounded-full ${
      track === 'A'
        ? 'bg-blue-500/10 text-blue-700'
        : 'bg-purple-500/10 text-purple-700'
    }`}>
      {track === 'A' ? 'Competitor' : 'Pillar'}
    </span>
  );
}

function StatusBadge({ status }: { status: 'published' | 'draft' }) {
  return (
    <span className={`text-xs font-label font-semibold px-2.5 py-0.5 rounded-full ${
      status === 'published'
        ? 'bg-green-500/10 text-green-700'
        : 'bg-outline-variant/20 text-on-surface-variant'
    }`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

function PersonalizeBadge({ priority }: { priority: 'critical' | 'recommended' }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-label font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800">
      <span className="material-symbols-outlined text-sm">edit_note</span>
      Needs your voice
    </span>
  );
}

function MetricCell({ label, value, good, warn }: { label: string; value: string; good?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-container p-3 text-center">
      <p className="text-xs font-label text-on-surface-variant mb-1">{label}</p>
      <p className={`font-headline text-base font-bold ${
        warn ? 'text-error' : good ? 'text-green-600' : 'text-on-surface'
      }`}>
        {value}
      </p>
    </div>
  );
}

function PositionBadge({ position, large }: { position: number; large?: boolean }) {
  const pos = Math.round(position * 10) / 10;
  const color =
    pos <= 5 ? 'text-green-600' :
    pos <= 15 ? 'text-amber-600' :
    'text-error';

  return (
    <span className={`font-headline font-bold ${large ? 'text-base' : 'text-sm'} ${color}`}>
      #{pos}
    </span>
  );
}

// ─── Loading / Error states ───────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-24 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton-shimmer h-8 rounded-full w-96" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-40 rounded-3xl" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-error/10 rounded-3xl p-6 text-center">
      <span className="material-symbols-outlined text-3xl text-error mb-2 block">error</span>
      <p className="text-sm text-error font-body">{message || 'Failed to load SEO data'}</p>
    </div>
  );
}
