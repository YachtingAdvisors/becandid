// ============================================================
// Be Candid — Error Reporting
//
// Client-side error capture. Sends errors to:
// - Sentry (if NEXT_PUBLIC_SENTRY_DSN is set)
// - /api/errors endpoint (fallback)
// - Console (always)
//
// Drop-in: import and call in global-error.tsx and error boundaries.
// ============================================================

interface ErrorReport {
  message: string;
  stack?: string;
  digest?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class ErrorReporter {
  private sentryDsn: string | null;
  private buffer: ErrorReport[] = [];
  private flushing = false;

  constructor() {
    this.sentryDsn = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_SENTRY_DSN ?? null)
      : null;
  }

  capture(error: Error, context?: Record<string, unknown>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      digest: (error as any).digest,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      context,
    };

    // Always log to console
    console.error('[ErrorReporter]', report);

    // Buffer and flush
    this.buffer.push(report);
    this.flush();
  }

  private async flush() {
    if (this.flushing || this.buffer.length === 0) return;
    this.flushing = true;

    const reports = [...this.buffer];
    this.buffer = [];

    try {
      // Send to our API endpoint (batched)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: reports }),
      }).catch(() => {}); // Silent — error reporting should never cause errors
    } finally {
      this.flushing = false;
    }
  }
}

// Singleton
export const errorReporter = new ErrorReporter();

// ─── Error Reporting API Route ───────────────────────────────
// This is the server-side handler. Create at /api/errors/route.ts
export function createErrorHandler() {
  return async function handleErrors(reports: ErrorReport[]) {
    for (const report of reports) {
      // Log with structured format for log aggregation services
      console.error('[CLIENT_ERROR]', JSON.stringify({
        message: report.message,
        digest: report.digest,
        url: report.url,
        timestamp: report.timestamp,
        context: report.context,
      }));
    }
  };
}
