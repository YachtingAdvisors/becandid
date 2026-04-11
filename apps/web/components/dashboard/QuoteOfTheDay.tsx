'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FoundationalMotivator, MotivatorQuote } from '@be-candid/shared';
import { getQuoteOfTheDay, MR_ROGERS_QUOTE } from '@be-candid/shared';

interface Favorite {
  id: string;
  quote_text: string;
  quote_author: string;
  created_at: string;
}

export default function QuoteOfTheDay({
  motivator,
}: {
  motivator?: FoundationalMotivator | null;
}) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [favIndex, setFavIndex] = useState(0);
  const [toggling, setToggling] = useState(false);

  // Pick today's quote — deterministic so it stays stable across re-renders
  const quote: MotivatorQuote = useMemo(() => {
    // New users with no motivator get the Mr. Rogers quote
    if (!motivator) return MR_ROGERS_QUOTE;
    return getQuoteOfTheDay(motivator);
  }, [motivator]);

  // Fetch favorites on mount
  useEffect(() => {
    fetch('/api/quotes/favorites')
      .then(r => r.json())
      .then(d => setFavorites(d.favorites ?? []))
      .catch(() => {});
  }, []);

  // The displayed quote: either today's QOTD or a favorite
  const displayQuote = useMemo(() => {
    if (filterFavorites && favorites.length > 0) {
      const fav = favorites[favIndex % favorites.length];
      return {
        text: fav.quote_text,
        author: fav.quote_author,
        ref: '',
        motivator: 'general' as FoundationalMotivator,
        // Check if this favorite IS the Mr. Rogers quote to show photo
        image: fav.quote_text === MR_ROGERS_QUOTE.text ? MR_ROGERS_QUOTE.image : undefined,
      };
    }
    return quote;
  }, [filterFavorites, favorites, favIndex, quote]);

  const isFavorited = favorites.some(f => f.quote_text === displayQuote.text);

  const toggleFavorite = useCallback(async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (isFavorited) {
        await fetch('/api/quotes/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote_text: displayQuote.text }),
        });
        setFavorites(prev => prev.filter(f => f.quote_text !== displayQuote.text));
      } else {
        await fetch('/api/quotes/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quote_text: displayQuote.text, quote_author: displayQuote.author }),
        });
        setFavorites(prev => [
          { id: 'temp', quote_text: displayQuote.text, quote_author: displayQuote.author, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }, [isFavorited, displayQuote, toggling]);

  const removeFavorite = useCallback(async (quoteText: string) => {
    try {
      await fetch('/api/quotes/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_text: quoteText }),
      });
      setFavorites(prev => prev.filter(f => f.quote_text !== quoteText));
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] p-8 overflow-hidden">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-headline text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {filterFavorites ? 'Favorite Quotes' : 'Quote of the Day'}
        </p>
        {favorites.length > 0 && (
          <button
            onClick={() => {
              setFilterFavorites(!filterFavorites);
              setFavIndex(0);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-colors duration-300 cursor-pointer ${
              filterFavorites
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', fontVariationSettings: filterFavorites ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {filterFavorites ? 'Show Today' : `Favorites (${favorites.length})`}
          </button>
        )}
      </div>

      {/* Quote content */}
      <div className="flex gap-4">
        {/* Optional author photo */}
        {displayQuote.image && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayQuote.image}
              alt={displayQuote.author}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-container shadow-sm"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-body text-base sm:text-lg text-on-surface italic leading-relaxed tracking-[-0.01em]">
            &ldquo;{displayQuote.text}&rdquo;
          </p>
          <p className="font-body text-xs text-on-surface-variant mt-3 font-semibold tracking-wide">
            &mdash; {displayQuote.author}
          </p>
        </div>

        {/* Favorite toggle */}
        <button
          onClick={toggleFavorite}
          disabled={toggling}
          className="shrink-0 self-start p-1.5 rounded-full hover:bg-primary/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span
            className={`material-symbols-outlined text-xl transition-all duration-300 ${
              isFavorited ? 'text-primary scale-110' : 'text-on-surface-variant/40 hover:text-primary/60'
            }`}
            style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Favorites navigation (when filtering by favorites) */}
      {filterFavorites && favorites.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-outline-variant/5">
          <button
            onClick={() => setFavIndex((favIndex - 1 + favorites.length) % favorites.length)}
            className="p-1.5 rounded-full hover:bg-surface-container transition-colors duration-300 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-base">chevron_left</span>
          </button>
          <span className="text-[11px] font-body text-on-surface-variant tabular-nums">
            {(favIndex % favorites.length) + 1} of {favorites.length}
          </span>
          <button
            onClick={() => setFavIndex((favIndex + 1) % favorites.length)}
            className="p-1.5 rounded-full hover:bg-surface-container transition-colors duration-300 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-base">chevron_right</span>
          </button>
        </div>
      )}

      {/* View all favorites link (when NOT filtering) */}
      {!filterFavorites && favorites.length > 0 && (
        <div className="mt-6 pt-6 border-t border-outline-variant/5">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="text-xs text-primary font-body font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded transition-colors duration-300"
          >
            {showFavorites ? 'Hide favorites' : `View all favorites (${favorites.length})`}
          </button>
        </div>
      )}

      {/* Favorites dropdown */}
      {!filterFavorites && showFavorites && favorites.length > 0 && (
        <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="flex items-start gap-2 p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors duration-300"
            >
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs text-on-surface italic leading-relaxed line-clamp-3">
                  &ldquo;{fav.quote_text}&rdquo;
                </p>
                <p className="font-body text-[10px] text-on-surface-variant mt-1 font-semibold">
                  &mdash; {fav.quote_author}
                </p>
              </div>
              <button
                onClick={() => removeFavorite(fav.quote_text)}
                className="shrink-0 p-1 rounded-full hover:bg-error/10 transition-colors duration-300 focus:outline-none active:scale-95"
                aria-label="Remove favorite"
              >
                <span className="material-symbols-outlined text-sm text-on-surface-variant/40 hover:text-error transition-colors duration-300">
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
