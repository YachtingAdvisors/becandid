'use client';

import { useState, useEffect, useCallback } from 'react';

interface Session {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  ip_display: string;
  city: string | null;
  country: string | null;
  last_active_at: string;
  created_at: string;
  is_current: boolean;
}

const DEVICE_ICONS: Record<string, string> = {
  iPhone: 'phone_iphone',
  iPad: 'tablet_mac',
  'Android Phone': 'phone_android',
  'Android Tablet': 'tablet_android',
  Mac: 'laptop_mac',
  'Windows PC': 'computer',
  Chromebook: 'laptop_chromebook',
  Linux: 'computer',
};

function getDeviceIcon(deviceName: string): string {
  return DEVICE_ICONS[deviceName] || 'devices';
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/sessions');
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      setError('Could not load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError('');
    try {
      const res = await fetch(`/api/auth/sessions?session_id=${sessionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to revoke session');
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setError('Failed to sign out that device');
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllOther = async () => {
    setRevokingAll(true);
    setError('');
    try {
      const res = await fetch('/api/auth/sessions?all=true', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to revoke sessions');
      setSessions((prev) => prev.filter((s) => s.is_current));
    } catch {
      setError('Failed to sign out other devices');
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.is_current);
  const currentSession = sessions.find((s) => s.is_current);
  const orderedSessions = [
    ...(currentSession ? [currentSession] : []),
    ...otherSessions,
  ];

  if (loading) {
    return (
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
        <h2 className="font-headline text-lg font-bold text-on-surface">Active Sessions</h2>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
          Loading sessions...
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Active Sessions</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Devices where your account is currently signed in.
          </p>
        </div>
        <span className="material-symbols-outlined text-xl text-on-surface-variant">security</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-error-container/30 text-error text-xs font-label">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-6 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl mb-2 block">devices</span>
          No active sessions found.
        </div>
      ) : (
        <div className="space-y-2">
          {orderedSessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors duration-200 ${
                session.is_current
                  ? 'bg-primary-container/15 ring-1 ring-primary/20'
                  : 'bg-surface-container-low/50 hover:bg-surface-container-low'
              }`}
            >
              {/* Device icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                session.is_current
                  ? 'bg-primary-container text-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {getDeviceIcon(session.device_name)}
                </span>
              </div>

              {/* Session info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-label font-semibold text-on-surface truncate">
                    {session.browser} on {session.os}
                  </span>
                  {session.is_current && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label font-semibold bg-primary text-on-primary">
                      <span className="material-symbols-outlined text-[10px]">check_circle</span>
                      This device
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-body mt-0.5">
                  <span>{session.device_name}</span>
                  <span className="text-outline-variant">&#183;</span>
                  <span>{session.ip_display}</span>
                  <span className="text-outline-variant">&#183;</span>
                  <span>{timeAgo(session.last_active_at)}</span>
                </div>
              </div>

              {/* Revoke button */}
              {!session.is_current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revokingId === session.id}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-label font-medium text-error border border-error/20 rounded-2xl hover:bg-error/5 disabled:opacity-50 cursor-pointer transition-all duration-200"
                >
                  {revokingId === session.id ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">logout</span>
                  )}
                  Sign out
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sign out all other devices */}
      {otherSessions.length > 0 && (
        <div className="pt-2 border-t border-outline-variant/30">
          <button
            onClick={revokeAllOther}
            disabled={revokingAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-label font-medium text-error border border-error/20 rounded-2xl hover:bg-error/5 disabled:opacity-50 cursor-pointer transition-all duration-200"
          >
            {revokingAll ? (
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">logout</span>
            )}
            Sign out all other devices
          </button>
        </div>
      )}
    </section>
  );
}
