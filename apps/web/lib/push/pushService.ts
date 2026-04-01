// ============================================================
// Be Candid — Push Notification Service
// Stub: sends push notifications via Expo Push API
// Replace with real implementation when mobile is wired up
// ============================================================

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPush(
  token: string,
  platform: string,
  payload: PushPayload
): Promise<void> {
  // TODO: Implement with expo-server-sdk when push tokens are stored
}
