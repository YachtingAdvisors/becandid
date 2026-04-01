'use client';

import { useState, useEffect } from 'react';

interface Nudge {
  id: string;
  trigger_type: string;
  severity: 'info' | 'warning' | 'urgent';
  message: string;
  sent_at: string;
}

const SEVERITY_STYLES = {
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'lightbulb', text: 'text-blue-800' },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'warning', text: 'text-amber-800' },
  urgent:  { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'crisis_alert', text: 'text-red-800' },
};

export default function NudgeBanner() {
  const [nudges, setNudges] = useState<Nudge[]>([]);

  useEffect(() => {
    fetch('/api/nudges')
      .then(r => r.json())
      .then(d => setNudges(d.nudges ?? []))
      .catch(console.error);
  }, []);

  async function dismiss(id: string) {
    setNudges(prev => prev.filter(n => n.id !== id));
    await fetch('/api/nudges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2">
      {nudges.map(nudge => {
        const style = SEVERITY_STYLES[nudge.severity];
        return (
          <div key={nudge.id} className={`${style.bg} ${style.border} border rounded-2xl px-4 py-3 flex items-start gap-3`}>
            <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">{style.icon}</span>
            <p className={`text-sm ${style.text} flex-1 leading-relaxed`}>{nudge.message}</p>
            <button
              onClick={() => dismiss(nudge.id)}
              className="text-on-surface-variant hover:text-on-surface text-xs font-medium flex-shrink-0 mt-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
