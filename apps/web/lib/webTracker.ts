/**
 * Web session tracker -- logs time spent in the Be Candid PWA.
 * Uses document.visibilitychange to detect when user leaves/returns.
 * Sends session events to /api/events with platform='web'.
 */

let sessionStart: number | null = null;

export function initWebTracker() {
  sessionStart = performance.now();

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && sessionStart !== null) {
      const durationSeconds = Math.round(
        (performance.now() - sessionStart) / 1000,
      );

      // Only log sessions longer than 30 seconds
      if (durationSeconds > 30) {
        // Use keepalive to ensure request completes even as tab closes
        fetch('/api/events', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'social_media',
            severity: 'low',
            platform: 'web',
            app_name: 'Be Candid PWA',
            duration_seconds: durationSeconds,
            metadata: { type: 'session' },
          }),
        }).catch(() => {});
      }

      sessionStart = null;
    } else if (document.visibilityState === 'visible') {
      sessionStart = performance.now();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
