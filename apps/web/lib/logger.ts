/**
 * Simple logging abstraction.
 * This provides a centralized way to handle logging across the application,
 * making it easier to integrate with external logging services (e.g., Datadog, Sentry, Axiom)
 * in the future without changing every file.
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.info(message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(message, ...args);
  },
};
