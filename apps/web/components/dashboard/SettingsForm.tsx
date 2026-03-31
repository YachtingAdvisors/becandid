'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GOAL_LABELS, getCategoryEmoji,
  STREAK_MODE_LABELS, STREAK_MODE_SHORT,
  MOTIVATOR_LABELS, MOTIVATOR_DESCRIPTIONS,
  type GoalCategory, type StreakMode, type FoundationalMotivator,
} from '@be-candid/shared';
import GoalSelector from '../onboarding/GoalSelector';
import TimezonePicker from './TimezonePicker';
import FrequencyPicker from './FrequencyPicker';
import type { CheckInFrequency } from '../../lib/checkInEngine';

interface SettingsFormProps {
  profile: {
    name: string;
    phone?: string;
    goals: GoalCategory[];
    monitoring_enabled: boolean;
    streak_mode: StreakMode;
    timezone: string;
    nudge_enabled?: boolean;
    check_in_enabled?: boolean;
    check_in_hour?: number;
    check_in_frequency?: CheckInFrequency;
    foundational_motivator?: string;
  };
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [goals, setGoals] = useState<GoalCategory[]>(profile.goals || []);
  const [monitoringEnabled, setMonitoringEnabled] = useState(profile.monitoring_enabled ?? true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [streakMode, setStreakMode] = useState<StreakMode>(profile.streak_mode || 'no_failures');
  const [timezone, setTimezone] = useState(profile.timezone || 'America/New_York');
  const [nudgeEnabled, setNudgeEnabled] = useState(profile.nudge_enabled ?? true);
  const [checkInEnabled, setCheckInEnabled] = useState(profile.check_in_enabled ?? true);
  const [checkInHour, setCheckInHour] = useState(profile.check_in_hour ?? 21);
  const [checkInFrequency, setCheckInFrequency] = useState<CheckInFrequency>(profile.check_in_frequency ?? 'daily');
  const [foundationalMotivator, setFoundationalMotivator] = useState<FoundationalMotivator>((profile.foundational_motivator as FoundationalMotivator) ?? 'general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (goals.length === 0) { setError('Select at least one area to monitor.'); return; }

    setLoading(true);
    setError('');
    setSaved(false);

    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || undefined,
        goals,
        monitoring_enabled: monitoringEnabled,
        streak_mode: streakMode,
        timezone,
        nudge_enabled: nudgeEnabled,
        check_in_enabled: checkInEnabled,
        check_in_hour: checkInHour,
        check_in_frequency: checkInFrequency,
        foundational_motivator: foundationalMotivator,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to save settings.');
      return;
    }

    // If monitoring was toggled off, notify partner via screen-capture settings
    if (!monitoringEnabled) {
      fetch('/api/screen-capture/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false, notify_partner: true, reason: pauseReason || undefined }),
      }).catch(() => {});
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* ── Profile ─────────────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Profile</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Phone <span className="text-ink-muted">(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <TimezonePicker value={timezone} onChange={setTimezone} />
      </section>

      {/* ── Monitoring ──────────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Monitoring</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${monitoringEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
              <div className="text-sm font-medium text-ink">
                {monitoringEnabled ? 'Monitoring Active' : 'Monitoring Paused'}
              </div>
            </div>
            <div className="text-xs text-ink-muted mt-0.5">
              {monitoringEnabled
                ? 'Screen activity detection is running. Your partner can see your status.'
                : 'Monitoring is off. Your partner has been notified.'}
            </div>
          </div>
          <button
            onClick={() => {
              if (monitoringEnabled) {
                // Show pause modal instead of toggling immediately
                setPauseReason('');
                setShowPauseModal(true);
              } else {
                setMonitoringEnabled(true);
              }
            }}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ${
              monitoringEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-red-300 shadow-lg shadow-red-300/30'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
              monitoringEnabled ? 'translate-x-7' : ''
            }`} />
          </button>
        </div>
        {!monitoringEnabled && pauseReason && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 ring-1 ring-amber-200/50">
            <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">edit_note</span>
            <p className="text-xs text-amber-800 font-body">Sent to partner: &ldquo;{pauseReason}&rdquo;</p>
          </div>
        )}
        {!monitoringEnabled && !pauseReason && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 ring-1 ring-red-200/50">
            <span className="material-symbols-outlined text-red-500 text-base">warning</span>
            <p className="text-xs text-red-700 font-body">Your accountability partner has been alerted that monitoring is paused.</p>
          </div>
        )}
      </section>

      {/* ── Pause Monitoring Modal ────────────────────────── */}
      {showPauseModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowPauseModal(false)}>
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div
            className="relative bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-700">pause_circle</span>
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Pause Monitoring?</h3>
                <p className="text-xs text-on-surface-variant">Your partner will be notified.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-label font-medium text-on-surface-variant block mb-1.5">
                Add a note for your partner <span className="text-on-surface-variant/50">(optional)</span>
              </label>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="e.g. Taking a break for personal time, at a doctor's appointment, traveling..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-[10px] text-on-surface-variant/50 text-right mt-1">{pauseReason.length}/200</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-2.5 text-sm font-label font-medium text-on-surface-variant rounded-full ring-1 ring-outline-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMonitoringEnabled(false);
                  setShowPauseModal(false);
                }}
                className="flex-1 py-2.5 text-sm font-label font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/20 hover:brightness-110 cursor-pointer transition-all duration-200"
              >
                Pause Monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rivals (Goals) ──────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          Your Rivals
        </h2>

