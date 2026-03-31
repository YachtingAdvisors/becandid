/**
 * Be Candid Desktop Screen Monitor — Main Process
 *
 * Tray-only Electron app that captures periodic screenshots,
 * runs AI analysis via the Be Candid API, and feeds results
 * into the event/alert pipeline.
 */

const { app, BrowserWindow, powerMonitor, ipcMain, systemPreferences, desktopCapturer } = require('electron');
const path = require('path');
const { isAuthenticated, signIn, fetchSettings } = require('./auth');
const { startCapturing, stopCapturing, setPaused, captureOnce } = require('./capturer');
const { createTray, destroyTray } = require('./tray');
const { store } = require('./store');

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// Don't show in dock on macOS (tray-only app)
if (process.platform === 'darwin') {
  app.dock?.hide();
}

let loginWindow = null;

app.whenReady().then(async () => {
  // Request screen recording permission immediately on macOS
  // This triggers the system permission prompt on first launch
  if (process.platform === 'darwin') {
    try {
      const hasAccess = systemPreferences.getMediaAccessStatus('screen');
      if (hasAccess !== 'granted') {
        // Trigger the permission prompt by attempting a capture
        desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } })
          .then(() => console.log('[permissions] Screen recording access granted'))
          .catch(() => console.log('[permissions] Screen recording access pending'));
      }
    } catch {}
  }

  // Set up power monitoring for idle detection
  powerMonitor.on('lock-screen', () => setPaused(true));
  powerMonitor.on('unlock-screen', () => setPaused(false));
  powerMonitor.on('suspend', () => setPaused(true));
  powerMonitor.on('resume', () => setPaused(false));

  // Set up IPC handlers for login window
  ipcMain.handle('auth:signIn', async (_event, email, password) => {
    try {
      const user = await signIn(email, password);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('auth:isAuthenticated', () => isAuthenticated());

  // Check if already authenticated
  if (isAuthenticated()) {
    await fetchSettings();
    launchMonitoring();
  } else {
    showLoginWindow();
  }
});

function showLoginWindow() {
  if (loginWindow) {
    loginWindow.focus();
    return;
  }

  loginWindow = new BrowserWindow({
    width: 400,
    height: 520,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#fbf9f8',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  loginWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  loginWindow.on('closed', () => {
    loginWindow = null;
    // If user closed login window without signing in, quit
    if (!isAuthenticated()) {
      app.quit();
    }
  });
}

function launchMonitoring() {
  // Close login window if open
  if (loginWindow) {
    loginWindow.close();
    loginWindow = null;
  }

  // Create system tray
  createTray({
    onSignOut: () => {
      destroyTray();
      showLoginWindow();
    },
  });

  // Start capturing
  if (store.get('monitoring_enabled')) {
    startCapturing();
  }

  // Register as login item (auto-start on boot)
  if (store.get('auto_launch')) {
    app.setLoginItemSettings({ openAtLogin: true });
  }

  // Refresh settings periodically (every 30 min)
  setInterval(fetchSettings, 30 * 60 * 1000);
}

// IPC: login window signals successful auth
ipcMain.on('auth:success', () => {
  launchMonitoring();
});

// Prevent app from quitting when all windows are closed (tray-only)
app.on('window-all-closed', (e) => {
  if (isAuthenticated()) {
    // Stay running as tray app
  } else {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopCapturing();
  destroyTray();
});
