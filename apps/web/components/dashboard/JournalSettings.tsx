// ============================================================
// components/dashboard/JournalSettings.tsx
//
// Client component for the Settings page.
// Lets users configure:
//   - Reminder on/off
//   - Frequency (daily, every 2 days, every 3 days, weekly)
//   - Preferred time of day
//   - After-relapse auto-prompt on/off
//   - Delay before relapse prompt (how many minutes to wait)
//
// Add to your Settings page:
//   import JournalSettings from '@/components/dashboard/JournalSettings';
//   <JournalSettings />
// ============================================================

'use client';

import { useState, useEffect } from 'react';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'every_2_days', label: 'Every 2 days' },
  { value: 'every_3_days', label: 'Every 3 days' },
  { value: 'weekly', label: 'Weekly' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: i, label: `${h}:00 ${ampm}` };
});

const DELAYS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
  'America/Sao_Paulo',
];

export default function JournalSettings() {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/journal-reminders')
      .then((r) => r.json())
      .then((d) => { setPrefs(d.preferences); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async (updates: any) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    setSaving(true);
    try {
      await fetch('/api/journal-reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
      <div className="h-32 animate-pulse bg-surface-container-low rounded-lg" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">edit_note</span>
          <h3 className="text-sm font-semibold text-on-surface">Candid Journal Reminders</h3>
        </div>
        {saved && (
          <span className="text-xs text-emerald-600 font-medium animate-fade-in flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span> Saved</span>
        )}
      </div>

      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
        Get nudged to reflect with a guided prompt. Each notification includes a different
        question to help you trace the tributaries, name unmet longings, or follow the roadmap.
      </p>

      {/* Reminder toggle */}
      <div className="flex items-center justify-between py-3 border-b border-outline-variant">
        <div>
          <p className="text-sm font-medium text-on-surface">Scheduled reminders</p>
          <p className="text-xs text-on-surface-variant">Receive a journal prompt on a regular schedule</p>
        </div>
        <button
          onClick={() => save({ reminder_enabled: !prefs.reminder_enabled })}
          role="switch"
          aria-checked={prefs.reminder_enabled}
          aria-label="Scheduled reminders"
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.reminder_enabled ? 'bg-primary' : 'bg-surface-container'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            prefs.reminder_enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Frequency + time (only if enabled) */}
      {prefs.reminder_enabled && (
        <div className="py-3 border-b border-outline-variant space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-on-surface-variant w-20 shrink-0">Frequency</label>
            <select
              value={prefs.frequency}
              onChange={(e) => save({ frequency: e.target.value })}
              className="flex-1 text-sm border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-on-surface-variant w-20 shrink-0">Time</label>
            <select
              value={prefs.preferred_hour}
              onChange={(e) => save({ preferred_hour: parseInt(e.target.value) })}
              className="flex-1 text-sm border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-on-surface-variant w-20 shrink-0">Timezone</label>
            <select
              value={prefs.timezone}
              onChange={(e) => save({ timezone: e.target.value })}
              className="flex-1 text-sm border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* After-relapse toggle */}
      <div className="flex items-center justify-between py-3 border-b border-outline-variant">
        <div>
          <p className="text-sm font-medium text-on-surface">Journal after relapse</p>
          <p className="text-xs text-on-surface-variant">Get a reflection prompt after a flagged event</p>
        </div>
        <button
          onClick={() => save({ after_relapse: !prefs.after_relapse })}
          role="switch"
          aria-checked={prefs.after_relapse}
          aria-label="Journal after relapse"
          className={`relative w-11 h-6 rounded-full transition-colors ${
            prefs.after_relapse ? 'bg-primary' : 'bg-surface-container'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            prefs.after_relapse ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Relapse delay (only if after_relapse enabled) */}
      {prefs.after_relapse && (
        <div className="py-3 space-y-1">
          <div className="flex items-center gap-3">
            <label className="text-xs text-on-surface-variant w-20 shrink-0">Wait time</label>
            <select
              value={prefs.relapse_delay_min}
              onChange={(e) => save({ relapse_delay_min: parseInt(e.target.value) })}
              className="flex-1 text-sm border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DELAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-on-surface-variant pl-[92px]">
            How long to wait before prompting — gives you time to settle before reflecting
          </p>
        </div>
      )}
    </div>
  );
}
