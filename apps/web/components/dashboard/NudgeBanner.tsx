'use client';

import { useState, useEffect } from 'react';

interface NudgeMetadata {
  predictive_type?: string;
  confidence?: number;
  suggested_action?: string;
}

interface Nudge {
  id: string;
  trigger_type: string;
  severity: 'info' | 'warning' | 'urgent';
  message: string;
  sent_at: string;
  metadata?: NudgeMetadata | null;
}

const SEVERITY_STYLES = {
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'lightbulb', text: 'text-blue-800' },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'warning', text: 'text-amber-800' },
  urgent:  { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'crisis_alert', text: 'text-red-800' },
};

const PREDICTIVE_STYLE = {
  bg: 'bg-amber-50/80',
  border: 'border-amber-300',
  icon: 'bolt',
  text: 'text-amber-900',
  badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300/50',
};

function formatConfidence(confidence: number, predictiveType?: string): string {
  const times = Math.round(confidence * 4); // rough "out of N" scale
  const total = 4;
  if (times >= total) return 'This pattern has preceded a setback consistently';
  if (times >= 3) return `This pattern preceded a setback ${times} out of ${total} times`;
  if (times >= 2) return `Based on ${times} similar patterns`;
  return 'Based on early pattern detection';
}

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

  // Sort predictive nudges first
  const sorted = [...nudges].sort((a, b) => {
    const aIsPredictive = a.trigger_type === 'predictive' ? 1 : 0;
    const bIsPredictive = b.trigger_type === 'predictive' ? 1 : 0;
    return bIsPredictive - aIsPredictive;
  });

  return (
    <div className="space-y-2">
      {sorted.map(nudge => {
        const isPredictive = nudge.trigger_type === 'predictive';
        const style = isPredictive ? PREDICTIVE_STYLE : SEVERITY_STYLES[nudge.severity];
        const confidence = nudge.metadata?.confidence ?? 0;
        const predictiveType = nudge.metadata?.predictive_type;

        return (
          <div
            key={nudge.id}
            role={isPredictive ? 'alert' : undefined}
            className={`${style.bg} ${style.border} border rounded-2xl px-4 py-3 flex items-start gap-3 ${isPredictive ? 'ring-1 ring-amber-200/40' : ''}`}
          >
            <span className={`material-symbols-outlined text-lg flex-shrink-0 mt-0.5 ${isPredictive ? 'text-amber-600' : ''}`} style={isPredictive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              {isPredictive && (
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PREDICTIVE_STYLE.badge}`}>
                    Heads up
                  </span>
                  {confidence > 0 && (
                    <span className="text-[10px] text-amber-600/70 font-medium">
                      {formatConfidence(confidence, predictiveType)}
                    </span>
                  )}
                </div>
              )}
              <p className={`text-sm ${style.text} leading-relaxed`}>{nudge.message}</p>
              {isPredictive && nudge.metadata?.suggested_action && (
                <p className="text-xs text-amber-700/60 mt-1 italic">
                  {nudge.metadata.suggested_action}
                </p>
              )}
            </div>
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
