'use client';

import { useState, useEffect, useCallback } from 'react';

export default function TherapistBadgeSection() {
  const [therapistName, setTherapistName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState<'html' | 'iframe' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch therapist profile info
        const [profileRes, referralRes] = await Promise.all([
          fetch('/api/therapist'),
          fetch('/api/therapist/referrals'),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          // Use the therapist's display name from their connections
          if (data.as_therapist?.[0]?.users?.full_name) {
            setTherapistName(data.as_therapist[0].users.full_name);
          }
        }

        if (referralRes.ok) {
          const data = await referralRes.json();
          if (data.code) setReferralCode(data.code);
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const badgeUrl = referralCode
    ? `https://becandid.io/embed/therapist-badge/${encodeURIComponent(referralCode)}?theme=${theme}`
    : '';

  const referralLink = referralCode
    ? `https://becandid.io/r/${referralCode}?ref=badge`
    : 'https://becandid.io';

  const htmlSnippet = `<a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
  <div style="display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:12px;background:${theme === 'dark' ? '#0c1214' : '#ffffff'};border:1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};font-family:system-ui,sans-serif;">
    <div style="width:32px;height:32px;border-radius:50%;border:2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.8)' : '#226779'};display:flex;align-items:center;justify-content:center;">
      <span style="font-size:18px;font-weight:300;color:${theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#226779'};">C</span>
    </div>
    <div>
      <div style="font-size:13px;font-weight:600;color:${theme === 'dark' ? '#fff' : '#1c1917'};">Recommended by ${therapistName || 'Your Therapist'}</div>
      <div style="font-size:11px;color:${theme === 'dark' ? '#a8a29e' : '#78716c'};">Powered by Be Candid</div>
    </div>
  </div>
</a>`;

  const iframeSnippet = `<iframe src="${badgeUrl}" width="300" height="64" style="border:none;" title="Be Candid — Recommended by ${therapistName || 'Therapist'}"></iframe>`;

  const copyToClipboard = useCallback(async (text: string, type: 'html' | 'iframe') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-4" />
        <div className="h-20 bg-white/10 rounded" />
      </div>
    );
  }

  if (!referralCode) {
    return (
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">badge</span>
          Website Badge
        </h2>
        <p className="text-sm text-stone-400">
          Generate a referral code above first, then you can embed a recommendation badge on your website.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-xl">badge</span>
        Website Badge
      </h2>
      <p className="text-sm text-stone-400 mb-6">
        Add this badge to your website. Every visitor who clicks it counts as a referral.
      </p>

      {/* Theme Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-stone-400">Theme:</span>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            theme === 'dark' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            theme === 'light' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          Light
        </button>
      </div>

      {/* Preview */}
      <div className={`rounded-xl p-6 mb-6 flex items-center justify-center ${theme === 'dark' ? 'bg-black/40' : 'bg-white/90'}`}>
        <a
          href={referralLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block no-underline"
        >
          <div
            className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${
              theme === 'dark'
                ? 'bg-[#0c1214] border-white/10'
                : 'bg-white border-black/10'
            }`}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                theme === 'dark' ? 'border-white/80' : 'border-[#226779]'
              }`}
            >
              <span
                className={`text-lg font-light ${
                  theme === 'dark' ? 'text-white/90' : 'text-[#226779]'
                }`}
              >
                C
              </span>
            </div>
            <div>
              <div
                className={`text-[13px] font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-stone-900'
                }`}
              >
                Recommended by {therapistName || 'Your Therapist'}
              </div>
              <div
                className={`text-[11px] ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                Powered by Be Candid
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* HTML Embed */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-stone-300">HTML Embed Code</h3>
          <button
            onClick={() => copyToClipboard(htmlSnippet, 'html')}
            className="text-xs px-3 py-1 rounded-md bg-white/10 text-stone-300 hover:bg-white/20 transition-colors"
          >
            {copied === 'html' ? 'Copied!' : 'Copy HTML'}
          </button>
        </div>
        <pre className="text-xs text-stone-500 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-24">
          {htmlSnippet}
        </pre>
      </div>

      {/* Iframe Embed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-stone-300">Iframe Embed</h3>
          <button
            onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
            className="text-xs px-3 py-1 rounded-md bg-white/10 text-stone-300 hover:bg-white/20 transition-colors"
          >
            {copied === 'iframe' ? 'Copied!' : 'Copy Iframe'}
          </button>
        </div>
        <pre className="text-xs text-stone-500 bg-black/30 rounded-lg p-3 overflow-x-auto">
          {iframeSnippet}
        </pre>
      </div>
    </div>
  );
}
