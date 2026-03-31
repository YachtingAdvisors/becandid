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
        <div className="h-8 bg-surface-container rounded w-48" />
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6"><div className="h-32 bg-surface-container-low rounded" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span> Notifications
        </h1>
        <p className="text-sm text-on-surface-variant font-body">Choose how and when Be Candid reaches out to you.</p>
      </div>

      {saved && (
        <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center inline-flex items-center gap-2 mx-auto w-full justify-center">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved
        </div>
      )}

      {SECTIONS.map(section => (
        <div key={section.title} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
          <div>
            <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">{section.title}</h2>
            <p className="text-xs text-on-surface-variant font-body">{section.desc}</p>
          </div>

          {section.items.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-on-surface">{item.label}</div>
                <div className="text-xs text-on-surface-variant font-body">{item.desc}</div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                  prefs[item.key as keyof NotifPrefs] ? 'bg-primary' : 'bg-outline-variant'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
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
