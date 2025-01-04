const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendStartShare: () => ipcRenderer.send('start-share'),
    sendStopShare: () => ipcRenderer.send('stop-share'),
    onUuid: (callback) => ipcRenderer.on('uuid', callback),
});