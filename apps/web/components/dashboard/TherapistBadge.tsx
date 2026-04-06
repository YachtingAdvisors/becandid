'use client';

// ============================================================
// TherapistBadge — "Shared With My Therapist" accountability badge
//
// Shows a subtle teal pill badge when the user has an active
// therapist connection. Creates a gentle accountability layer
// via the observer effect.
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TherapistConnection {
  id: string;
  therapist_name: string | null;
  therapist_email: string;
  status: string;
  can_see_journal: boolean;
  can_see_moods: boolean;
  can_see_streaks: boolean;
  can_see_outcomes: boolean;
  can_see_patterns: boolean;
}

export default function TherapistBadge() {
  const [connection, setConnection] = useState<TherapistConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchTherapist() {
      try {
        const res = await fetch('/api/therapist');
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const accepted = (data.as_user ?? []).find(
          (c: TherapistConnection) => c.status === 'accepted'
        );
        if (!cancelled) setConnection(accepted ?? null);
      } catch {
        // Non-critical — silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTherapist();
    return () => { cancelled = true; };
  }, []);

  if (loading || !connection) return null;

  const therapistName = connection.therapist_name || connection.therapist_email;

  const accessItems: string[] = [];
  if (connection.can_see_journal) accessItems.push('Journal entries');
  if (connection.can_see_moods) accessItems.push('Mood timeline');
  if (connection.can_see_streaks) accessItems.push('Focus streaks');
  if (connection.can_see_outcomes) accessItems.push('Conversation outcomes');
  if (connection.can_see_patterns) accessItems.push('Behavioral patterns');

  return (
    <div className="relative">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 ring-1 ring-teal-200/50 cursor-default transition-all duration-200 hover:ring-teal-300/70 hover:bg-teal-100/50"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="status"
        aria-label={`Your therapist ${therapistName} can see your shared data`}
      >
        <span
          className="material-symbols-outlined text-teal-600 text-base"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          medical_services
        </span>
        <span className="text-xs font-label font-semibold text-teal-700">
          Your therapist can see your journal and moods
        </span>
      </div>

      {/* Hover tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-surface-container-lowest rounded-2xl p-4 shadow-xl ring-1 ring-outline-variant/20 animate-fade-slide">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-teal-600 text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
            <span className="text-sm font-label font-bold text-on-surface">{therapistName}</span>
          </div>

          <p className="text-xs text-on-surface-variant font-body mb-2">
            Has read-only access to:
          </p>
          <ul className="space-y-1 mb-3">
            {accessItems.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-on-surface-variant font-body">
                <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1 text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Manage access
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
}
