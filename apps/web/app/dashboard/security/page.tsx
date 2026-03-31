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

function parseUA(ua: string): { icon: string; label: string } {
  if (ua.includes('iPhone')) return { icon: 'smartphone', label: 'iPhone' };
  if (ua.includes('Android')) return { icon: 'smartphone', label: 'Android' };
  if (ua.includes('iPad')) return { icon: 'tablet', label: 'iPad' };
  if (ua.includes('Mac')) return { icon: 'laptop_mac', label: 'Mac' };
  if (ua.includes('Windows')) return { icon: 'laptop_windows', label: 'Windows' };
  if (ua.includes('Linux')) return { icon: 'computer', label: 'Linux' };
  return { icon: 'language', label: 'Browser' };
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
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span> Security
        </h1>
        <p className="text-sm text-on-surface-variant font-body">Review your login activity and manage sessions.</p>
      </div>

      {/* Active Sessions */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
        <div className="px-6 py-4 border-b border-outline-variant/30">
          <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Login Activity</h2>
          <p className="text-xs text-on-surface-variant mt-0.5 font-body">Recent logins and active sessions</p>
        </div>

        {loading ? (
          <div className="p-6 animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-container-low rounded-xl" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant font-body">No sessions recorded yet.</div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {sessions.map((session, i) => {
              const device = parseUA(session.user_agent);
              return (
              <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low mx-3 transition-all duration-200">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">{device.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface font-label flex items-center gap-2">
                    {device.label} · {parseBrowser(session.user_agent)}
                    {i === 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Current</span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {session.ip_address}
                    {session.city && ` · ${session.city}`}
                    {session.country && `, ${session.country}`}
                    {' · '}{timeAgo(session.last_seen)}
                  </div>
                </div>
                {i > 0 && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-xs text-error hover:text-error/80 font-headline font-bold flex-shrink-0 cursor-pointer transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    Revoke
                  </button>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-3">
        <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Password</h2>
        <p className="text-xs text-on-surface-variant font-body">Change your password to keep your account secure.</p>
        <a href="/auth/reset" className="inline-flex items-center gap-1 bg-primary text-on-primary rounded-full font-headline font-bold text-sm px-4 py-2 min-h-[44px] cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl hover:opacity-90 transition-all duration-200">
          <span className="material-symbols-outlined text-sm">key</span> Change Password
        </a>
      </div>

      {/* Data & Privacy */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-3">
        <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Data & Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-on-surface">Export your data</div>
            <div className="text-xs text-on-surface-variant font-body">Download everything as JSON (GDPR compliant)</div>
          </div>
          <a href="/api/account" download className="inline-flex items-center gap-1 px-4 py-2 min-h-[44px] text-xs font-headline font-bold text-primary ring-1 ring-outline-variant/10 rounded-full hover:bg-primary-container/20 cursor-pointer transition-all duration-200">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </a>
        </div>
      </div>
    </div>
  );
}
