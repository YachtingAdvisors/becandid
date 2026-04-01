// ============================================================
// components/dashboard/TherapistSettings.tsx
//
// Settings panel for managing therapist connections.
// Users can: invite a therapist, toggle consent per data type,
// and revoke access at any time.
//
// Add to Settings page: <TherapistSettings />
// ============================================================

'use client';

import { useState, useEffect } from 'react';

interface Connection {
  id: string;
  therapist_email: string;
  therapist_name: string | null;
  status: 'pending' | 'accepted' | 'revoked';
  can_see_journal: boolean;
  can_see_moods: boolean;
  can_see_streaks: boolean;
  can_see_outcomes: boolean;
  can_see_patterns: boolean;
  accepted_at: string | null;
}

const CONSENT_ITEMS = [
  { key: 'can_see_journal', label: 'Journal entries', desc: 'Your reflections, tributaries, longings, and roadmap entries' },
  { key: 'can_see_moods', label: 'Mood timeline', desc: 'Mood ratings from journal entries and check-ins' },
  { key: 'can_see_streaks', label: 'Focus streaks', desc: 'Your streak history, milestones, and trust points' },
  { key: 'can_see_outcomes', label: 'Conversation outcomes', desc: 'How you rated your accountability conversations' },
  { key: 'can_see_patterns', label: 'Pattern analysis', desc: 'Time clustering, frequency data, and vulnerability windows' },
];

export default function TherapistSettings() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fetchConnections = () => {
    fetch('/api/therapist').then((r) => r.json()).then((d) => {
      setConnections(d.as_user || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchConnections(); }, []);

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapist_email: email.trim(), therapist_name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setEmail(''); setName(''); setShowInvite(false); fetchConnections(); }
    } catch (e) { setError('Failed to send invite'); }
    setSending(false);
  };

  const updateConsent = async (connectionId: string, field: string, value: boolean) => {
    setConnections((prev) => prev.map((c) => c.id === connectionId ? { ...c, [field]: value } : c));
    await fetch('/api/therapist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId, [field]: value }),
    });
  };

  const revoke = async (connectionId: string) => {
    if (!confirm('Revoke this therapist\'s access? They will no longer be able to view your data.')) return;
    await fetch('/api/therapist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId, action: 'revoke' }),
    });
    fetchConnections();
  };

  if (loading) return <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5"><div className="h-32 animate-pulse bg-surface-container-low rounded-lg" /></div>;

  const active = connections.filter((c) => c.status === 'accepted');
  const pending = connections.filter((c) => c.status === 'pending');

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-lg">medical_services</span>
          <h3 className="text-sm font-semibold text-on-surface">Therapist Access</h3>
        </div>
        {connections.length < 3 && (
          <button onClick={() => setShowInvite(!showInvite)}
            className="text-xs text-primary hover:text-primary font-medium">
            {showInvite ? 'Cancel' : '+ Invite therapist'}
          </button>
        )}
      </div>

      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
        Give your therapist or counselor read-only access to your journal, moods, and progress.
        You control exactly what they can see, and you can revoke access anytime.
      </p>

      {/* Invite form */}
      {showInvite && (
        <div className="mb-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-3">
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Their email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="therapist@practice.com"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Their name <span className="text-on-surface-variant font-normal">(optional)</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Smith"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={sendInvite} disabled={!email.trim() || sending}
            className="w-full py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary disabled:opacity-50">
            {sending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      )}

      {/* Active connections with consent toggles */}
      {active.map((conn) => (
        <div key={conn.id} className="mb-3 p-4 rounded-xl border border-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-on-surface">{conn.therapist_name || conn.therapist_email}</p>
              <p className="text-xs text-on-surface-variant">{conn.therapist_email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">Connected</span>
              <button onClick={() => revoke(conn.id)} className="text-xs text-red-400 hover:text-red-600">Revoke</button>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant mb-2 font-medium">What they can see:</p>
          <div className="space-y-1.5">
            {CONSENT_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-xs text-on-surface">{item.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                </div>
                <button
                  onClick={() => updateConsent(conn.id, item.key, !(conn as any)[item.key])}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    (conn as any)[item.key] ? 'bg-primary' : 'bg-surface-container'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    (conn as any)[item.key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pending invites */}
      {pending.map((conn) => (
        <div key={conn.id} className="mb-2 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-800">{conn.therapist_name || conn.therapist_email}</p>
            <p className="text-xs text-amber-600">Invite pending</p>
          </div>
          <span className="material-symbols-outlined text-xs text-amber-500">hourglass_empty</span>
        </div>
      ))}

      {connections.length === 0 && !showInvite && (
        <p className="text-sm text-on-surface-variant text-center py-2">No therapist connections yet</p>
      )}
    </div>
  );
}
