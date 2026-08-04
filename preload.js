const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ppAPI', {
  loadCreds: () => ipcRenderer.invoke('creds:load'),
  saveCreds: (contas) => ipcRenderer.invoke('creds:save', contas),
  notify: (title, body) => ipcRenderer.invoke('notify', title, body),
  copiarTexto: (texto) => ipcRenderer.invoke('clipboard:copy', texto),
  onHotkey: (cb) => ipcRenderer.on('hotkey', (_e, k) => cb(k))
});
