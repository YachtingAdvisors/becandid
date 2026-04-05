'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useSWR from 'swr';
import type { FoundationalMotivator, MotivatorQuote } from '@be-candid/shared';
import { getQuotesForMotivator, MR_ROGERS_QUOTE } from '@be-candid/shared';

/* ── Gradient backgrounds by motivator ───────────────────── */
const MOTIVATOR_GRADIENTS: Record<string, string> = {
  spiritual: 'from-amber-50/80 via-yellow-50/40 to-orange-50/30',
  psychological: 'from-sky-50/80 via-blue-50/40 to-indigo-50/30',
  relational: 'from-rose-50/80 via-pink-50/40 to-fuchsia-50/30',
  general: 'from-slate-50/60 via-stone-50/40 to-zinc-50/30',
};

interface QuoteCarouselProps {
  motivator?: FoundationalMotivator | null;
  userId?: string;
}

export default function QuoteCarousel({ motivator, userId }: QuoteCarouselProps) {
  const quotes = useMemo(() => {
    const all = getQuotesForMotivator(motivator);
    // Limit to a reasonable carousel size
    return all.slice(0, 12);
  }, [motivator]);

  const [index, setIndex] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  // Touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuote = quotes[index] ?? MR_ROGERS_QUOTE;
  const gradientKey = currentQuote.motivator ?? 'general';
  const gradient = MOTIVATOR_GRADIENTS[gradientKey] ?? MOTIVATOR_GRADIENTS.general;

  // Fetch favorites with SWR
  const { data: favData, mutate: mutateFavs } = useSWR<{ favorites: any[] }>('/api/quotes/favorites');
  const favorites = useMemo(() => {
    const favTexts = (favData?.favorites ?? []).map((f: any) => f.quote_text);
    return new Set(favTexts);
  }, [favData]);

  // Auto-advance every 15 seconds
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex(prev => (prev + 1) % quotes.length);
    }, 15000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, quotes.length]);

  const pauseAndResume = useCallback(() => {
    setPaused(true);
    // Resume after 30 seconds of inactivity
    const timeout = setTimeout(() => setPaused(false), 30000);
    return () => clearTimeout(timeout);
  }, []);

  const goTo = useCallback((newIndex: number) => {
    setIndex(((newIndex % quotes.length) + quotes.length) % quotes.length);
    pauseAndResume();
  }, [quotes.length, pauseAndResume]);

  const goNext = useCallback(() => goTo(index + 1), [index, goTo]);
  const goPrev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Touch events for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  // Toggle favorite
  const toggleFavorite = useCallback(async () => {
    if (toggling) return;
    setToggling(true);
    const isFav = favorites.has(currentQuote.text);
    try {
      if (isFav) {
        await fetch('/api/quotes/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote_text: currentQuote.text }),
        });
      } else {
        await fetch('/api/quotes/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote_text: currentQuote.text, quote_author: currentQuote.author }),
        });
      }
      mutateFavs();
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }, [toggling, favorites, currentQuote, mutateFavs]);

  // Copy to clipboard
  const shareQuote = useCallback(async () => {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard');
    } catch {
      setToast('Could not copy');
    }
    setTimeout(() => setToast(null), 2500);
    pauseAndResume();
  }, [currentQuote, pauseAndResume]);

  const isFavorited = favorites.has(currentQuote.text);

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-br ${gradient} bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden select-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Quote content */}
      <div className="px-6 pt-6 pb-4 min-h-[180px] flex flex-col justify-center">
        <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-medium mb-3">
          Quote of the Day
        </p>

        <div className="flex gap-4">
          {/* Author image */}
          {currentQuote.image && (
            <div className="shrink-0 self-start mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQuote.image}
                alt={currentQuote.author}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container shadow-sm"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-body text-base text-on-surface italic leading-relaxed">
              &ldquo;{currentQuote.text}&rdquo;
            </p>
            <div className="mt-3">
              <p className="font-label text-sm text-on-surface-variant font-medium">
                &mdash; {currentQuote.author}
              </p>
              {currentQuote.ref && (
                <p className="font-label text-[10px] text-on-surface-variant/60 mt-0.5">
                  {currentQuote.ref}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: actions + navigation */}
      <div className="px-6 pb-4 flex items-center justify-between">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFavorite}
            disabled={toggling}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span
              className={`material-symbols-outlined text-xl transition-colors ${isFavorited ? 'text-primary' : 'text-on-surface-variant/50'}`}
              style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
          <button
            onClick={shareQuote}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label="Copy quote to clipboard"
          >
            <span className="material-symbols-outlined text-xl text-on-surface-variant/50">content_copy</span>
          </button>
        </div>

        {/* Navigation arrows + dots */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer focus:outline-none"
            aria-label="Previous quote"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_left</span>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                  i === index
                    ? 'w-4 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-on-surface-variant/20 hover:bg-on-surface-variant/40'
                }`}
                aria-label={`Go to quote ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer focus:outline-none"
            aria-label="Next quote"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-inverse-surface text-inverse-on-surface rounded-full shadow-lg font-label text-xs font-medium whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
