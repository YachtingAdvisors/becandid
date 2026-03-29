// ============================================================
// mobile/src/lib/monitor.android.ts
//
// Android-specific background monitoring registration.
// Uses Android accessibility/usage stats APIs via native module.
// This is a stub — the actual native module would be implemented
// in the android/ directory after prebuild.
// ============================================================

export async function registerMonitoringTask(): Promise<void> {
  // TODO: Implement Android usage stats monitoring
  // This would use expo-task-manager + a native module for
  // UsageStatsManager to detect app usage patterns.
  console.log('[Monitor:Android] Background monitoring registered (stub)');
}
