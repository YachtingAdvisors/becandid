'use client';

import { useState } from 'react';

interface ChipShareButtonProps {
  milestone: number;
  tierName: string;
}

export default function ChipShareButton({ milestone, tierName }: ChipShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `I just earned my ${tierName} Focus Chip - ${milestone} days of focus on Be Candid! #BeCandid #FocusChip`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: 'https://becandid.io' });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-label font-bold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 cursor-pointer"
    >
      <span className="material-symbols-outlined text-xs">share</span>
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
