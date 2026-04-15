// ============================================================
// components/dashboard/PrivacySettings.tsx
//
// Security + privacy panel for the Settings page.
// Shows: active sessions, data retention slider, export button,
// force logout, selective data purge.
//
// Add to Settings: <PrivacySettings />
// ============================================================

'use client';

import { useState } from 'react';

export default function PrivacySettings({ initialRetentionDays = 90 }: { initialRetentionDays?: number }) {
  const [retention, setRetention] = useState(initialRetentionDays);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState<string | null>(null);
  const [showPurge, setShowPurge] = useState(false);

  const updateRetention = async (days: number) => {
    setRetention(days);
    setSaving(true);
    await fetch('/api/privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_retention_days: days }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/privacy');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `be-candid-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    setExporting(false);
  };

  const purgeData = async (type: string) => {
    const labels: Record<string, string> = {
      events: 'all flagged events',
      journal: 'all journal entries',
      alerts: 'all alerts and conversation guides',
    };
    if (!confirm(`Permanently delete ${labels[type]}? This cannot be undone.`)) return;
    setPurging(type);
    await fetch('/api/privacy', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purge_type: type }),
    });
    setPurging(null);
    setShowPurge(false);
  };

  return (
    <div className="space-y-4">
      {/* Data Retention */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <h3 className="text-sm font-semibold text-on-surface">Data Retention</h3>
          {saved && <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span> Saved</span>}
        </div>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Flagged events older than this will be automatically deleted. Journal entries are never auto-deleted — they're your reflection work.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range" min={30} max={365} step={30} value={retention}
            onChange={(e) => updateRetention(parseInt(e.target.value))}
            disabled={saving}
            className="flex-1 h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
          />
          <span className="text-sm font-medium text-on-surface w-20 text-right">
            {retention} days
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 px-0.5">
          <span>30 days</span>
          <span>1 year</span>
        </div>
      </div>

      {/* Data Export & Purge */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="material-symbols-outlined text-lg">inventory_2</span>
          <h3 className="text-sm font-semibold text-on-surface">Your Data</h3>
        </div>
        <div className="space-y-2">
          <button onClick={exportData} disabled={exporting}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
            <div>
              <p className="text-sm font-medium text-on-surface">Export all data</p>
              <p className="text-xs text-on-surface-variant">Download everything as JSON</p>
            </div>
            <span className="text-sm text-on-surface-variant">{exporting ? 'Preparing…' : '→'}</span>
          </button>

          <button onClick={() => setShowPurge(!showPurge)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-red-600">Delete data</p>
              <p className="text-xs text-on-surface-variant">Permanently remove specific data</p>
            </div>
            <span className="material-symbols-outlined text-sm text-red-400">{showPurge ? 'expand_more' : 'chevron_right'}</span>
          </button>

          {showPurge && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 space-y-2">
              <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">warning</span> These actions cannot be undone</p>
              {[
                { type: 'events', label: 'Delete all flagged events', desc: 'Removes activity history' },
                { type: 'journal', label: 'Delete all journal entries', desc: 'Removes reflections + prompts' },
                { type: 'alerts', label: 'Delete all alerts', desc: 'Removes alerts + conversation guides' },
              ].map((item) => (
                <button key={item.type} onClick={() => purgeData(item.type)}
                  disabled={purging === item.type}
                  className="w-full text-left p-2.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  <p className="text-xs font-medium text-red-700">{item.label}</p>
                  <p className="text-[10px] text-red-500">{item.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
