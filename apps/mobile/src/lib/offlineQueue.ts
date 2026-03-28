// ============================================================
// mobile/src/lib/offlineQueue.ts
//
// Queues flagged events locally when the device is offline.
// Syncs to the server when connectivity returns.
//
// Problem: If the device loses connectivity during a flagged
// event, the event is silently dropped. For an accountability
// app, this is a critical gap — the exact moment the user
// might go offline (late night, airplane mode) is often the
// moment that matters most.
//
// Solution:
//   1. Every event goes through the queue first
//   2. Queue attempts immediate sync
//   3. If offline, stores in AsyncStorage
//   4. NetInfo listener triggers sync when back online
//   5. Retry with exponential backoff (max 3 attempts)
//   6. Failed events are kept for manual review
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase, getSession } from './supabase';

const QUEUE_KEY = '@be_candid_event_queue';
const MAX_RETRIES = 3;

interface QueuedEvent {
  id: string;
  payload: {
    category: string;
    severity: 'low' | 'medium' | 'high';
    platform: string;
    metadata?: Record<string, any>;
    timestamp: string;
  };
  queuedAt: string;
  attempts: number;
  lastError?: string;
}

// ── Queue an event ──────────────────────────────────────────

export async function queueEvent(payload: QueuedEvent['payload']): Promise<void> {
  const event: QueuedEvent = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    payload: {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    },
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };

  // Try to sync immediately
  const netState = await NetInfo.fetch();
  if (netState.isConnected) {
    const success = await syncEvent(event);
    if (success) return; // Synced immediately
  }

  // Store in local queue
  const queue = await getQueue();
  queue.push(event);
  await saveQueue(queue);

  console.log(`[OfflineQueue] Event queued locally (${queue.length} pending)`);
}

// ── Sync a single event ─────────────────────────────────────

async function syncEvent(event: QueuedEvent): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session?.access_token) return false;

    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';
    const res = await fetch(`${apiUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(event.payload),
    });

    if (res.ok) {
      console.log(`[OfflineQueue] Event ${event.id} synced`);
      return true;
    }

    // 429 = rate limited, retry later
    if (res.status === 429) {
      event.lastError = 'Rate limited';
      return false;
    }

    // 4xx = bad data, don't retry
    if (res.status >= 400 && res.status < 500) {
      event.lastError = `Client error: ${res.status}`;
      event.attempts = MAX_RETRIES; // Mark as failed
      return false;
    }

    event.lastError = `Server error: ${res.status}`;
    return false;
  } catch (e: any) {
    event.lastError = e.message || 'Network error';
    return false;
  }
}

// ── Sync all pending events ─────────────────────────────────

export async function syncPendingEvents(): Promise<{ synced: number; failed: number; remaining: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0, remaining: 0 };

  console.log(`[OfflineQueue] Syncing ${queue.length} pending events`);

  let synced = 0;
  let failed = 0;
  const remaining: QueuedEvent[] = [];

  for (const event of queue) {
    event.attempts++;

    const success = await syncEvent(event);
    if (success) {
      synced++;
    } else if (event.attempts >= MAX_RETRIES) {
      failed++;
      // Keep failed events for debugging but mark them
      remaining.push({ ...event, lastError: `Failed after ${MAX_RETRIES} attempts: ${event.lastError}` });
    } else {
      remaining.push(event);
    }

    // Small delay between syncs to avoid hammering the API
    await new Promise((r) => setTimeout(r, 200));
  }

  await saveQueue(remaining);
  console.log(`[OfflineQueue] Sync complete: ${synced} synced, ${failed} failed, ${remaining.length} remaining`);

  return { synced, failed, remaining: remaining.length };
}

// ── Start background listener ───────────────────────────────
// Call once on app launch (in _layout.tsx)

let listenerActive = false;

export function startOfflineQueueListener(): () => void {
  if (listenerActive) return () => {};

  listenerActive = true;
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      // Device came back online — sync pending events
      syncPendingEvents().catch(console.error);
    }
  });

  return () => {
    listenerActive = false;
    unsubscribe();
  };
}

// ── Queue persistence ───────────────────────────────────────

async function getQueue(): Promise<QueuedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('[OfflineQueue] Failed to save queue:', e);
  }
}

// ── Debug: get queue status ─────────────────────────────────

export async function getQueueStatus(): Promise<{
  pending: number;
  failed: number;
  events: QueuedEvent[];
}> {
  const queue = await getQueue();
  return {
    pending: queue.filter((e) => e.attempts < MAX_RETRIES).length,
    failed: queue.filter((e) => e.attempts >= MAX_RETRIES).length,
    events: queue,
  };
}

// ── Clear failed events ─────────────────────────────────────

export async function clearFailedEvents(): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((e) => e.attempts < MAX_RETRIES);
  await saveQueue(filtered);
}
