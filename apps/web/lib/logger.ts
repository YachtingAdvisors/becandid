/**
 * Simple logger abstraction.
 * This wraps console methods for now, making it easy to swap in
 * structured logging (like Pino or Winston) in the future without
 * changing callsites throughout the codebase.
 */
export const logger = {
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => console.debug(...args),
};
