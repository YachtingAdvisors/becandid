import * as Sentry from '@sentry/nextjs';

/**
 * Standardized logger utility for the application.
 * Wraps console logging and integrates with Sentry for error tracking.
 */
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(message, error);

    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { context: message } });
    } else if (error !== undefined) {
      Sentry.captureException(new Error(typeof error === 'string' ? error : String(error)), {
        extra: { context: message, originalError: error }
      });
    } else {
      Sentry.captureMessage(message, 'error');
    }
  },

  warn: (message: string, context?: unknown) => {
    console.warn(message, context);
    Sentry.captureMessage(message, { level: 'warning', extra: { context } });
  },

  info: (message: string, context?: unknown) => {
    console.info(message, context);
  },
};
