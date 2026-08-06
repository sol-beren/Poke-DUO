const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ppAPI', {
  loadCreds: () => ipcRenderer.invoke('creds:load'),
  saveCreds: (contas) => ipcRenderer.invoke('creds:save', contas),
  loadScripts: () => ipcRenderer.invoke('scripts:load'),
  saveScripts: (scripts) => ipcRenderer.invoke('scripts:save', scripts),
  importScriptFile: () => ipcRenderer.invoke('scripts:importFile'),
  notify: (title, body) => ipcRenderer.invoke('notify', title, body),
  copiarTexto: (texto) => ipcRenderer.invoke('clipboard:copy', texto),
  onHotkey: (cb) => ipcRenderer.on('hotkey', (_e, k) => cb(k)),
  winMinimize: () => ipcRenderer.invoke('win:minimize'),
  winMaximizeToggle: () => ipcRenderer.invoke('win:maximize-toggle'),
  winClose: () => ipcRenderer.invoke('win:close')
});
