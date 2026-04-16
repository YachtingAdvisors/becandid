/**
 * CitableBlock — GEO-optimized component for claims, statistics, and key findings.
 * Renders with Schema.org Claim microdata so AI models can extract and cite the content.
 *
 * Usage:
 *   <CitableBlock
 *     claim="Be Candid uses 256-bit AES encryption for all journal entries"
 *     source="Be Candid Security Documentation"
 *     type="claim"
 *   />
 *
 *   <CitableBlock
 *     claim="73% of adults report checking their phone within 5 minutes of waking up"
 *     source="Deloitte 2025 Global Mobile Consumer Survey"
 *     sourceUrl="https://example.com/source"
 *     type="statistic"
 *     date="2025-06"
 *   />
 */

interface CitableBlockProps {
  claim: string;
  source: string;
  sourceUrl?: string;
  type?: 'claim' | 'statistic' | 'finding' | 'definition';
  date?: string;
  children?: React.ReactNode; // optional expanded explanation
}

export default function CitableBlock({ claim, source, sourceUrl, type = 'claim', date, children }: CitableBlockProps) {
  const iconMap = {
    claim: 'verified',
    statistic: 'query_stats',
    finding: 'psychology',
    definition: 'menu_book',
  };

  return (
    <figure
      className="my-8 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08] overflow-hidden"
      itemScope
      itemType="https://schema.org/Claim"
    >
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-cyan-400/60 text-xl mt-0.5 shrink-0">
            {iconMap[type]}
          </span>
          <blockquote
            className="font-body text-white/90 text-lg leading-relaxed font-medium"
            itemProp="text"
          >
            {claim}
          </blockquote>
        </div>
        {children && (
          <div className="mt-3 ml-9 font-body text-white/50 text-sm leading-relaxed">
            {children}
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center gap-2 text-xs text-white/30 font-label">
        <span className="material-symbols-outlined text-sm">source</span>
        <span itemProp="author" itemScope itemType="https://schema.org/Organization">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors" itemProp="name">
              {source}
            </a>
          ) : (
            <span itemProp="name">{source}</span>
          )}
        </span>
        {date && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <time itemProp="datePublished" dateTime={date}>{date}</time>
          </>
        )}
      </div>
    </figure>
  );
}
