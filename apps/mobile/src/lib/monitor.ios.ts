// ============================================================
// mobile/src/lib/monitor.ios.ts
//
// iOS-specific monitoring registration.
// iOS has stricter background limits — relies on Screen Time API
// and daily check-in prompts rather than continuous monitoring.
// This is a stub — the actual implementation uses native modules.
// ============================================================

export async function registerMonitoringTask(): Promise<void> {
  // TODO: Implement iOS Screen Time API integration
  // iOS doesn't allow the same level of background monitoring as Android.
  // Instead, this registers for daily local notification check-ins.
  console.log('[Monitor:iOS] Check-in schedule registered (stub)');
}
