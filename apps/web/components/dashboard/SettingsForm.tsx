'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GOAL_LABELS, getCategoryEmoji,
  STREAK_MODE_LABELS, STREAK_MODE_SHORT,
  type GoalCategory, type StreakMode,
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
  };
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [goals, setGoals] = useState<GoalCategory[]>(profile.goals || []);
  const [monitoringEnabled, setMonitoringEnabled] = useState(profile.monitoring_enabled);
  const [streakMode, setStreakMode] = useState<StreakMode>(profile.streak_mode || 'no_failures');
  const [timezone, setTimezone] = useState(profile.timezone || 'America/New_York');
  const [nudgeEnabled, setNudgeEnabled] = useState(profile.nudge_enabled ?? true);
  const [checkInEnabled, setCheckInEnabled] = useState(profile.check_in_enabled ?? true);
  const [checkInHour, setCheckInHour] = useState(profile.check_in_hour ?? 21);
  const [checkInFrequency, setCheckInFrequency] = useState<CheckInFrequency>(profile.check_in_frequency ?? 'daily');
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
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to save settings.');
      return;
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
            <div className="text-sm font-medium text-ink">Monitoring active</div>
            <div className="text-xs text-ink-muted">Screen activity detection is running</div>
          </div>
          <button
            onClick={() => setMonitoringEnabled(!monitoringEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              monitoringEnabled ? 'bg-brand-600' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              monitoringEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </section>

      {/* ── Rivals (Goals) ──────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Your Rivals</h2>
        <p className="text-xs text-ink-muted">Select the areas you want accountability for.</p>
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
