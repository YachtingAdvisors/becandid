'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Alert {
  id: string;
  time: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  partner_status: 'pending' | 'viewed' | 'responded';
  conversation_guide_id: string | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-primary-container text-primary',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-surface-container-low text-on-surface-variant' },
  viewed: { label: 'Partner viewed', className: 'bg-primary-container/60 text-primary' },
  responded: { label: 'Partner responded', className: 'bg-secondary-container text-on-secondary-container' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  sexual_content: '\uD83D\uDEAB',
  social_media: '\uD83D\uDCF1',
  gambling: '\uD83C\uDFB0',
  substances: '\uD83C\uDF78',
  gaming: '\uD83C\uDFAE',
  violence: '\u2694\uFE0F',
  other: '\uD83D\uDCCB',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RealTimeAlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alerts?limit=5')
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant">
        <h3 className="font-headline text-sm font-bold text-on-surface">Recent Alerts</h3>
      </div>

      {loading ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
          No recent alerts. Keep it up!
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/50">
          {alerts.map((alert) => {
            const status = STATUS_STYLES[alert.partner_status] ?? STATUS_STYLES.pending;
            return (
              <div key={alert.id} className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">
                  {CATEGORY_EMOJI[alert.category] ?? '\uD83D\uDCCB'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-on-surface font-body capitalize">
                      {alert.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[alert.severity] ?? ''}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-label">
                      {timeAgo(alert.time)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
                {alert.conversation_guide_id && (
                  <Link
                    href={`/dashboard/conversations/${alert.conversation_guide_id}`}
                    className="text-xs text-primary font-label font-medium hover:underline flex-shrink-0"
                  >
                    Guide
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
