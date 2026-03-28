'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to our error endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errors: [{
          message: error.message,
          digest: error.digest,
          stack: error.stack?.slice(0, 1000),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        }],
      }),
    }).catch(() => {});
  }, [error]);
  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            An unexpected error occurred. This has been logged and we'll look into it.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
