'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';

// ─── Types ───────────────────────────────────────────────────

type Audience = 'all' | 'pro' | 'therapy' | 'free' | 'trialing';

interface BroadcastEntry {
  id: string;
  subject: string;
  audience: string;
  sent: number;
  failed: number;
  total: number;
  created_at: string;
}

interface AudienceOption {
  value: Audience;
  label: string;
  icon: string;
}

const AUDIENCES: AudienceOption[] = [
  { value: 'all', label: 'All Users', icon: 'group' },
  { value: 'pro', label: 'Pro', icon: 'star' },
  { value: 'therapy', label: 'Therapy', icon: 'psychology' },
  { value: 'free', label: 'Free', icon: 'person' },
  { value: 'trialing', label: 'Trialing', icon: 'hourglass_top' },
];

// ─── Component ───────────────────────────────────────────────

export default function AdminEmailClient() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<BroadcastEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch audience count when audience changes
  const fetchAudienceCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const res = await fetch(`/api/admin/stats`);
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      const subs = data.subscriptions || {};
      if (audience === 'all') {
        setAudienceCount(data.total_users ?? 0);
      } else if (audience === 'pro') {
        setAudienceCount(subs.pro ?? 0);
      } else if (audience === 'therapy') {
        setAudienceCount(subs.therapy ?? 0);
      } else if (audience === 'free') {
        setAudienceCount(subs.free ?? 0);
      } else if (audience === 'trialing') {
        setAudienceCount(subs.trialing ?? 0);
      }
    } catch {
      setAudienceCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, [audience]);

  useEffect(() => {
    fetchAudienceCount();
  }, [fetchAudienceCount]);

  // Fetch broadcast history
  useEffect(() => {
    fetch('/api/admin/email')
      .then((r) => (r.ok ? r.json() : { history: [] }))
      .then((d) => setHistory(d.history || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [result]);

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, audience }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send');
        return;
      }

      setResult({ sent: data.sent, failed: data.failed });
      setSubject('');
      setBody('');
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* ── Compose Form ─────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">mail</span>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Compose Broadcast
          </h2>
        </div>

        {/* Audience pills */}
        <div className="space-y-2">
          <label className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
            Audience
          </label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-label font-medium
                  transition-all duration-200
                  ${
                    audience === opt.value
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }
                `}
              >
                <span className="material-symbols-outlined text-base">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant font-body">
            {loadingCount ? (
              'Counting...'
            ) : audienceCount !== null ? (
              <>
                This will be sent to{' '}
                <span className="font-semibold text-on-surface">
                  {audienceCount.toLocaleString()}
                </span>{' '}
                user{audienceCount !== 1 ? 's' : ''}
                {audienceCount > 500 && (
                  <span className="text-warning"> (capped at 500 per batch)</span>
                )}
              </>
            ) : (
              'Unable to load count'
            )}
          </p>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label
            htmlFor="broadcast-subject"
            className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            Subject
          </label>
          <input
            id="broadcast-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            maxLength={200}
            className="w-full px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-lowest
                       text-on-surface placeholder:text-on-surface-variant/50 text-sm font-body
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       transition-colors"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label
            htmlFor="broadcast-body"
            className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            Body
          </label>
          <textarea
            id="broadcast-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email content here. HTML is supported..."
            rows={8}
            maxLength={10000}
            className="w-full px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-lowest
                       text-on-surface placeholder:text-on-surface-variant/50 text-sm font-body
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       transition-colors resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!canSend}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-label font-medium
                       bg-surface-container text-on-surface-variant hover:bg-surface-container-high
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-base">preview</span>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSend || sending}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-label font-semibold
                       bg-primary text-on-primary hover:bg-primary/90 shadow-sm
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-base">send</span>
            {sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>

        {/* Result toast */}
        {result && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 text-sm font-body">
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
            <span className="text-on-surface">
              Sent to <span className="font-semibold">{result.sent}</span> user
              {result.sent !== 1 ? 's' : ''}
              {result.failed > 0 && (
                <span className="text-error"> ({result.failed} failed)</span>
              )}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-error/10 text-sm font-body">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="text-error">{error}</span>
          </div>
        )}
      </div>

      {/* ── Email Preview ────────────────────────────────────── */}
      {showPreview && canSend && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">visibility</span>
            <h2 className="font-headline text-lg font-bold text-on-surface">Preview</h2>
          </div>
          <div className="bg-white rounded-2xl border border-outline-variant p-6 max-w-lg mx-auto">
            <div className="text-center mb-4">
              <span className="inline-block bg-[#226779] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                Be Candid
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{subject}</h2>
              <div
                className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(body, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ['src', 'alt', 'width', 'height', 'style'],
                    a: ['href', 'target', 'rel', 'style'],
                    '*': ['style', 'class'],
                  },
                  allowedSchemes: ['http', 'https', 'mailto'],
                }) }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Be Candid &mdash; becandid.io
            </p>
          </div>
        </div>
      )}

      {/* ── Confirm Dialog ───────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 max-w-sm w-full mx-4 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-warning text-2xl">warning</span>
              <h3 className="font-headline text-lg font-bold text-on-surface">
                Confirm Send
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant font-body">
              Are you sure? This sends to{' '}
              <span className="font-semibold text-on-surface">
                {audienceCount !== null
                  ? Math.min(audienceCount, 500).toLocaleString()
                  : '...'}
              </span>{' '}
              user{audienceCount !== 1 ? 's' : ''} in the{' '}
              <span className="font-semibold text-on-surface">{audience}</span> audience.
            </p>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-full text-sm font-label font-medium
                           bg-surface-container text-on-surface-variant hover:bg-surface-container-high
                           transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-5 py-2 rounded-full text-sm font-label font-semibold
                           bg-error text-on-error hover:bg-error/90 shadow-sm transition-colors"
              >
                Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send History ─────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Broadcast History
          </h2>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-2xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-on-surface-variant font-body py-4 text-center">
            No broadcasts sent yet.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-label font-semibold text-on-surface truncate">
                    {entry.subject}
                  </p>
                  <p className="text-xs text-on-surface-variant font-body mt-0.5">
                    {entry.audience} &middot; {entry.sent} sent
                    {entry.failed > 0 && (
                      <span className="text-error"> &middot; {entry.failed} failed</span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant font-body whitespace-nowrap ml-4">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
