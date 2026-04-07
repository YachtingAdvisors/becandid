'use client';

// ============================================================
// components/dashboard/SelfHarmSafetyCard.tsx
//
// Always-visible safety resource card for users with self_harm
// in their goals. Warm rose/pink design — never clinical or
// alarming. Cannot be dismissed or hidden.
// ============================================================

import Link from 'next/link';

interface SelfHarmSafetyCardProps {
  hasPartner: boolean;
}

export default function SelfHarmSafetyCard({ hasPartner }: SelfHarmSafetyCardProps) {
  return (
    <section
      className="rounded-2xl p-6 shadow-md ring-1 ring-rose-200/30"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fce7f3 100%)',
      }}
      role="region"
      aria-label="Safety resources"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
          <span
            className="material-symbols-outlined text-rose-400 text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
        <h2 className="font-headline font-bold text-base text-rose-900">
          Safety Resources
        </h2>
      </div>

      {/* Crisis resources — always visible */}
      <div className="space-y-3 mb-5">
        <a
          href="tel:988"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 ring-1 ring-rose-200/30 hover:bg-white/70 transition-colors"
        >
          <span className="material-symbols-outlined text-rose-500 text-lg">call</span>
          <div className="flex-1">
            <p className="text-sm font-label font-bold text-rose-900">
              988 Suicide &amp; Crisis Lifeline
            </p>
            <p className="text-xs text-rose-700/80 font-body">
              Call or text 988
            </p>
          </div>
          <span className="material-symbols-outlined text-rose-400 text-sm">open_in_new</span>
        </a>

        <a
          href="sms:741741?body=HOME"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 ring-1 ring-rose-200/30 hover:bg-white/70 transition-colors"
        >
          <span className="material-symbols-outlined text-rose-500 text-lg">sms</span>
          <div className="flex-1">
            <p className="text-sm font-label font-bold text-rose-900">
              Crisis Text Line
            </p>
            <p className="text-xs text-rose-700/80 font-body">
              Text HOME to 741741
            </p>
          </div>
          <span className="material-symbols-outlined text-rose-400 text-sm">open_in_new</span>
        </a>

        <a
          href="https://www.iasp.info/resources/Crisis_Centres/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 ring-1 ring-rose-200/30 hover:bg-white/70 transition-colors"
        >
          <span className="material-symbols-outlined text-rose-500 text-lg">language</span>
          <div className="flex-1">
            <p className="text-sm font-label font-bold text-rose-900">
              International Crisis Centres
            </p>
            <p className="text-xs text-rose-700/80 font-body">
              Find local support worldwide
            </p>
          </div>
          <span className="material-symbols-outlined text-rose-400 text-sm">open_in_new</span>
        </a>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/dashboard/conversations"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-label font-medium hover:bg-rose-600 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-base">forum</span>
          Talk to your coach
        </Link>

        {hasPartner && (
          <Link
            href="/dashboard/partner"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 text-rose-800 text-sm font-label font-medium ring-1 ring-rose-200/50 hover:bg-white/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">call</span>
            Call your partner
          </Link>
        )}

        <Link
          href="/dashboard/stringer-journal"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 text-rose-800 text-sm font-label font-medium ring-1 ring-rose-200/50 hover:bg-white/90 transition-colors"
        >
          <span className="material-symbols-outlined text-base">edit_note</span>
          Journal what you&rsquo;re feeling
        </Link>
      </div>

      {/* Encouragement — always visible */}
      <p className="text-xs text-rose-800/70 font-body leading-relaxed text-center">
        You are not alone. These feelings are temporary. Help is available 24/7.
      </p>
    </section>
  );
}
