'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegenerateGuideProps {
  alertId: string;
}

export default function RegenerateGuide({ alertId }: RegenerateGuideProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegenerate() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/conversation/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Failed to regenerate');
      setLoading(false);
      return;
    }

    // Reload the page to show the new guide
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary-container/30 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Regenerating…
          </>
        ) : (
          <><span className="material-symbols-outlined text-sm align-middle">refresh</span> Regenerate Guide</>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
