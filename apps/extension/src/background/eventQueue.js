import { getEventQueue, setEventQueue } from '../shared/storage.js';
import { sha256 } from '../shared/hash.js';
import { apiPost } from '../shared/api.js';
import { getAndResetStats } from './tracker.js';
import { CONFIG } from '../shared/config.js';

/**
 * Queue a single high-severity event for immediate send.
 */
export async function queueImmediate(event) {
  try {
    await apiPost('/api/events', event);
  } catch (e) {
    // Failed — add to queue for retry
    const queue = await getEventQueue();
    queue.push({ ...event, _queuedAt: Date.now() });
    await setEventQueue(queue.slice(-CONFIG.MAX_QUEUE_SIZE));
  }
}

/**
 * Flush aggregated domain stats to the API.
 * Called every 5 minutes by chrome.alarms.
 */
export async function flush() {
  const stats = await getAndResetStats();
  const domains = Object.keys(stats);

  if (domains.length === 0) {
    // Still try to flush any queued events from previous failures
    await retryQueue();
    return;
  }

  const events = [];

  for (const domain of domains) {
    const s = stats[domain];

    // Calculate severity based on content filter result and duration
    let severity = 'low';
    if (s.blocked) {
      severity = 'high';
    } else if (s.flagged && s.totalSeconds > 600) { // >10 min on flagged site
      severity = 'medium';
    } else if (s.totalSeconds > 3600) { // >1 hour anywhere
      severity = 'medium';
    }

    const urlHash = await sha256(domain);

    events.push({
      category: s.category,
      severity,
      platform: 'extension',
      app_name: domain,
      url_hash: urlHash,
      duration_seconds: s.totalSeconds,
      timestamp: s.firstSeen,
      metadata: {
        type: 'browsing',
        visits: s.eventCount,
        blocked: s.blocked,
        flagged: s.flagged,
        confidence: s.confidence,
      },
    });
  }

  // Send as batch if multiple, single if one
  try {
    if (events.length === 1) {
      await apiPost('/api/events', events[0]);
    } else {
      await apiPost('/api/events', { batch: true, events });
    }
  } catch (e) {
    // Queue for retry
    const queue = await getEventQueue();
    for (const event of events) {
      queue.push({ ...event, _queuedAt: Date.now() });
    }
    await setEventQueue(queue.slice(-CONFIG.MAX_QUEUE_SIZE));
  }

  // Also retry any previously queued events
  await retryQueue();
}

/**
 * Retry previously failed events.
 */
async function retryQueue() {
  const queue = await getEventQueue();
  if (queue.length === 0) return;

  const remaining = [];

  for (const event of queue) {
    // Drop events older than 7 days
    if (Date.now() - event._queuedAt > 7 * 86400000) continue;

    try {
      const { _queuedAt, ...payload } = event;
      await apiPost('/api/events', payload);
    } catch {
      remaining.push(event);
    }
  }

  await setEventQueue(remaining);
}
