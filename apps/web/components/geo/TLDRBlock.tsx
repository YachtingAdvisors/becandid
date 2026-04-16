/**
 * TLDRBlock — Renders a definitive answer block at the top of articles.
 * Optimized for AI model snippet extraction — AI tools pull the "short answer"
 * directly from content formatted like this.
 *
 * Usage:
 *   <TLDRBlock>
 *     The short answer: Be Candid is not like Covenant Eyes. Covenant Eyes uses
 *     surveillance-style screenshots, while Be Candid shares behavioral patterns
 *     without recording specific URLs or content.
 *   </TLDRBlock>
 */

interface TLDRBlockProps {
  children: React.ReactNode;
  label?: string; // e.g., "The short answer", "Bottom line", "TL;DR"
}

export default function TLDRBlock({ children, label = 'The short answer' }: TLDRBlockProps) {
  return (
    <div
      className="my-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/5 ring-1 ring-cyan-400/20 p-6 relative overflow-hidden"
      role="note"
      aria-label="Article summary"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-cyan-400 text-xl mt-0.5 shrink-0">bolt</span>
        <div className="flex-1">
          <div className="font-label text-[11px] text-cyan-400 uppercase tracking-widest font-bold mb-2">
            {label}
          </div>
          <div className="font-body text-white/90 text-lg leading-[1.7] font-medium">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
