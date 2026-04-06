'use client';

// ============================================================
// FirstVisitCoach — Auto-open Conversation Coach on first visit
//
// When the dashboard is loaded with ?first=true, this component
// renders a welcome card that opens the Conversation Coach with
// a warm opening message to reduce time-to-first-value.
// ============================================================

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ConversationCoach = dynamic(
  () => import('@/components/dashboard/ConversationCoach'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-64 rounded-2xl" /> },
);

export default function FirstVisitCoach() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFirst = searchParams.get('first') === 'true';
  const [showCoach, setShowCoach] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isFirst && !dismissed) {
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setShowCoach(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isFirst, dismissed]);

  if (!isFirst || dismissed) return null;

  if (showCoach) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-primary/20 shadow-lg overflow-hidden">
        <div className="px-5 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h3 className="font-headline font-bold text-sm text-on-surface">Welcome Conversation</h3>
          </div>
          <button
            onClick={() => {
              setDismissed(true);
              setShowCoach(false);
              // Clean the URL param
              const params = new URLSearchParams(searchParams.toString());
              params.delete('first');
              const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
              router.replace(newUrl);
            }}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1 rounded-full hover:bg-surface-container"
            aria-label="Close welcome conversation"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <ConversationCoach
          onEndSession={() => {
            setDismissed(true);
            setShowCoach(false);
          }}
        />
      </div>
    );
  }

  // Welcome card before coach opens
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 ring-1 ring-primary/20 shadow-lg animate-fade-slide text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
      </div>
      <div>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-1">Welcome to Be Candid</h2>
        <p className="text-sm text-on-surface-variant font-body leading-relaxed">
          You just took the first step. The Conversation Coach is ready when you are.
        </p>
      </div>
      <p className="text-xs text-on-surface-variant/70 font-body italic">Loading your first conversation...</p>
    </div>
  );
}
