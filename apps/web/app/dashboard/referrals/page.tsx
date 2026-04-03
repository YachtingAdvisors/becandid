'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Types ───────────────────────────────────────────────── */

interface ReferralStats {
  referralCode: string | null;
  referralCount: number;
  totalDaysEarned: number;
  referredUsers: Array<{ name: string; date: string }>;
}

/* ── Helpers ─────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/* ── Page ────────────────────────────────────────────────── */

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  async function generateCode() {
    setGenerating(true);
    try {
      // The profile PATCH endpoint auto-generates a referral code if missing
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generate_referral_code: true }),
      });
      if (res.ok) {
        await fetchStats();
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(text: string, setter: (v: boolean) => void) {
    copyToClipboard(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  }

  const referralLink = stats?.referralCode
    ? `https://becandid.io/r/${stats.referralCode}`
    : '';

  const shareMessage = `I've been using Be Candid to align my digital life with my values. It's been a game-changer for building real accountability. Try it: ${referralLink}`;

  /* ── Loading ───────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-surface-container rounded-xl w-48 animate-pulse" />
        <div className="h-40 bg-surface-container rounded-3xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty State (no code yet) ─────────────────────────── */

  if (!stats?.referralCode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 stagger">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            group_add
          </span>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Referrals</h1>
            <p className="text-sm text-on-surface-variant font-body">Invite friends and earn free premium days.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-8 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary/30" style={{ fontVariationSettings: "'FILL' 1" }}>
            card_giftcard
          </span>
          <h2 className="font-headline text-lg font-bold text-on-surface">Share Be Candid</h2>
          <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
            Generate your unique referral code. When someone signs up using your code, you both get 30 days of premium free.
          </p>
          <button
            onClick={generateCode}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {generating ? 'hourglass_empty' : 'key'}
            </span>
            {generating ? 'Generating...' : 'Generate Referral Code'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Main Render ───────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          group_add
        </span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Referrals</h1>
          <p className="text-sm text-on-surface-variant font-body">Invite friends and earn free premium days.</p>
        </div>
      </div>

      {/* Referral Code + Link */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-6 space-y-4">
        {/* Code */}
        <div>
          <label className="block text-xs font-label font-medium text-on-surface-variant mb-2 uppercase tracking-wider">
            Your Referral Code
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-5 py-3.5 rounded-2xl bg-surface-container-low font-headline text-xl font-bold text-on-surface tracking-widest text-center select-all">
              {stats.referralCode}
            </div>
            <button
              onClick={() => handleCopy(stats.referralCode!, setCopiedCode)}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-primary text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {copiedCode ? 'check' : 'content_copy'}
              </span>
              {copiedCode ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Link */}
        <div>
          <label className="block text-xs font-label font-medium text-on-surface-variant mb-2 uppercase tracking-wider">
            Referral Link
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-low font-body text-sm text-on-surface truncate select-all">
              {referralLink}
            </div>
            <button
              onClick={() => handleCopy(referralLink, setCopiedLink)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl ring-1 ring-primary text-primary text-sm font-label font-bold hover:bg-primary/5 transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {copiedLink ? 'check' : 'link'}
              </span>
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center">
          <div className="text-2xl font-headline font-bold text-primary">{stats.referralCount}</div>
          <div className="text-xs font-label text-on-surface-variant mt-1">Signups</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center">
          <div className="text-2xl font-headline font-bold text-primary">{stats.referredUsers.length}</div>
          <div className="text-xs font-label text-on-surface-variant mt-1">Converted</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center">
          <div className="text-2xl font-headline font-bold text-emerald-600">{stats.totalDaysEarned}</div>
          <div className="text-xs font-label text-on-surface-variant mt-1">Days Earned</div>
        </div>
      </div>

      {/* Referral List */}
      {stats.referredUsers.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/20">
            <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary">people</span>
              Referred Friends
            </h2>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {stats.referredUsers.map((user, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-headline font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-sm font-medium text-on-surface truncate">{user.name}</p>
                  <p className="font-body text-xs text-on-surface-variant">{formatDate(user.date)}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 ring-1 ring-emerald-200/50 text-emerald-700 text-xs font-label font-bold flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Joined
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Card */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-lg p-6 space-y-4">
        <h2 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">share</span>
          Share with a Friend
        </h2>
        <div className="px-4 py-3 rounded-2xl bg-surface-container-low">
          <p className="font-body text-sm text-on-surface leading-relaxed italic">
            &ldquo;{shareMessage}&rdquo;
          </p>
        </div>
        <button
          onClick={() => handleCopy(shareMessage, setCopiedMessage)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-on-primary text-sm font-label font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">
            {copiedMessage ? 'check' : 'content_copy'}
          </span>
          {copiedMessage ? 'Copied to Clipboard!' : 'Copy Message'}
        </button>
      </div>
    </div>
  );
}
