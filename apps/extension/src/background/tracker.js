import { getTrackerState, setTrackerState, getMonitoringEnabled } from '../shared/storage.js';
import { extractDomain } from '../shared/hash.js';
import { checkDomain } from './contentFilter.js';
import { SKIP_PROTOCOLS } from '../shared/config.js';

let currentTab = null; // { tabId, domain, startTime }
let domainStats = {};  // { [domain]: { category, totalSeconds, eventCount, firstSeen, blocked, flagged, confidence } }
let isIdle = false;

/**
 * Initialize tracker — rehydrate state from storage.
 */
export async function initTracker() {
  const state = await getTrackerState();
  currentTab = state.currentTab;
  domainStats = state.domainStats || {};
}

/**
 * Called when the active tab changes or navigates.
 */
export async function onTabChanged(tabId, url) {
  const monitoring = await getMonitoringEnabled();
  if (!monitoring || isIdle) return;

  // Skip internal browser pages
  if (!url || SKIP_PROTOCOLS.some(p => url.startsWith(p))) {
    await endCurrentTab();
    return;
  }

  const domain = extractDomain(url);
  if (!domain) {
    await endCurrentTab();
    return;
  }

  // If same domain, do nothing (just continued browsing)
  if (currentTab && currentTab.domain === domain) return;

  // End previous tab tracking
  await endCurrentTab();

  // Start tracking new tab
  currentTab = { tabId, domain, startTime: Date.now() };
  await persistState();
}

/**
 * End current tab session and record duration.
 */
async function endCurrentTab() {
  if (!currentTab) return;

  const duration = Math.round((Date.now() - currentTab.startTime) / 1000);
  const domain = currentTab.domain;

  if (duration >= 3) { // Minimum 3 seconds
    const filter = checkDomain(domain);

    // Only track domains that are blocked, flagged, or have a known category.
    // Unrecognized domains (category: null) are NOT tracked — this prevents
    // normal browsing (email, dev tools, your own apps) from being flagged.
    if (!filter.category && !filter.blocked && !filter.flagged) return;

    const category = filter.category;

    if (!domainStats[domain]) {
      domainStats[domain] = {
        category,
        totalSeconds: 0,
        eventCount: 0,
        firstSeen: new Date().toISOString(),
        blocked: filter.blocked,
        flagged: filter.flagged,
        confidence: filter.confidence,
      };
    }

    domainStats[domain].totalSeconds += duration;
    domainStats[domain].eventCount++;
  }

  currentTab = null;
  await persistState();
}

/**
 * Called by idle state change.
 */
export function setIdleState(idle) {
  if (idle && !isIdle) {
    // Going idle — end current tab
    endCurrentTab();
  } else if (!idle && isIdle) {
    // Coming back — will pick up on next tab event
  }
  isIdle = idle;
}

/**
 * Get aggregated stats and reset. Called by event queue on flush.
 */
export async function getAndResetStats() {
  await endCurrentTab(); // Flush current tab duration

  const stats = { ...domainStats };
  domainStats = {};
  await persistState();
  return stats;
}

/**
 * Get current stats without resetting (for popup display).
 */
export function getCurrentStats() {
  return { ...domainStats };
}

async function persistState() {
  await setTrackerState({ currentTab, domainStats });
}
