/**
 * Persistent settings store — zero dependencies.
 * Stores config as a JSON file in the Electron userData directory.
 */

const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULTS = {
  access_token: null,
  refresh_token: null,
  expires_at: null,
  user_id: null,
  monitoring_enabled: true,
  interval_minutes: 5,
  change_threshold: 0.10,
  auto_launch: true,
  captures_today: 0,
  flagged_today: 0,
  last_capture_at: null,
  captures_date: null,
};

const configPath = path.join(app.getPath('userData'), 'be-candid-config.json');

let data = { ...DEFAULTS };

// Load from disk
try {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    data = { ...DEFAULTS, ...JSON.parse(raw) };
  }
} catch {
  data = { ...DEFAULTS };
}

function save() {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
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
  if (store.get('captures_date') !== today) {
    store.set('captures_today', 0);
    store.set('flagged_today', 0);
    store.set('captures_date', today);
  }
}

module.exports = { store, resetDailyStats };