        <div className="px-4 py-3 rounded-xl bg-primary-container/20 border border-primary-container/30">
          <p className="text-xs text-on-surface leading-relaxed font-body italic">
            &ldquo;He who has a why to live can bear almost any how.&rdquo;
          </p>
          <p className="text-[10px] text-on-surface-variant font-label mt-0.5 mb-2">&mdash; Viktor Frankl</p>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            We call these <strong className="text-on-surface">Rivals</strong> &mdash; not weaknesses, not failures.
            A rival is a worthy opponent that sharpens you through the encounter.
            Every time you face one and hold your ground, you come back stronger.
            Name them honestly. That&rsquo;s where the power starts.
          </p>
        </div>

        <GoalSelector selected={goals} onChange={setGoals} disabled={loading} />
      </section>

      {/* ── Streak Mode ─────────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Focus Streak Mode</h2>

        <div className="space-y-2">
          {(['no_failures', 'conversation_required'] as StreakMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setStreakMode(mode)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                streakMode === mode
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-border hover:border-brand-300'
              }`}
            >
              <span className="font-semibold text-ink">{STREAK_MODE_LABELS[mode]}</span>
              <p className="text-xs text-ink-muted mt-0.5">{STREAK_MODE_SHORT[mode]}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Foundational Motivator ──────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Foundational Motivator</h2>
        <p className="text-xs text-ink-muted">Choose the perspective that grounds your journey. Quotes and reflections are tailored to match.</p>

        <div className="space-y-2">
          {(Object.keys(MOTIVATOR_LABELS) as FoundationalMotivator[]).map((key) => (
            <button
              key={key}
              onClick={() => setFoundationalMotivator(key)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                foundationalMotivator === key
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-border hover:border-brand-300'
              }`}
            >
              <span className="font-semibold text-ink">{MOTIVATOR_LABELS[key]}</span>
              <p className="text-xs text-ink-muted mt-0.5">{MOTIVATOR_DESCRIPTIONS[key]}</p>
            </button>
          ))}
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">You can change this anytime.</p>
      </section>

      {/* ── Check-ins & Nudges ──────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Check-ins & Nudges</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Check-ins</div>
            <div className="text-xs text-ink-muted">Both you and your partner confirm each check-in</div>
          </div>
          <button
            onClick={() => setCheckInEnabled(!checkInEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              checkInEnabled ? 'bg-brand-600' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              checkInEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>

        {checkInEnabled && (
          <div className="space-y-4 pl-1 border-l-2 border-brand-200 ml-1">
            <div className="pl-4">
              <FrequencyPicker
                value={checkInFrequency}
                onChange={setCheckInFrequency}
                disabled={loading}
              />
            </div>

            <div className="pl-4">
              <label className="block text-sm font-medium text-ink mb-1.5">Check-in time</label>
              <select
                value={checkInHour}
                onChange={(e) => setCheckInHour(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>

            <div className="pl-4">
              <div className="px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-700 leading-relaxed">
                <strong>How it works:</strong> A check-in is sent at your chosen time and frequency. Both you and your partner must confirm for it to count as completed. You each share how you're feeling, and both earn +5 trust points when complete.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Proactive nudges</div>
            <div className="text-xs text-ink-muted">Get a heads-up when patterns are detected</div>
          </div>
          <button
            onClick={() => setNudgeEnabled(!nudgeEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              nudgeEnabled ? 'bg-brand-600' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              nudgeEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </section>

      {/* ── Save ────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Settings saved successfully.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary w-full justify-center py-3 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
