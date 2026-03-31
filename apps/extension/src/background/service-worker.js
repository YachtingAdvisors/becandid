/**
 * Be Candid Extension — Background Service Worker
 * Monitors browsing activity and sends events to the API.
 */

import { initTracker, onTabChanged, setIdleState, getCurrentStats } from './tracker.js';
import { flush, queueImmediate } from './eventQueue.js';
import { signIn, signOut, isAuthenticated, fetchSettings } from './auth.js';
import { checkDomain } from './contentFilter.js';
import { getMonitoringEnabled, setMonitoringEnabled, getSession } from '../shared/storage.js';
import { extractDomain } from '../shared/hash.js';
import { CONFIG, SKIP_PROTOCOLS } from '../shared/config.js';

// ── Service Worker Lifecycle ───────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Be Candid] Extension installed');
  // Set up flush alarm (every 5 minutes)
  chrome.alarms.create('flush-events', { periodInMinutes: CONFIG.FLUSH_INTERVAL_MINUTES });
  // Set up settings refresh (every 30 minutes)
  chrome.alarms.create('refresh-settings', { periodInMinutes: 30 });
});

// Rehydrate tracker state on service worker wake
initTracker();

// ── Tab Monitoring ─────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
      await handleTabChange(activeInfo.tabId, tab.url);
    }
  } catch {}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab?.url) {
    // Only process if this is the active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id === tabId) {
      await handleTabChange(tabId, tab.url);
    }
  }
});

async function handleTabChange(tabId, url) {
  if (!url || SKIP_PROTOCOLS.some(p => url.startsWith(p))) {
    await onTabChanged(tabId, null);
    return;
  }

  const domain = extractDomain(url);
  await onTabChanged(tabId, url);

  // Check if this is a blocked domain — send immediate event
  if (domain) {
    const result = checkDomain(domain);
    if (result.blocked) {
      const { sha256 } = await import('../shared/hash.js');
      const urlHash = await sha256(url);
      await queueImmediate({
        category: result.category,
        severity: 'high',
        platform: 'extension',
        app_name: domain,
        url_hash: urlHash,
        metadata: { type: 'blocked_visit', confidence: result.confidence },
      });
    }
  }
}

// ── Idle Detection ─────────────────────────────────────────────

chrome.idle.setDetectionInterval(60); // 60 seconds

chrome.idle.onStateChanged.addListener((state) => {
  setIdleState(state !== 'active');
});

// ── Alarms ─────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'flush-events') {
    const authed = await isAuthenticated();
    if (authed) {
      await flush();
    }
  }
  if (alarm.name === 'refresh-settings') {
    const authed = await isAuthenticated();
    if (authed) {
      await fetchSettings();
    }
  }
});

// ── Message Handling (from popup) ──────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch(e => sendResponse({ error: e.message }));
  return true; // Keep channel open for async response
});

async function handleMessage(msg) {
  switch (msg.type) {
    case 'getStatus': {
      const authed = await isAuthenticated();
      const monitoring = await getMonitoringEnabled();
      const session = await getSession();
      return { authenticated: authed, monitoring, userId: session.user_id };
    }

    case 'getStats': {
      return { stats: getCurrentStats() };
    }

    case 'signIn': {
      const user = await signIn(msg.email, msg.password);
      return { success: true, user };
    }

    case 'signOut': {
      await signOut();
      return { success: true };
    }

    case 'toggleMonitoring': {
      await setMonitoringEnabled(msg.enabled);
      return { success: true, monitoring: msg.enabled };
    }

    default:
      return { error: 'Unknown message type' };
  }
}
