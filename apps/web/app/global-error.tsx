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
      <body
        className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden"
        style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
      >
        {/* Subtle background blobs */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 rounded-full blur-3xl"
          style={{ width: 500, height: 500, background: 'rgba(250,116,111,0.08)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-40 rounded-full blur-3xl"
          style={{ width: 400, height: 400, background: 'rgba(164,228,248,0.12)' }}
        />

        <div className="text-center max-w-sm relative z-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(250,116,111,0.12)', boxShadow: '0 0 0 1px rgba(177,178,178,0.1)' }}
          >
            <span className="material-symbols-outlined text-5xl" style={{ color: '#a83836' }}>error</span>
          </div>
          <h1
            className="text-3xl font-extrabold text-on-surface mb-3"
            style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
          >
            Something went wrong
          </h1>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            An unexpected error occurred. This has been logged and our team will look into it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm font-semibold rounded-full hover:bg-primary-dim transition-all duration-200 shadow-lg cursor-pointer"
              style={{ boxShadow: '0 4px 14px rgba(34,103,121,0.1)' }}
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 text-sm font-medium text-on-surface-variant rounded-full hover:bg-surface-container-low transition-colors duration-200 cursor-pointer"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
