/**
 * Preload script — secure bridge between renderer and main process.
 * Exposes only the auth API to the login window.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('becandid', {
  signIn: (email, password) => ipcRenderer.invoke('auth:signIn', email, password),
  isAuthenticated: () => ipcRenderer.invoke('auth:isAuthenticated'),
  onAuthSuccess: () => ipcRenderer.send('auth:success'),
  sendReachOut: (message) => ipcRenderer.send('reach-out:send', message),
  cancelReachOut: () => ipcRenderer.send('reach-out:cancel'),
});
