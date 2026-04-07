'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// WhatsNew — In-App Changelog Modal
//
// Shows a "What's New" overlay on first login after new features
// ship. Checks localStorage for last_seen_changelog_version and
// displays unreleased features when a newer version exists.
// ============================================================

interface ChangelogFeature {
  icon: string;
  title: string;
  desc: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  features: ChangelogFeature[];
}

const CURRENT_VERSION = '1.0';

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0',
    date: '2026-04-07',
    features: [
      { icon: 'psychology', title: 'Conversation Coach', desc: 'Guided self-reflection when things get hard' },
      { icon: 'auto_awesome', title: 'Weekly Reflections', desc: 'Your journal entries woven into a narrative every Monday' },
      { icon: 'dark_mode', title: 'Dark Mode', desc: 'Easy on the eyes, especially late at night' },
      { icon: 'diversity_3', title: 'Group Accountability', desc: 'Join a group of 3-5 people for shared accountability' },
      { icon: 'mail', title: 'Letter to Future Self', desc: 'Write during clarity, delivered during relapse' },
      { icon: 'self_improvement', title: 'Breathing Exercise', desc: '4-7-8 breathing to calm the urge' },
      { icon: 'military_tech', title: 'Focus Chips', desc: 'Collectible milestone cards for your journey' },
      { icon: 'people', title: 'Community Feed', desc: 'Anonymous wins and encouragement from fellow travelers' },
      { icon: 'volunteer_activism', title: 'Mentorship', desc: '90+ day veterans can mentor newer users' },
      { icon: 'balance', title: 'Values Clarification', desc: 'Identify what matters most and see how your rivals conflict' },
    ],
  },
];

const LS_KEY = 'last_seen_changelog_version';
const LS_SUPPRESS_KEY = 'changelog_suppressed';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

export default function WhatsNew() {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try {
      const suppressed = localStorage.getItem(LS_SUPPRESS_KEY);
      if (suppressed === 'true') return;

      const lastSeen = localStorage.getItem(LS_KEY);
      if (!lastSeen || compareVersions(lastSeen, CURRENT_VERSION) < 0) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — silently skip
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, CURRENT_VERSION);
      if (dontShow) {
        localStorage.setItem(LS_SUPPRESS_KEY, 'true');
      }
    } catch {
      // localStorage unavailable
    }
    setOpen(false);
  }, [dontShow]);

  if (!open) return null;

  // Show features from the latest changelog entry
  const latest = CHANGELOG[CHANGELOG.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-on-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              new_releases
            </span>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-primary">
                What&apos;s New
              </h2>
              <p className="text-on-primary/70 text-xs font-label">
                v{latest.version} &middot; {latest.date}
              </p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          <ul className="space-y-3">
            {latest.features.map((feature) => (
              <li
                key={feature.title}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-primary text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {feature.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline font-bold text-sm text-on-surface leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 accent-[#226779]"
            />
            <span className="text-xs text-on-surface-variant font-label">
              Don&apos;t show again
            </span>
          </label>

          <button
            onClick={dismiss}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-label font-bold hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
