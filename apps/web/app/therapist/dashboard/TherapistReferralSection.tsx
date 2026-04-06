'use client';

import { useState, useEffect, useCallback } from 'react';

const APP_URL = 'https://becandid.io';
const REFERRALS_FOR_REWARD = 3;

const REFERRAL_MESSAGE = `I recommend Be Candid to my clients for digital accountability between sessions. It gives me real-time insight into patterns through the therapist portal. Try it:`;

interface ReferralStats {
  code: string | null;
  total: number;
  signed_up: number;
  subscribed: number;
  rewards_earned: number;
  progress: number;
}

export default function TherapistReferralSection() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<'code' | 'link' | 'message' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/therapist/referrals');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // Silent — stats are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function generateCode() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/therapist/referrals', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate code');
        return;
      }
      await fetchStats();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text: string, type: 'code' | 'link' | 'message') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 animate-pulse">
        <div className="h-6 w-48 bg-surface-container rounded-lg mb-4" />
        <div className="h-4 w-full bg-surface-container rounded-lg mb-2" />
        <div className="h-4 w-3/4 bg-surface-container rounded-lg" />
      </div>
    );
  }

  const referralLink = stats?.code
    ? `${APP_URL}/r/${stats.code}?ref=therapist`
    : null;

  const fullMessage = referralLink
    ? `${REFERRAL_MESSAGE} ${referralLink}`
    : null;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-primary text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          handshake
        </span>
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Referral Program
          </h2>
          <p className="text-xs text-on-surface-variant font-body">
            Refer 3 clients who subscribe and earn 1 free month of the Therapy tier.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container text-sm font-body rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      {!stats?.code ? (
        /* No code yet — prompt to generate */
        <div className="text-center py-4">
          <p className="text-sm text-on-surface-variant font-body mb-4">
            Generate your unique referral code to start referring clients.
          </p>
          <button
            onClick={generateCode}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-headline font-bold text-sm transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {generating ? 'progress_activity' : 'add_link'}
            </span>
            {generating ? 'Generating...' : 'Generate Referral Code'}
          </button>
        </div>
      ) : (
        <>
          {/* Referral code display */}
          <div className="bg-surface-container rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant font-label">Your referral code</p>
                <p className="text-lg font-headline font-bold text-on-surface tracking-wider mt-0.5">
                  {stats.code}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(stats.code!, 'code')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-label font-medium hover:brightness-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied === 'code' ? 'check' : 'content_copy'}
                </span>
                {copied === 'code' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {referralLink && (
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
                <div className="min-w-0 mr-3">
                  <p className="text-xs text-on-surface-variant font-label">Shareable link</p>
                  <p className="text-xs font-body text-on-surface truncate mt-0.5">
                    {referralLink}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-label font-medium hover:brightness-95 transition-all flex-shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === 'link' ? 'check' : 'link'}
                  </span>
                  {copied === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>

          {/* Pre-written message */}
          {fullMessage && (
            <div className="bg-surface-container rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant font-label mb-1.5">
                    Pre-written referral message
                  </p>
                  <p className="text-sm font-body text-on-surface leading-relaxed">
                    &ldquo;{REFERRAL_MESSAGE} <span className="text-primary">{referralLink}</span>&rdquo;
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(fullMessage, 'message')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-label font-medium hover:brightness-95 transition-all flex-shrink-0 mt-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === 'message' ? 'check' : 'content_copy'}
                  </span>
                  {copied === 'message' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container rounded-2xl p-3 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {stats.total}
              </p>
              <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-0.5">
                Referred
              </p>
            </div>
            <div className="bg-surface-container rounded-2xl p-3 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {stats.signed_up}
              </p>
              <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-0.5">
                Signed Up
              </p>
            </div>
            <div className="bg-surface-container rounded-2xl p-3 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {stats.subscribed}
              </p>
              <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider mt-0.5">
                Subscribed
              </p>
            </div>
          </div>

          {/* Reward progress */}
          <div className="bg-surface-container rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-label text-on-surface-variant">
                Reward progress
              </p>
              <p className="text-xs font-label font-medium text-on-surface">
                {stats.progress} / {REFERRALS_FOR_REWARD} subscribed referrals
              </p>
            </div>
            <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.progress / REFERRALS_FOR_REWARD) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant font-body mt-2">
              {stats.rewards_earned > 0
                ? `You've earned ${stats.rewards_earned} free month${stats.rewards_earned === 1 ? '' : 's'} so far!`
                : `Refer ${REFERRALS_FOR_REWARD - stats.progress} more subscribing client${REFERRALS_FOR_REWARD - stats.progress === 1 ? '' : 's'} to earn a free month.`
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}
