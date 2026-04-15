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
  invitePartner: (data) => ipcRenderer.send('reach-out:invite', data),
  onReachOutSuccess: (callback) => ipcRenderer.on('reach-out:success', callback),
  onNoPartner: (callback) => ipcRenderer.on('reach-out:no-partner', callback),
  resizeWindow: (w, h) => ipcRenderer.send('reach-out:resize', w, h),
  onInviteSent: (callback) => ipcRenderer.on('reach-out:invite-sent', callback),
});
