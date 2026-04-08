'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuickActionFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-30 lg:hidden">
      {/* Action menu */}
      {open && (
        <div className="absolute bottom-16 right-0 flex flex-col items-end gap-2 mb-2">
          <Link
            href="/dashboard/stringer-journal"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Write in Journal
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          </Link>
          <Link
            href="/dashboard/checkins"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Check In
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </Link>
          <Link
            href="/dashboard/focus"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-lg ring-1 ring-outline-variant/20 font-label font-semibold text-sm"
          >
            Focus Board
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
          </Link>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 ${
          open
            ? 'bg-surface-container-lowest text-on-surface rotate-45 ring-1 ring-outline-variant/20'
            : 'bg-primary text-on-primary shadow-primary/30'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
