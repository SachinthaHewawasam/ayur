import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  isElectron: true
});

// Log that preload script has loaded
console.log('Electron preload script loaded');
