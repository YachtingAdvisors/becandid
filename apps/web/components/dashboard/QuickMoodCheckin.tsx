'use client';

import { useState, useEffect, useCallback } from 'react';

type Mood = 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
type CheckinState = 'idle' | 'selecting' | 'submitted';

const COOLDOWN_KEY = 'bc_mood_checkin_ts';
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const MOODS: { key: Mood; icon: string; label: string; color: string }[] = [
  { key: 'great', icon: 'sentiment_very_satisfied', label: 'Great', color: 'text-green-600' },
  { key: 'good', icon: 'sentiment_satisfied', label: 'Good', color: 'text-primary' },
  { key: 'okay', icon: 'sentiment_neutral', label: 'Okay', color: 'text-on-surface-variant' },
  { key: 'struggling', icon: 'sentiment_dissatisfied', label: 'Low', color: 'text-amber-500' },
  { key: 'crisis', icon: 'sentiment_very_dissatisfied', label: 'Crisis', color: 'text-error' },
];

export default function QuickMoodCheckin() {
  const [state, setState] = useState<CheckinState>('idle');
  const [selected, setSelected] = useState<Mood | null>(null);
  const [cooldown, setCooldown] = useState(false);

  // Check cooldown on mount
  useEffect(() => {
    const lastTs = localStorage.getItem(COOLDOWN_KEY);
    if (lastTs && Date.now() - parseInt(lastTs, 10) < COOLDOWN_MS) {
      setCooldown(true);
      const remaining = COOLDOWN_MS - (Date.now() - parseInt(lastTs, 10));
      const timer = setTimeout(() => setCooldown(false), remaining);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = useCallback(async (mood: Mood) => {
    setSelected(mood);
    setState('selecting');

    if (mood === 'struggling' || mood === 'crisis') {
      // POST event
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'custom',
          severity: mood === 'crisis' ? 'high' : 'medium',
          platform: 'web',
          metadata: { type: 'mood_checkin', mood },
        }),
      }).catch(() => {});
    }

    setState('submitted');
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    setCooldown(true);

    // Reset after 2s for positive moods
    if (mood === 'great' || mood === 'good' || mood === 'okay') {
      setTimeout(() => {
        setState('idle');
        setSelected(null);
      }, 2000);
    }
  }, []);

  const resetFromCrisis = useCallback(() => {
    setState('idle');
    setSelected(null);
  }, []);

  // Submitted state: show feedback
  if (state === 'submitted' && selected) {
    // Positive moods
    if (selected === 'great' || selected === 'good' || selected === 'okay') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="material-symbols-outlined text-green-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-body text-sm text-on-surface">Thanks for checking in!</span>
          </div>
        </div>
      );
    }

    // Struggling
    if (selected === 'struggling') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <div className="text-center py-2">
            <span className="material-symbols-outlined text-amber-500 text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <p className="font-body text-sm text-on-surface mb-1">Remember, you are not alone in this.</p>
            <p className="font-label text-xs text-on-surface-variant">Your courage to be honest matters.</p>
          </div>
          <button
            onClick={resetFromCrisis}
            className="mt-3 w-full py-2 text-xs font-label text-primary hover:underline cursor-pointer transition-all duration-200"
          >
            Done
          </button>
        </div>
      );
    }

    // Crisis
    if (selected === 'crisis') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-error/20 p-5">
          <div className="text-center mb-4">
            <span className="material-symbols-outlined text-error text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            <p className="font-headline text-sm font-bold text-on-surface mb-1">You deserve support right now.</p>
            <p className="font-label text-xs text-on-surface-variant">Please reach out -- these services are free and confidential:</p>
          </div>
          <div className="space-y-3">
            <a
              href="tel:988"
              className="flex items-center gap-3 p-3 bg-error/5 rounded-xl ring-1 ring-error/10 hover:ring-error/30 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-error">call</span>
              <div>
                <p className="font-body text-sm font-bold text-on-surface">988 Suicide &amp; Crisis Lifeline</p>
                <p className="font-label text-xs text-on-surface-variant">Call or text 988 -- 24/7</p>
              </div>
            </a>
            <a
              href="sms:741741&body=HOME"
              className="flex items-center gap-3 p-3 bg-error/5 rounded-xl ring-1 ring-error/10 hover:ring-error/30 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-error">sms</span>
              <div>
                <p className="font-body text-sm font-bold text-on-surface">Crisis Text Line</p>
                <p className="font-label text-xs text-on-surface-variant">Text HOME to 741741 -- 24/7</p>
              </div>
            </a>
          </div>
          <button
            onClick={resetFromCrisis}
            className="mt-4 w-full py-2 text-xs font-label text-on-surface-variant hover:text-on-surface cursor-pointer transition-all duration-200"
          >
            Close
          </button>
        </div>
      );
    }
  }

  // Default idle state
  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
      <div className="mb-4">
        <h3 className="font-headline text-base font-bold text-on-surface">How are you doing right now?</h3>
        <p className="font-label text-xs text-on-surface-variant">Quick check-in</p>
      </div>

      {cooldown && state === 'idle' ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <span className="material-symbols-outlined text-primary/50 text-xl">schedule</span>
          <span className="font-label text-xs text-on-surface-variant">Check-in available again soon</span>
        </div>
      ) : (
        <div className="flex gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              onClick={() => handleSelect(mood.key)}
              disabled={cooldown}
              className={`w-full py-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary/20 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                selected === mood.key
                  ? 'ring-2 ring-primary bg-primary/[0.08]'
                  : 'bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${mood.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {mood.icon}
              </span>
              <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
