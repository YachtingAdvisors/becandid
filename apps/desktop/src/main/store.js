/**
 * Persistent settings store — zero dependencies.
 * Stores config as a JSON file in the Electron userData directory.
 */

const { app, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

const SENSITIVE_KEYS = new Set(['access_token', 'refresh_token']);

const DEFAULTS = {
  access_token: null,
  refresh_token: null,
  expires_at: null,
  user_id: null,
  monitoring_enabled: true,
  interval_minutes: 2,
  change_threshold: 0.10,
  auto_launch: true,
  heartbeats_today: 0,
  flagged_today: 0,
  last_heartbeat_capture: null,
  stats_date: null,
};

const configPath = path.join(app.getPath('userData'), 'be-candid-config.json');

let data = { ...DEFAULTS };

function canEncrypt() {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch {
    return false;
  }
}

function decodeStoredValue(key, value) {
  if (!SENSITIVE_KEYS.has(key)) {
    return value;
  }

  if (!value || typeof value !== 'object' || value.__secure !== true || typeof value.value !== 'string') {
    return value;
  }

  if (!canEncrypt()) {
    return null;
  }

  try {
    return safeStorage.decryptString(Buffer.from(value.value, 'base64'));
  } catch {
    return null;
  }
}

function encodeStoredValue(key, value) {
  if (!SENSITIVE_KEYS.has(key) || typeof value !== 'string' || value.length === 0) {
    return value;
  }

  if (!canEncrypt()) {
    return value;
  }

  try {
    return {
      __secure: true,
      value: safeStorage.encryptString(value).toString('base64'),
    };
  } catch {
    return value;
  }
}

// Load from disk
try {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    const decoded = Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, decodeStoredValue(key, value)])
    );
    data = { ...DEFAULTS, ...decoded };
  }
} catch {
  data = { ...DEFAULTS };
}

function save() {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const serialized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, encodeStoredValue(key, value)])
    );
    fs.writeFileSync(configPath, JSON.stringify(serialized, null, 2));
  } catch (err) {
    console.error('[store] Failed to save:', err.message);
  }
}

const store = {
  get(key) {
    return data[key] ?? DEFAULTS[key] ?? null;
  },
  set(key, value) {
    data[key] = value;
    save();
  },
};

function resetDailyStats() {
  const today = new Date().toISOString().slice(0, 10);
  if (store.get('stats_date') !== today) {
    store.set('heartbeats_today', 0);
    store.set('flagged_today', 0);
    store.set('stats_date', today);
  }
}

module.exports = { store, resetDailyStats };
