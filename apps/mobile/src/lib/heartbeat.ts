// ============================================================
// mobile/src/lib/heartbeat.ts
//
// Sends a heartbeat POST to the server every 2 minutes while
// the app is in the foreground. Pauses automatically when the
// app goes to the background and resumes when it returns.
// ============================================================

import { AppState, type AppStateStatus } from 'react-native';
import { apiClient } from './api';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

let intervalId: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

// ── Send a single heartbeat ─────────────────────────────────

async function sendHeartbeat(): Promise<void> {
  try {
    await apiClient.post('/api/heartbeat');
  } catch (e) {
    // Non-fatal — server may be temporarily unreachable
    console.warn('[Heartbeat] Failed:', e);
  }
}

// ── Start / Stop ────────────────────────────────────────────

export function startHeartbeat(): void {
  if (intervalId) return; // Already running

  // Send one immediately, then every 2 min
  sendHeartbeat();
  intervalId = setInterval(sendHeartbeat, INTERVAL_MS);

  // Pause when app goes to background, resume in foreground
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
}

export function stopHeartbeat(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

// ── AppState handler ────────────────────────────────────────

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    // Returning to foreground — restart interval
    if (!intervalId) {
      sendHeartbeat();
      intervalId = setInterval(sendHeartbeat, INTERVAL_MS);
    }
  } else {
    // Going to background or inactive — pause
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
}
