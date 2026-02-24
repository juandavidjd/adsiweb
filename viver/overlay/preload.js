const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('odiOverlay', {
  version: '0.1.0',
});
