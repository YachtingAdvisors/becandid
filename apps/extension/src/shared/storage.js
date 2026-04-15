/**
 * Chrome storage helpers for the Be Candid extension.
 */

const AUTH_LOCAL_KEYS = ['refresh_token', 'user_id'];
const AUTH_SESSION_KEYS = ['access_token', 'expires_at'];

async function authSessionGet(keys) {
  try {
    if (chrome.storage.session) {
      return await chrome.storage.session.get(keys);
    }
  } catch {}
  return chrome.storage.local.get(keys);
}

async function authSessionSet(values) {
  try {
    if (chrome.storage.session) {
      await chrome.storage.session.set(values);
      return;
    }
  } catch {}
  await chrome.storage.local.set(values);
}

async function authSessionRemove(keys) {
  try {
    if (chrome.storage.session) {
      await chrome.storage.session.remove(keys);
      return;
    }
  } catch {}
  await chrome.storage.local.remove(keys);
}

export async function getSession() {
  const [persistent, transient] = await Promise.all([
    chrome.storage.local.get(AUTH_LOCAL_KEYS),
    authSessionGet(AUTH_SESSION_KEYS),
  ]);
  return { ...persistent, ...transient };
}

export async function setSession({ access_token, refresh_token, expires_at, user_id }) {
  await Promise.all([
    chrome.storage.local.set({ refresh_token, user_id }),
    authSessionSet({ access_token, expires_at }),
  ]);
}

export async function clearSession() {
  await Promise.all([
    chrome.storage.local.remove([...AUTH_LOCAL_KEYS, 'settings']),
    authSessionRemove(AUTH_SESSION_KEYS),
  ]);
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
