import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  checkNode: () => ipcRenderer.invoke('check-node'),
  checkOpenClaw: () => ipcRenderer.invoke('check-openclaw'),
  installOpenClaw: () => ipcRenderer.invoke('install-openclaw'),
  runOpenClawOnboard: () => ipcRenderer.invoke('run-openclaw-onboard'),
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (config: object) => ipcRenderer.invoke('write-config', config),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
})
