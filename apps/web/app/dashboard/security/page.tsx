'use client';

import { useState, useEffect } from 'react';

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  city: string | null;
  country: string | null;
  created_at: string;
  last_seen: string;
}

function parseUA(ua: string): string {
  if (ua.includes('iPhone')) return '📱 iPhone';
  if (ua.includes('Android')) return '📱 Android';
  if (ua.includes('iPad')) return '📱 iPad';
  if (ua.includes('Mac')) return '💻 Mac';
  if (ua.includes('Windows')) return '💻 Windows';
  if (ua.includes('Linux')) return '💻 Linux';
  return '🌐 Browser';
}

function parseBrowser(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function revokeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    await fetch('/api/auth/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Security</h1>
        <p className="text-sm text-ink-muted">Review your login activity and manage sessions.</p>
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-display text-lg font-semibold text-ink">Login Activity</h2>
          <p className="text-xs text-ink-muted mt-0.5">Recent logins and active sessions</p>
        </div>

        {loading ? (
          <div className="p-5 animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-muted">No sessions recorded yet.</div>
        ) : (
          <div className="divide-y divide-surface-border/50">
            {sessions.map((session, i) => (
              <div key={session.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="text-lg flex-shrink-0">{parseUA(session.user_agent).split(' ')[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink flex items-center gap-2">
                    {parseUA(session.user_agent).split(' ').slice(1).join(' ')} · {parseBrowser(session.user_agent)}
                    {i === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">CURRENT</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {session.ip_address}
                    {session.city && ` · ${session.city}`}
                    {session.country && `, ${session.country}`}
                    {' · '}{timeAgo(session.last_seen)}
                  </div>
                </div>
                {i > 0 && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="card p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Password</h2>
        <p className="text-xs text-ink-muted">Change your password to keep your account secure.</p>
        <a href="/auth/reset" className="btn-ghost inline-flex text-sm">Change Password →</a>
      </div>

      {/* Data & Privacy */}
      <div className="card p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Data & Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Export your data</div>
            <div className="text-xs text-ink-muted">Download everything as JSON (GDPR compliant)</div>
          </div>
          <a href="/api/account" download className="px-3 py-1.5 text-xs font-medium text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50">
            Export
          </a>
        </div>
      </div>
    </div>
  );
}
