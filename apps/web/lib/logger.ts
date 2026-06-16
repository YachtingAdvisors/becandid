import * as Sentry from '@sentry/nextjs';

/**
 * Universal logger for server-side code.
 * Preserves local console.error debugging while ensuring
 * production errors are captured by Sentry.
 */
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context ? context : '');
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context ? context : '');
    Sentry.captureMessage(message, { level: 'warning', extra: context });
  },

  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error, context ? context : '');

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { message, ...context }
      });
    } else if (error) {
      Sentry.captureException(new Error(typeof error === 'string' ? error : JSON.stringify(error)), {
        extra: { message, originalError: error, ...context }
      });
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: context });
    }
  }
};
