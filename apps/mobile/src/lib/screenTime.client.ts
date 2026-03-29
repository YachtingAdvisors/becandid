// ============================================================
// mobile/src/lib/screenTime.client.ts
//
// Local screen time tracking and enforcement.
// Stores usage data in AsyncStorage, batches reports to the
// server, and queues when offline.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// ── Constants ────────────────────────────────────────────────

const USAGE_KEY_PREFIX = '@be_candid_usage_';
const UPLOAD_QUEUE_KEY = '@be_candid_usage_queue';

// ── Types ────────────────────────────────────────────────────

interface UsageEntry {
  appName: string;
  category: string;
  minutes: number;
  recordedAt: string; // ISO date string
}

interface DayUsage {
  date: string; // YYYY-MM-DD
  entries: UsageEntry[];
}

interface QueuedReport {
  userId: string;
  supabaseUrl: string;
  anonKey: string;
  entries: UsageEntry[];
  queuedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${USAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`;
}

function todayDateStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function readDayUsage(key: string): Promise<DayUsage> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DayUsage;
  } catch {
    // Ignore parse errors
  }
  return { date: todayDateStr(), entries: [] };
}

async function writeDayUsage(key: string, data: DayUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[ScreenTime] Failed to write usage data:', e);
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Record usage for an app in a given category.
 * Appends to today's storage bucket in AsyncStorage.
 */
export async function recordAppUsage(
  appName: string,
  category: string,
  minutes: number
): Promise<void> {
  if (minutes <= 0) return;

  const key = todayKey();
  const day = await readDayUsage(key);

  const entry: UsageEntry = {
    appName,
    category,
    minutes,
    recordedAt: new Date().toISOString(),
  };

  day.entries.push(entry);
  await writeDayUsage(key, day);
}

/**
 * Get today's usage aggregated by category.
 * Returns one entry per category with total minutes summed.
 */
export async function getTodayUsage(): Promise<Array<{ category: string; minutes: number }>> {
  const key = todayKey();
  const day = await readDayUsage(key);

  const totals = new Map<string, number>();
  for (const e of day.entries) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.minutes);
  }

  return Array.from(totals.entries()).map(([category, minutes]) => ({ category, minutes }));
}

/**
 * Check whether usage for a category has exceeded the daily limit.
 * Returns true if the user is over the limit.
 */
export async function checkDailyLimit(
  category: string,
  limitMinutes: number
): Promise<boolean> {
  const usage = await getTodayUsage();
  const entry = usage.find((u) => u.category === category);
  if (!entry) return false;
  return entry.minutes >= limitMinutes;
}

/**
 * Attempt to send today's usage to the server.
 * If offline, enqueues for later delivery.
 *
 * Endpoint: POST {supabaseUrl}/api/screen-time/usage
 * Auth: anon key in Authorization header
 */
export async function reportUsageToServer(
  userId: string,
  supabaseUrl: string,
  anonKey: string
): Promise<void> {
  const key = todayKey();
  const day = await readDayUsage(key);

  if (day.entries.length === 0) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    // Queue for later
    await enqueueReport({ userId, supabaseUrl, anonKey, entries: day.entries, queuedAt: new Date().toISOString() });
    console.log('[ScreenTime] Offline — usage report queued');
    return;
  }

  const success = await sendReport(userId, supabaseUrl, anonKey, day.entries);
  if (!success) {
    await enqueueReport({ userId, supabaseUrl, anonKey, entries: day.entries, queuedAt: new Date().toISOString() });
    console.warn('[ScreenTime] Failed to send report — queued for retry');
  }

  // Attempt to flush any previously queued reports
  await flushQueue();
}

// ── Internal upload logic ────────────────────────────────────

async function sendReport(
  userId: string,
  supabaseUrl: string,
  anonKey: string,
  entries: UsageEntry[]
): Promise<boolean> {
  try {
    const base = supabaseUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/api/screen-time/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        userId,
        date: todayDateStr(),
        entries,
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn('[ScreenTime] sendReport error:', e);
    return false;
  }
}

async function enqueueReport(report: QueuedReport): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    const queue: QueuedReport[] = raw ? JSON.parse(raw) : [];
    queue.push(report);
    // Cap the queue at 30 entries to avoid unbounded growth
    const capped = queue.slice(-30);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(capped));
  } catch (e) {
    console.warn('[ScreenTime] Failed to enqueue report:', e);
  }
}

async function flushQueue(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    if (!raw) return;

    const queue: QueuedReport[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const remaining: QueuedReport[] = [];
    for (const report of queue) {
      const ok = await sendReport(
        report.userId,
        report.supabaseUrl,
        report.anonKey,
        report.entries
      );
      if (!ok) remaining.push(report);
    }

    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(remaining));

    if (remaining.length < queue.length) {
      console.log(`[ScreenTime] Flushed ${queue.length - remaining.length} queued reports`);
    }
  } catch (e) {
    console.warn('[ScreenTime] flushQueue error:', e);
  }
}
