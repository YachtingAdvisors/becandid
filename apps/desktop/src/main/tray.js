/**
 * System tray icon and menu for Be Candid Screen Monitor.
 */

const { Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const { store } = require('./store');
const { getCaptureStats, startCapturing, stopCapturing } = require('./capturer');
const { signOut: doSignOut } = require('./auth');

let tray = null;
let onSignOut = null;

function createTray(callbacks = {}) {
  onSignOut = callbacks.onSignOut || (() => {});

  // Use white C-leaf logo as template image (macOS adapts for dark/light menu bar)
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    icon.setTemplateImage(true); // macOS template: renders white on dark, dark on light
    if (icon.isEmpty()) throw new Error('empty');
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('Be Candid Screen Monitor');

  updateTrayMenu();
  return tray;
}

function updateTrayMenu() {
  if (!tray) return;

  const stats = getCaptureStats();
  const monitoring = store.get('monitoring_enabled');
  const interval = store.get('interval_minutes') || 5;

  const lastCapture = stats.last_capture_at
    ? timeAgo(stats.last_capture_at)
    : 'Never';

  const menu = Menu.buildFromTemplate([
    {
      label: 'Be Candid Screen Monitor',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: monitoring ? '● Monitoring Active' : '○ Monitoring Paused',
      click: () => {
        const newState = !store.get('monitoring_enabled');
        store.set('monitoring_enabled', newState);
        if (newState) startCapturing();
        else stopCapturing();
        // Notify server of toggle (triggers partner alert if paused)
        notifyMonitoringToggle(newState);
        updateTrayMenu();
      },
    },
    {
      label: `  Every ${interval} minutes`,
      enabled: false, // Frequency controlled by admin via dashboard
    },
    {
      label: `  Last capture: ${lastCapture}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: `  Today: ${stats.captures_today} captures, ${stats.flagged_today} flagged`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open Dashboard →',
      click: () => shell.openExternal('https://becandid.io/dashboard/activity'),
    },
    { type: 'separator' },
    {
      label: 'Sign Out',
      click: () => {
        doSignOut();
        stopCapturing();
        if (onSignOut) onSignOut();
      },
    },
    {
      label: 'Quit Be Candid',
      role: 'quit',
    },
  ]);

  tray.setContextMenu(menu);
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// Notify server when monitoring is toggled (triggers partner alert if paused)
async function notifyMonitoringToggle(enabled) {
  const { getAccessToken } = require('./auth');
  const token = getAccessToken();
  if (!token) return;
  try {
    await fetch('https://becandid.io/api/screen-capture/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled, notify_partner: !enabled }),
    });
  } catch {}
}

// Refresh tray menu every 30 seconds to update "last capture" time
setInterval(updateTrayMenu, 30000);

module.exports = { createTray, updateTrayMenu, destroyTray };
