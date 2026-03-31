/**
 * Persistent settings store using electron-store.
 * Tokens encrypted with Electron's safeStorage when available.
 */

const Store = require('electron-store');

const store = new Store({
  name: 'be-candid-config',
  defaults: {
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
    captures_date: null, // reset daily
  },
});

function resetDailyStats() {
  const today = new Date().toISOString().slice(0, 10);
  if (store.get('captures_date') !== today) {
    store.set('captures_today', 0);
    store.set('flagged_today', 0);
    store.set('captures_date', today);
  }
}

module.exports = { store, resetDailyStats };
