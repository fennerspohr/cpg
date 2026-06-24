const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openWindow: (type, params) => ipcRenderer.send('open-window', type, params),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  notifyRefresh: () => ipcRenderer.send('notify-refresh'),
  onRefresh: (callback) => {
    ipcRenderer.on('do-refresh', callback)
    return () => ipcRenderer.removeListener('do-refresh', callback)
  },
  navigateMain: (path) => ipcRenderer.send('navigate-main', path),
  onNavigate: (callback) => {
    ipcRenderer.on('do-navigate', (_, path) => callback(path))
    return () => ipcRenderer.removeAllListeners('do-navigate')
  },
})
