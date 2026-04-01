'use client';

import { useState, useCallback } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ShareButton({ url, title, text, className = '', size = 'md' }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : url;

  const handleShare = useCallback(async () => {
    // Try native Web Share API first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
        return;
      } catch {
        // User cancelled or not supported — fall through to menu
      }
    }
    setShowMenu(!showMenu);
  }, [title, text, fullUrl, showMenu]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setShowMenu(false); }, 1500);
  }, [fullUrl]);

  const shareToX = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=550,height=420',
    );
    setShowMenu(false);
  }, [text, fullUrl]);

  const shareToFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=550,height=420',
    );
    setShowMenu(false);
  }, [fullUrl]);

  const iconSize = size === 'sm' ? 'text-base' : 'text-xl';
  const padSize = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`${padSize} rounded-full hover:bg-primary/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
        title="Share"
      >
        <span className={`material-symbols-outlined ${iconSize} text-on-surface-variant`}>share</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest rounded-xl shadow-xl ring-1 ring-outline-variant/20 p-1.5 min-w-[160px]">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-label text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={shareToX}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-label text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Share on X
            </button>
            <button
              onClick={shareToFacebook}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-label text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Share on Facebook
            </button>
          </div>
        </>
      )}
    </div>
  );
}
