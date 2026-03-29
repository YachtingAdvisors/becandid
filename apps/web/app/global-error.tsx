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
      <body className="min-h-screen bg-surface flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Something went wrong
          </h1>
          <p className="text-sm text-ink-muted mb-8 leading-relaxed">
            An unexpected error occurred. This has been logged and our team will look into it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 text-sm font-medium text-ink-muted rounded-xl hover:bg-gray-100 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
