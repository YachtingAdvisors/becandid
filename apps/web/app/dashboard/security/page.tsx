'use client';

import { useState, useEffect } from 'react';

interface Session {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  ip_display: string;
  city: string | null;
  country: string | null;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

interface HeartbeatStatus {
  app_running: boolean;
  monitoring_enabled: boolean;
  last_heartbeat: string | null;
  mismatch?: boolean;
  isolation_only?: boolean;
}

function getDeviceIcon(deviceName: string): string {
  if (deviceName.includes('iPhone') || deviceName.includes('Android')) return 'smartphone';
  if (deviceName.includes('iPad') || deviceName.includes('Tablet')) return 'tablet';
  if (deviceName.includes('Mac')) return 'laptop_mac';
  if (deviceName.includes('Windows')) return 'laptop_windows';
  if (deviceName.includes('Linux')) return 'computer';
  return 'devices';
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
  const [heartbeat, setHeartbeat] = useState<HeartbeatStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [revokeError, setRevokeError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/sessions').then((r) => (r.ok ? r.json() : { sessions: [] })),
      fetch('/api/heartbeat').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([sessionData, heartbeatData]) => {
        setSessions(sessionData.sessions ?? []);
        setHeartbeat(heartbeatData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function revokeSession(id: string) {
    const previousSessions = sessions;
    setSessions(prev => prev.filter(s => s.id !== id));
    setRevokeError('');
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to revoke session');
    } catch {
      setSessions(previousSessions);
      setRevokeError('Failed to revoke session. Please try again.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span> Security
        </h1>
        <p className="text-sm text-on-surface-variant font-body">Review your login activity and manage sessions.</p>
      </div>

      {revokeError && (
        <div className="bg-error/10 rounded-2xl px-4 py-3 text-xs text-error font-body flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          {revokeError}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Desktop Health</h2>
            <p className="text-xs text-on-surface-variant mt-0.5 font-body">Live heartbeat from the desktop monitor.</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            heartbeat?.app_running ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {heartbeat?.app_running ? 'desktop_windows' : 'desktop_access_disabled'}
            </span>
            {heartbeat?.app_running ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Monitoring</div>
            <div className="mt-1 text-sm text-on-surface font-medium">
              {heartbeat?.isolation_only
                ? 'Optional for your current goals'
                : heartbeat?.monitoring_enabled ? 'Enabled' : 'Paused'}
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Last Heartbeat</div>
            <div className="mt-1 text-sm text-on-surface font-medium">
              {heartbeat?.last_heartbeat ? timeAgo(heartbeat.last_heartbeat) : 'No heartbeat yet'}
            </div>
          </div>
        </div>
        {heartbeat?.mismatch && (
          <div className="rounded-2xl bg-amber-100 px-4 py-3 text-xs text-amber-800 font-body flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            The desktop app looks stale for this account. Re-open the desktop app and confirm it is signed into the same account.
          </div>
        )}
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
            {sessions.map((session) => {
              return (
              <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low mx-3 transition-all duration-200">
                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">{getDeviceIcon(session.device_name)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface font-label flex items-center gap-2">
                    {session.device_name} · {session.browser}
                    {session.is_current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Current</span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {session.ip_display}
                    {session.city && ` · ${session.city}`}
                    {session.country && `, ${session.country}`}
                    {' · '}{timeAgo(session.last_active_at)}
                  </div>
                </div>
                {!session.is_current && (
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
          <a href="/api/privacy" download className="inline-flex items-center gap-1 px-4 py-2 min-h-[44px] text-xs font-headline font-bold text-primary ring-1 ring-outline-variant/10 rounded-full hover:bg-primary-container/20 cursor-pointer transition-all duration-200">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </a>
        </div>
      </div>
    </div>
  );
}
