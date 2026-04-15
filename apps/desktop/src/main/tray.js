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

function buildAuthedUrl(redirectPath) {
  const { getAccessToken, getRefreshToken } = require('./auth');
  const token = getAccessToken();
  if (!token) {
    return `https://becandid.io${redirectPath}`;
  }

  const params = new URLSearchParams({
    token,
    redirect: redirectPath,
  });

  const refresh = getRefreshToken();
  if (refresh) {
    params.set('refresh', refresh);
  }

  return `https://becandid.io/api/auth/token-login?${params.toString()}`;
}

function createTray(callbacks = {}) {
  onSignOut = callbacks.onSignOut || (() => {});

  // Load both active (green circle) and inactive icons
  const activeIconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon-active@2x.png');
  const inactiveIconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon-inactive@2x.png');
  const fallbackPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon@2x.png');

  let icon;
  const monitoring = store.get('monitoring_enabled');
  try {
    icon = nativeImage.createFromPath(monitoring ? activeIconPath : inactiveIconPath);
    icon = icon.resize({ width: 16, height: 16 });
    if (icon.isEmpty()) throw new Error('empty');
    // Active icon keeps green color; inactive adapts to macOS light/dark
    icon.setTemplateImage(!monitoring);
  } catch {
    try {
      icon = nativeImage.createFromPath(fallbackPath);
      icon = icon.resize({ width: 16, height: 16 });
      icon.setTemplateImage(true);
    } catch {
      icon = nativeImage.createEmpty();
    }
  }

  tray = new Tray(icon);

  // Left-click also opens the context menu on Windows
  tray.on('click', () => {
    tray.popUpContextMenu();
  });

  updateTrayMenu();
  return tray;
}

