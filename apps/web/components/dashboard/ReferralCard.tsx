'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';

interface ReferralStats {
  referralCode: string | null;
  referralCount: number;
  totalDaysEarned: number;
  referredUsers: Array<{ name: string; date: string }>;
}

export default function ReferralCard() {
  const { data: stats } = useSWR<ReferralStats>('/api/referrals');
  const [copied, setCopied] = useState(false);

  const referralUrl = stats?.referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${stats.referralCode}`
    : '';

  const copyLink = useCallback(async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralUrl]);

  const handleShare = useCallback(async () => {
    if (!referralUrl) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Be Candid',
          text: 'I use Be Candid to align my digital life. Join me and we both get 30 days free!',
          url: referralUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  }, [referralUrl, copyLink]);

  if (!stats?.referralCode) return null;

  return (
    <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-md p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary-container rounded-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            group_add
          </span>
        </div>
        <div>
          <h3 className="font-headline text-base font-bold text-on-surface">Invite Friends</h3>
          <p className="text-xs text-on-surface-variant font-body">
            Both of you get <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-label font-bold text-[11px] tracking-wide">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
              30 DAYS FREE
            </span>
          </p>
        </div>
      </div>

      {/* Referral link */}
      <div className="flex gap-2">
        <div className="flex-1 px-4 py-2.5 bg-surface-container-low rounded-xl text-sm font-mono text-on-surface-variant truncate">
          {referralUrl}
        </div>
        <button
          onClick={copyLink}
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-full bg-primary-container text-on-primary-container text-sm font-label font-bold hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-base">share</span>
        Share Your Link
      </button>

      {/* Stats */}
      {stats.referralCount > 0 && (
        <div className="pt-3 border-t border-outline-variant/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant font-label">Friends joined</span>
            <span className="font-bold text-on-surface font-headline">{stats.referralCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant font-label">Free days earned</span>
            <span className="font-bold text-primary font-headline">{stats.totalDaysEarned}</span>
          </div>

          {stats.referredUsers.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {stats.referredUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                  <span className="font-medium">{u.name}</span>
                  <span className="text-on-surface-variant/50">
                    {new Date(u.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
