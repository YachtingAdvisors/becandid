/**
 * Be Candid Extension — Background Service Worker
 * Monitors browsing activity and sends events to the API.
 */

import { initTracker, onTabChanged, setIdleState, getCurrentStats } from './tracker.js';
import { flush, queueImmediate } from './eventQueue.js';
import { signIn, signOut, isAuthenticated, fetchSettings } from './auth.js';
import { checkDomain, setUserRules } from './contentFilter.js';
import { getMonitoringEnabled, setMonitoringEnabled, getSession } from '../shared/storage.js';
import { extractDomain } from '../shared/hash.js';
import { CONFIG, SKIP_PROTOCOLS } from '../shared/config.js';

// ── Content Blocking via declarativeNetRequest ────────────────
// Builds dynamic rules from the content filter's blocked domains
// and user-configured block rules so that navigation is actually
// prevented, not just tracked.

const BLOCK_PAGE_URL = chrome.runtime.getURL('src/popup/popup.html') + '?blocked=1';

/**
 * Sync declarativeNetRequest rules from the content filter lists
 * and any user-configured block rules fetched from the server.
 */
async function syncBlockRules(userRules = null) {
  try {
    // Import the blocked domains from contentFilter
    const { checkDomain: check } = await import('./contentFilter.js');

    // Gather all domains that should be blocked
    const blockedDomains = [];

    // Hardcoded blocked domains from contentFilter.js
    const KNOWN_BLOCKED = [
      'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com',
      'redtube.com', 'youporn.com', 'tube8.com', 'spankbang.com',
      'onlyfans.com', 'chaturbate.com', 'stripchat.com',
      'draftkings.com', 'fanduel.com', 'bovada.lv', 'bet365.com',
      'betmgm.com', 'pokerstars.com', 'stake.com',
      'tinder.com', 'bumble.com', 'hinge.co', 'match.com', 'okcupid.com',
      'robinhood.com', 'webull.com',
    ];

    for (const domain of KNOWN_BLOCKED) {
      blockedDomains.push(domain);
    }

    // Add user-configured block rules
    if (userRules) {
      for (const rule of userRules) {
        if (rule.rule_type === 'block' && rule.domain) {
          blockedDomains.push(rule.domain);
        }
      }
    }

    // Remove existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(r => r.id);
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
      });
    }

    // Check if monitoring is enabled before adding rules
    const monitoring = await getMonitoringEnabled();
    if (!monitoring) return;

    // Build new rules (each domain gets a unique rule ID)
    const newRules = blockedDomains.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: BLOCK_PAGE_URL + '&domain=' + encodeURIComponent(domain) },
      },
      condition: {
        urlFilter: `||${domain}`,
        resourceTypes: ['main_frame'],
      },
    }));

    if (newRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRules,
      });
    }

    console.log(`[Be Candid] Synced ${newRules.length} block rules`);
  } catch (err) {
    console.error('[Be Candid] Failed to sync block rules:', err);
  }
}

// ── Service Worker Lifecycle ───────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Be Candid] Extension installed');
  // Set up flush alarm (every 5 minutes)
  chrome.alarms.create('flush-events', { periodInMinutes: CONFIG.FLUSH_INTERVAL_MINUTES });
  // Set up settings refresh (every 30 minutes)
  chrome.alarms.create('refresh-settings', { periodInMinutes: 30 });
  // Initialize blocking rules on install
  syncBlockRules();
});

// Rehydrate tracker state on service worker wake
initTracker();

// Track user rules in service worker scope for re-syncing on toggle
let cachedUserRules = null;

// ── Tab Monitoring ─────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
      await handleTabChange(activeInfo.tabId, tab.url);
    }
  } catch (err) {
    console.warn('[Be Candid] Tab activation handler error:', err);
  }
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

// ── Idle Detection (not available in Safari) ──────────────────

if (chrome.idle?.onStateChanged) {
  chrome.idle.setDetectionInterval(60); // 60 seconds
  chrome.idle.onStateChanged.addListener((state) => {
    setIdleState(state !== 'active');
  });
}

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
      const settings = await fetchSettings();
      // Re-sync blocking rules when settings refresh (picks up new user rules)
      if (settings?.site_rules) {
        cachedUserRules = settings.site_rules;
        setUserRules(settings.site_rules);
        await syncBlockRules(settings.site_rules);
      }
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
      // Re-sync block rules: add rules when enabled, remove when disabled
      await syncBlockRules(msg.enabled ? cachedUserRules : null);
      return { success: true, monitoring: msg.enabled };
    }

    default:
      return { error: 'Unknown message type' };
  }
}
