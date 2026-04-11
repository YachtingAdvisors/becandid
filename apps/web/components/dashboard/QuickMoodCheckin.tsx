'use client';

import { useState, useEffect, useCallback } from 'react';
import MaterialIcon from '@/components/ui/MaterialIcon';

type Mood = 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
type CheckinState =
  | 'idle'
  | 'selecting'
  | 'submitted'
  | 'nudge-prompt'
  | 'nudge-sending'
  | 'nudge-sent';

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
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

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

  // Fetch partner info on mount
  useEffect(() => {
    fetch('/api/partners')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.partner?.partner_name) {
          setPartnerName(data.partner.partner_name.split(' ')[0]);
        } else if (data?.partners?.length > 0) {
          setPartnerName(data.partners[0].partner_name?.split(' ')[0] ?? null);
        }
      })
      .catch(() => {});
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

    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    setCooldown(true);

    // Positive moods: show thanks briefly
    if (mood === 'great' || mood === 'good' || mood === 'okay') {
      setState('submitted');
      setTimeout(() => {
        setState('idle');
        setSelected(null);
      }, 2000);
    } else {
      // Low or crisis: go to nudge prompt if partner exists, else submitted
      setState(partnerName ? 'nudge-prompt' : 'submitted');
    }
  }, [partnerName]);

  const resetFromCrisis = useCallback(() => {
    setState('idle');
    setSelected(null);
    setNudgeMessage('');
    setShowMessageInput(false);
  }, []);

  const handleNudge = useCallback(async () => {
    if (!selected) return;
    setState('nudge-sending');

    try {
      const moodKey = selected === 'struggling' ? 'low' : 'crisis';
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodKey,
          ...(nudgeMessage.trim() ? { message: nudgeMessage.trim() } : {}),
        }),
      });

      setState(res.ok ? 'nudge-sent' : 'submitted');
    } catch {
      setState('submitted');
    }
  }, [selected, nudgeMessage]);

  const dismissNudge = useCallback(() => {
    setState('submitted');
  }, []);

  // ── Nudge sent confirmation ──────────────────────────────────
  if (state === 'nudge-sent') {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="text-center py-2">
          <MaterialIcon name="favorite" filled className="text-primary text-3xl mb-2" />
          <p className="font-body text-sm text-on-surface mb-1">
            {partnerName ? `${partnerName} has been notified.` : 'Your partner has been notified.'}
          </p>
          <p className="font-label text-xs text-on-surface-variant">
            You are not alone.
          </p>
        </div>

        {/* Still show crisis resources if in crisis */}
        {selected === 'crisis' && (
          <div className="mt-4 space-y-3">
            <p className="font-label text-xs text-on-surface-variant text-center">
              If you need immediate support:
            </p>
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
        )}

        <button
          onClick={resetFromCrisis}
          className="mt-4 w-full py-2 text-xs font-label text-on-surface-variant hover:text-on-surface cursor-pointer transition-all duration-200"
        >
          Close
        </button>
      </div>
    );
  }

  // ── Nudge sending state ──────────────────────────────────────
  if (state === 'nudge-sending') {
    return (
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center justify-center gap-2 py-6">
          <span className="material-symbols-outlined text-primary text-2xl animate-spin">progress_activity</span>
          <span className="font-body text-sm text-on-surface-variant">
            Reaching out to {partnerName ?? 'your partner'}...
          </span>
        </div>
      </div>
    );
  }

  // ── Nudge prompt (for struggling/crisis after submission) ────
  if (state === 'nudge-prompt' && selected) {
    const isCrisis = selected === 'crisis';
    const ringColor = isCrisis ? 'ring-error/20' : 'ring-amber-400/20';
    const accentColor = isCrisis ? 'text-error' : 'text-amber-500';
    const btnBg = isCrisis
      ? 'bg-error hover:bg-error/90'
      : 'bg-amber-500 hover:bg-amber-600';

    return (
      <div className={`bg-surface-container-lowest rounded-2xl ring-1 ${ringColor} p-5`}>
        <div className="text-center mb-4">
          <MaterialIcon name="favorite" filled className={`${accentColor} text-3xl mb-2`} />
          <p className="font-body text-sm text-on-surface mb-1">
            It takes courage to name how you are feeling.
          </p>
          <p className="font-label text-xs text-on-surface-variant">
            Would you like to reach out to {partnerName ?? 'your partner'}?
          </p>
        </div>

        {/* Optional message */}
        {showMessageInput ? (
          <div className="mb-4">
            <textarea
              value={nudgeMessage}
              onChange={(e) => setNudgeMessage(e.target.value)}
              placeholder="Add a short message (optional)..."
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 text-sm font-body text-on-surface bg-surface-container-low rounded-xl ring-1 ring-outline-variant/20 focus:ring-primary/40 focus:outline-none resize-none placeholder:text-on-surface-variant/50"
            />
            <p className="text-right font-label text-[10px] text-on-surface-variant mt-1">
              {nudgeMessage.length}/500
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowMessageInput(true)}
            className="mb-4 w-full py-2 text-xs font-label text-on-surface-variant hover:text-primary cursor-pointer transition-all duration-200 flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Add a message
          </button>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleNudge}
            className={`flex-1 py-3 rounded-xl font-label text-sm font-bold text-white ${btnBg} cursor-pointer transition-all duration-200 flex items-center justify-center gap-2`}
          >
            <span className="material-symbols-outlined text-lg">notifications_active</span>
            Nudge {partnerName ?? 'Partner'}
          </button>
          <button
            onClick={dismissNudge}
            className="flex-1 py-3 rounded-xl font-label text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all duration-200"
          >
            I&apos;m okay for now
          </button>
        </div>

        {/* Crisis resources always visible in crisis mode */}
        {isCrisis && (
          <div className="mt-4 space-y-2">
            <p className="font-label text-xs text-on-surface-variant text-center">
              If you need immediate support:
            </p>
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
        )}
      </div>
    );
  }

  // ── Submitted state: show feedback ───────────────────────────
  if (state === 'submitted' && selected) {
    // Positive moods
    if (selected === 'great' || selected === 'good' || selected === 'okay') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <div className="flex items-center justify-center gap-2 py-4">
            <MaterialIcon name="check_circle" filled className="text-green-600 text-2xl" />
            <span className="font-body text-sm text-on-surface">Thanks for checking in!</span>
          </div>
        </div>
      );
    }

    // Struggling (no partner, or dismissed nudge prompt)
    if (selected === 'struggling') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <div className="text-center py-2">
            <MaterialIcon name="favorite" filled className="text-amber-500 text-3xl mb-2" />
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

    // Crisis (no partner, or dismissed nudge prompt)
    if (selected === 'crisis') {
      return (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-error/20 p-5">
          <div className="text-center mb-4">
            <MaterialIcon name="emergency" filled className="text-error text-3xl mb-2" />
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

  // ── Default idle state ───────────────────────────────────────
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
              <MaterialIcon name={mood.icon} filled className={`text-2xl ${mood.color}`} />
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
