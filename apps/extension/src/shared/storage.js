/**
 * Chrome storage helpers for the Be Candid extension.
 */

export async function getSession() {
  const result = await chrome.storage.local.get(['access_token', 'refresh_token', 'expires_at', 'user_id']);
  return result;
}

export async function setSession({ access_token, refresh_token, expires_at, user_id }) {
  await chrome.storage.local.set({ access_token, refresh_token, expires_at, user_id });
}

export async function clearSession() {
  await chrome.storage.local.remove(['access_token', 'refresh_token', 'expires_at', 'user_id', 'settings']);
}

export async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || null;
}

export async function setSettings(settings) {
  await chrome.storage.local.set({ settings });
}

export async function getMonitoringEnabled() {
  const result = await chrome.storage.local.get('monitoring_enabled');
  return result.monitoring_enabled !== false; // Default true
}

export async function setMonitoringEnabled(enabled) {
  await chrome.storage.local.set({ monitoring_enabled: enabled });
}

// Tracker state persistence (survives service worker restarts)
// chrome.storage.session is not fully supported in Safari — fallback to local with prefix
const SESSION_KEYS = ['currentTab', 'domainStats'];
const SESS_PREFIX = '_sess_';

async function sessionGet(keys) {
  try {
    if (chrome.storage.session) {
      return await chrome.storage.session.get(keys);
    }
  } catch {}
  // Fallback: use chrome.storage.local with prefix
  const prefixed = keys.map(k => SESS_PREFIX + k);
  const raw = await chrome.storage.local.get(prefixed);
  const result = {};
  for (const k of keys) {
    result[k] = raw[SESS_PREFIX + k] ?? undefined;
  }
  return result;
}

async function sessionSet(data) {
  try {
    if (chrome.storage.session) {
      await chrome.storage.session.set(data);
      return;
    }
  } catch {}
  // Fallback: use chrome.storage.local with prefix
  const prefixed = {};
  for (const [k, v] of Object.entries(data)) {
    prefixed[SESS_PREFIX + k] = v;
  }
  await chrome.storage.local.set(prefixed);
}

export async function getTrackerState() {
  const result = await sessionGet(['currentTab', 'domainStats']);
  return {
    currentTab: result.currentTab || null,
    domainStats: result.domainStats || {},
  };
}

export async function setTrackerState(state) {
  await sessionSet(state);
}

// Event queue persistence
export async function getEventQueue() {
  const result = await chrome.storage.local.get('eventQueue');
  return result.eventQueue || [];
}

export async function setEventQueue(queue) {
  await chrome.storage.local.set({ eventQueue: queue });
}