function updateTrayMenu() {
  if (!tray) return;

  const stats = getCaptureStats();
  const monitoring = store.get('monitoring_enabled');

  // Swap tray icon: green circle + white C when active, plain white C when inactive
  try {
    const iconFile = monitoring ? 'tray-icon-active@2x.png' : 'tray-icon-inactive@2x.png';
    let newIcon = nativeImage.createFromPath(path.join(__dirname, '..', '..', 'assets', iconFile));
    newIcon = newIcon.resize({ width: 16, height: 16 });
    // Only set as template for inactive (so macOS adapts white/dark)
    // Active icon keeps its green color by NOT being a template
    newIcon.setTemplateImage(!monitoring);
    tray.setImage(newIcon);
  } catch {}

  const lastHeartbeat = stats.last_heartbeat_capture
    ? timeAgo(stats.last_heartbeat_capture)
    : 'Never';

  // Check if awareness is paused with a timer
  const pausedUntil = store.get('paused_until');
  const isPaused = pausedUntil && Date.now() < pausedUntil;
  const isDisconnected = !monitoring && !isPaused;

  let statusLabel = '🟢 Awareness Active';
  if (isPaused) {
    const remaining = pausedUntil - Date.now();
    const minsLeft = Math.ceil(remaining / 60000);
    if (minsLeft >= 60) {
      const hrsLeft = Math.round(minsLeft / 60 * 10) / 10;
      statusLabel = `⏸️ Paused — ${hrsLeft}h remaining`;
    } else {
      statusLabel = `⏸️ Paused — ${minsLeft} min remaining`;
    }
  } else if (isDisconnected) {
    statusLabel = '🔴 Disconnected';
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'Be Candid',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: statusLabel,
      enabled: false,
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
    ...(monitoring || isPaused ? [
      {
        label: '⏸️ Pause Awareness',
        submenu: [
          { label: '1 minute', click: () => pauseAwareness(1) },
          { label: '15 minutes', click: () => pauseAwareness(15) },
          { label: '30 minutes', click: () => pauseAwareness(30) },
          { label: '1 hour', click: () => pauseAwareness(60) },
          { label: '24 hours', click: () => pauseAwareness(1440) },
        ],
      },
    ] : []),
    ...(isPaused ? [
      {
        label: '▶️ Resume Awareness',
        click: () => {
          store.delete('paused_until');
          store.set('monitoring_enabled', true);
          startCapturing();
          notifyMonitoringToggle(true);
          updateTrayMenu();
        },
      },
    ] : []),
    ...(monitoring || isPaused ? [
      {
        label: '🔌 Disconnect',
        click: () => {
          store.delete('paused_until');
          store.set('monitoring_enabled', false);
          stopCapturing();
          notifyMonitoringToggle(false);
          updateTrayMenu();
        },
      },
    ] : [
      {
        label: '🔌 Reconnect',
        click: () => {
          store.set('monitoring_enabled', true);
          startCapturing();
          notifyMonitoringToggle(true);
          updateTrayMenu();
        },
      },
    ]),
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
        shell.openExternal(buildAuthedUrl('/dashboard'));
      },
    },
    {
      label: 'Open Journal',
      click: () => {
        shell.openExternal(buildAuthedUrl('/dashboard/stringer-journal?action=write'));
      },
    },
    {
      label: 'Log Activity',
      click: () => {
        shell.openExternal(buildAuthedUrl('/dashboard/activity'));
      },
    },
    {
      label: 'Settings',
      click: () => {
        shell.openExternal(buildAuthedUrl('/dashboard/settings'));
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
    height: 440,
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
  const handleSend = async (_event, message) => {
    const { getAccessToken } = require('./auth');
    const token = getAccessToken();
    let noPartner = false;

    if (token) {
      try {
        const res = await fetch('https://becandid.io/api/reach-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: message || '' }),
        });
        if (res.status === 404) noPartner = true;
      } catch (err) {
        console.warn('[ReachOut] Send failed:', err);
        // On network error, still show no-partner flow so the UI responds
        noPartner = true;
      }
    } else {
      noPartner = true;
    }

    if (reachOutWindow && !reachOutWindow.isDestroyed()) {
      if (noPartner) {
        reachOutWindow.webContents.send('reach-out:no-partner');
      } else {
        reachOutWindow.webContents.send('reach-out:success');
      }
    }
  };
  ipcMain.on('reach-out:send', handleSend);

  // Handle partner invite from the reach-out window
  ipcMain.once('reach-out:invite', async (_event, data) => {
    const { getAccessToken } = require('./auth');
    const token = getAccessToken();
    if (token) {
      try {
        await fetch('https://becandid.io/api/partners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            partner_name: data.name,
            partner_email: data.email || undefined,
            partner_phone: data.phone || undefined,
            relationship_type: 'accountability',
          }),
        });
      } catch (err) {
        console.warn('[ReachOut] Invite failed:', err);
      }
    }
    if (reachOutWindow && !reachOutWindow.isDestroyed()) {
      reachOutWindow.webContents.send('reach-out:invite-sent');
    }
  });

  ipcMain.on('reach-out:resize', (_event, w, h) => {
    if (reachOutWindow && !reachOutWindow.isDestroyed()) {
      reachOutWindow.setSize(w, h, true);
    }
  });

  const handleCancel = () => {
    if (reachOutWindow && !reachOutWindow.isDestroyed()) {
      reachOutWindow.close();
    }
  };
  ipcMain.on('reach-out:cancel', handleCancel);

  reachOutWindow.on('closed', () => {
    reachOutWindow = null;
    ipcMain.removeListener('reach-out:send', handleSend);
    ipcMain.removeListener('reach-out:cancel', handleCancel);
    ipcMain.removeAllListeners('reach-out:invite');
    ipcMain.removeAllListeners('reach-out:resize');
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

// Pause awareness for N minutes, then auto-resume
let pauseTimer = null;

function pauseAwareness(minutes) {
  const until = Date.now() + minutes * 60000;
  store.set('paused_until', until);
  store.set('monitoring_enabled', false);
  stopCapturing();
  notifyMonitoringToggle(false);
  updateTrayMenu();

  // Clear any existing timer
  if (pauseTimer) clearTimeout(pauseTimer);

  // Auto-resume when the pause expires
  pauseTimer = setTimeout(() => {
    store.delete('paused_until');
    store.set('monitoring_enabled', true);
    startCapturing();
    notifyMonitoringToggle(true);
    updateTrayMenu();
    pauseTimer = null;
  }, minutes * 60000);
}

// On startup, check if a pause timer was active and resume or restore it
(function restorePauseState() {
  const pausedUntil = store.get('paused_until');
  if (pausedUntil) {
    const remaining = pausedUntil - Date.now();
    if (remaining <= 0) {
      // Pause expired while app was closed — resume
      store.delete('paused_until');
      store.set('monitoring_enabled', true);
    } else {
      // Restore the timer for the remaining duration
      pauseTimer = setTimeout(() => {
        store.delete('paused_until');
        store.set('monitoring_enabled', true);
        startCapturing();
        notifyMonitoringToggle(true);
        updateTrayMenu();
        pauseTimer = null;
      }, remaining);
    }
  }
})();

// Refresh tray menu every 30 seconds to update countdown and stats
setInterval(updateTrayMenu, 30000);

module.exports = { createTray, updateTrayMenu, destroyTray };
