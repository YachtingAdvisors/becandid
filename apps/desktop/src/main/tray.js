/**
 * System tray icon and menu for Be Candid Screen Monitor.
 */

const { app, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const { store } = require('./store');
const { getCaptureStats, startCapturing, stopCapturing } = require('./capturer');
const { signOut: doSignOut } = require('./auth');

let tray = null;
let onSignOut = null;

function createTray(callbacks = {}) {
  onSignOut = callbacks.onSignOut || (() => {});

  // Use white C-leaf logo as template image (macOS adapts for dark/light menu bar)
  // Must resize to exactly 16x16 logical pixels for proper menu bar alignment
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  const icon2xPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon@2x.png');
  let icon;
  try {
    // Load @2x and resize to 16x16 logical (32x32 actual) for crisp Retina rendering
    icon = nativeImage.createFromPath(icon2xPath);
    icon = icon.resize({ width: 16, height: 16 });
    icon.setTemplateImage(true);
    if (icon.isEmpty()) throw new Error('empty');
  } catch {
    try {
      icon = nativeImage.createFromPath(iconPath);
      icon = icon.resize({ width: 16, height: 16 });
      icon.setTemplateImage(true);
    } catch {
      icon = nativeImage.createEmpty();
    }
  }

  tray = new Tray(icon);
  // Don't set title — it shows as text label next to the icon on macOS

  updateTrayMenu();
  return tray;
}

function updateTrayMenu() {
  if (!tray) return;

  const stats = getCaptureStats();
  const monitoring = store.get('monitoring_enabled');

  const lastHeartbeat = stats.last_heartbeat_capture
    ? timeAgo(stats.last_heartbeat_capture)
    : 'Never';

  const menu = Menu.buildFromTemplate([
    {
      label: 'Be Candid',
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
        notifyMonitoringToggle(newState);
        updateTrayMenu();
      },
    },
    {
      label: `  Last heartbeat: ${lastHeartbeat}`,
      enabled: false,
    },
    {
      label: `  Heartbeats: ${stats.heartbeats_today}  ·  Flagged: ${stats.flagged_today}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '🤝 Reach Out to Partner',
      click: () => {
        showReachOutWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Open Dashboard',
      click: () => {
        const { getAccessToken, getRefreshToken } = require('./auth');
        const token = getAccessToken();
        const url = token
          ? `https://becandid.io/api/auth/token-login?token=${encodeURIComponent(token)}&refresh=${encodeURIComponent(getRefreshToken() || '')}&redirect=/dashboard`
          : 'https://becandid.io/dashboard';
        shell.openExternal(url);
      },
    },
    {
      label: 'Open Journal',
      click: () => {
        const { getAccessToken, getRefreshToken } = require('./auth');
        const token = getAccessToken();
        const url = token
          ? `https://becandid.io/api/auth/token-login?token=${encodeURIComponent(token)}&refresh=${encodeURIComponent(getRefreshToken() || '')}&redirect=/dashboard/stringer-journal?action=write`
          : 'https://becandid.io/dashboard/stringer-journal';
        shell.openExternal(url);
      },
    },
    {
      label: 'Log Activity',
      click: () => {
        const { getAccessToken, getRefreshToken } = require('./auth');
        const token = getAccessToken();
        const url = token
          ? `https://becandid.io/api/auth/token-login?token=${encodeURIComponent(token)}&refresh=${encodeURIComponent(getRefreshToken() || '')}&redirect=/dashboard/activity`
          : 'https://becandid.io/dashboard/activity';
        shell.openExternal(url);
      },
    },
    { type: 'separator' },
    {
      label: 'Start on Login',
      type: 'checkbox',
      checked: store.get('auto_launch'),
      click: (menuItem) => {
        store.set('auto_launch', menuItem.checked);
        app.setLoginItemSettings({ openAtLogin: menuItem.checked });
      },
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

// Reach Out window — small popup for sending a message to partner
let reachOutWindow = null;

function showReachOutWindow() {
  if (reachOutWindow) { reachOutWindow.focus(); return; }

  const { BrowserWindow, ipcMain } = require('electron');

  reachOutWindow = new BrowserWindow({
    width: 380,
    height: 300,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#fbf9f8',
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  reachOutWindow.loadFile(path.join(__dirname, '..', 'renderer', 'reach-out.html'));

  // Handle the send
  ipcMain.once('reach-out:send', async (_event, message) => {
    const { getAccessToken, getRefreshToken } = require('./auth');
    const token = getAccessToken();
    if (token) {
      try {
        await fetch('https://becandid.io/api/reach-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: message || '' }),
        });
        const { Notification } = require('electron');
        new Notification({
          title: 'Be Candid',
          body: 'Your partner has been notified.',
        }).show();
      } catch {}
    }
    if (reachOutWindow) { reachOutWindow.close(); }
  });

  ipcMain.once('reach-out:cancel', () => {
    if (reachOutWindow) { reachOutWindow.close(); }
  });

  reachOutWindow.on('closed', () => {
    reachOutWindow = null;
    ipcMain.removeAllListeners('reach-out:send');
    ipcMain.removeAllListeners('reach-out:cancel');
  });
}

// Notify server when monitoring is toggled (triggers partner alert if paused)
async function notifyMonitoringToggle(enabled) {
  const { getAccessToken, getRefreshToken } = require('./auth');
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
