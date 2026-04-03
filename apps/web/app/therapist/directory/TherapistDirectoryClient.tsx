'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Therapist {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  bio: string;
  website: string;
}

const FILTER_PILLS = [
  'Addiction',
  'Betrayal Trauma',
  'Family Systems',
  'Anxiety',
  'EMDR',
  'Couples',
];

// Deterministic color from first letter of name
const AVATAR_COLORS: Record<string, string> = {
  A: 'bg-rose-600', B: 'bg-pink-600', C: 'bg-fuchsia-600',
  D: 'bg-purple-600', E: 'bg-violet-600', F: 'bg-indigo-600',
  G: 'bg-blue-600', H: 'bg-sky-600', I: 'bg-cyan-600',
  J: 'bg-teal-600', K: 'bg-emerald-600', L: 'bg-green-600',
  M: 'bg-lime-700', N: 'bg-yellow-700', O: 'bg-amber-600',
  P: 'bg-orange-600', Q: 'bg-red-600', R: 'bg-rose-700',
  S: 'bg-pink-700', T: 'bg-fuchsia-700', U: 'bg-purple-700',
  V: 'bg-violet-700', W: 'bg-indigo-700', X: 'bg-blue-700',
  Y: 'bg-sky-700', Z: 'bg-cyan-700',
};

function getAvatarColor(name: string) {
  const letter = name.charAt(0).toUpperCase();
  return AVATAR_COLORS[letter] || 'bg-primary';
}

export default function TherapistDirectoryClient() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/therapist/directory')
      .then((r) => r.json())
      .then((d) => {
        setTherapists(d.therapists || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeFilter
    ? therapists.filter((t) =>
        t.specialty.some((s) =>
          s.toLowerCase().includes(activeFilter.toLowerCase())
        )
      )
    : therapists;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      {/* Filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill}
            onClick={() =>
              setActiveFilter(activeFilter === pill ? null : pill)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === pill
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary/40 hover:text-primary'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-low" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-low rounded w-3/4" />
                  <div className="h-3 bg-surface-container-low rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-surface-container-low rounded mb-2" />
              <div className="h-3 bg-surface-container-low rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Therapist grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 flex flex-col transition-shadow hover:shadow-md"
            >
              {/* Header: avatar + name + location */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${getAvatarColor(t.name)}`}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-on-surface truncate">
                    {t.name}
                  </h3>
                  {t.location && (
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {t.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Specialty pills */}
              {t.specialty.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.specialty.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/8 text-primary border border-primary/15"
                    >
                      {s}
                    </span>
                  ))}
                  {t.specialty.length > 4 && (
                    <span className="px-2 py-0.5 text-[11px] text-on-surface-variant">
                      +{t.specialty.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Bio excerpt */}
              {t.bio && (
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4 flex-1">
                  {t.bio}
                </p>
              )}

              {/* CTA */}
              <Link
                href={`/therapist/directory/${t.id}`}
                className="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">handshake</span>
                Connect on Be Candid
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-2xl text-primary">group</span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-2">
            {activeFilter
              ? `No therapists found for "${activeFilter}"`
              : "We're building our directory"}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
            {activeFilter
              ? 'Try removing the filter or check back soon as more therapists join.'
              : "We're onboarding therapists who understand the nuances of unwanted behavior. In the meantime, we're happy to help."}
          </p>
          {!activeFilter && (
            <a
              href="mailto:shawn@becandid.io"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Email shawn@becandid.io for a referral
            </a>
          )}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </section>
  );
}
