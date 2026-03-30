// ============================================================
// components/dashboard/SoloModeToggle.tsx
//
// Settings component. Shows solo mode status and toggle.
// When in solo mode, explains what's different.
// When leaving solo mode, requires a partner first.
// ============================================================

'use client';

import { useState, useEffect } from 'react';

export default function SoloModeToggle() {
  const [solo, setSolo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/solo-mode')
      .then((r) => r.json())
      .then((d) => { setSolo(d.solo_mode); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = async () => {
    setToggling(true);
    setError('');
    try {
      const res = await fetch('/api/solo-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solo_mode: !solo }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSolo(data.solo_mode);
      }
    } catch (e) {
      setError('Failed to update');
    }
    setToggling(false);
  };

  if (loading) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">{solo ? 'explore' : 'handshake'}</span>
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {solo ? 'Solo Mode' : 'Partner Mode'}
            </h3>
            <p className="text-xs text-ink-muted">
              {solo
                ? 'Using Be Candid without a partner. Self-reflection guides and journal prompts are your primary tools.'
                : 'Alerts, conversation guides, and check-ins are shared with your accountability partner.'}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={toggling}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            solo ? 'bg-amber-500' : 'bg-brand'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            solo ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      {solo && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>In solo mode:</strong> Alerts create self-reflection guides instead of partner notifications.
            Check-ins are self-assessments. Journal prompts are your primary accountability tool.
            You can invite a partner anytime from the Partner page.
          </p>
        </div>
      )}
    </div>
  );
}
