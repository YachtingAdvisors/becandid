'use client';

import { useState, useEffect } from 'react';

interface NotifPrefs {
  alert_email: boolean;
  alert_sms: boolean;
  alert_push: boolean;
  checkin_email: boolean;
  checkin_sms: boolean;
  digest_email: boolean;
  nudge_email: boolean;
  encouragement_email: boolean;
}

const SECTIONS = [
  {
    title: 'Alerts',
    desc: 'When a flag fires',
    items: [
      { key: 'alert_email', label: 'Email notifications', desc: 'Get an email with your conversation guide' },
      { key: 'alert_sms', label: 'SMS notifications', desc: 'Get a text message with a link' },
      { key: 'alert_push', label: 'Push notifications', desc: 'Mobile push notification (requires app)' },
    ],
  },
  {
    title: 'Check-ins',
    desc: 'Scheduled accountability check-ins',
    items: [
      { key: 'checkin_email', label: 'Email check-in prompts', desc: 'Receive check-ins via email' },
      { key: 'checkin_sms', label: 'SMS check-in prompts', desc: 'Receive check-ins via text' },
    ],
  },
  {
    title: 'Weekly & Other',
    desc: 'Digest, nudges, encouragement',
    items: [
      { key: 'digest_email', label: 'Weekly digest', desc: 'Monday summary of your focus stats' },
      { key: 'nudge_email', label: 'Proactive nudges', desc: 'Pattern alerts and vulnerability window reminders' },
      { key: 'encouragement_email', label: 'Encouragement messages', desc: 'When your partner sends encouragement' },
    ],
  },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/notifications')
      .then(r => r.json())
      .then(d => setPrefs(d.prefs ?? {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key: string) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key as keyof NotifPrefs] };
    setPrefs(updated);
    setSaving(true);
    setSaved(false);

    await fetch('/api/auth/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: updated[key as keyof NotifPrefs] }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !prefs) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="card p-6"><div className="h-32 bg-gray-100 rounded" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Notifications</h1>
        <p className="text-sm text-ink-muted">Choose how and when Be Candid reaches out to you.</p>
      </div>

      {saved && (
        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
          Saved
        </div>
      )}

      {SECTIONS.map(section => (
        <div key={section.title} className="card p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{section.title}</h2>
            <p className="text-xs text-ink-muted">{section.desc}</p>
          </div>

          {section.items.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">{item.label}</div>
                <div className="text-xs text-ink-muted">{item.desc}</div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefs[item.key as keyof NotifPrefs] ? 'bg-brand-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefs[item.key as keyof NotifPrefs] ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
