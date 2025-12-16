/**
 * PRELOAD SCRIPT - preload.js
 * 
 * Bridge between main process and renderer.
 * Exposes: saveContent, getSettings, saveSettings
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kammi', {
    platform: process.platform,

    // Save writing content
    saveContent: (filename, content) =>
        ipcRenderer.invoke('save-content', filename, content),

    // Read writing content
    readContent: (filename) =>
        ipcRenderer.invoke('read-content', filename),

    // Get settings (returns { success, settings } or { success: false, error })
    getSettings: () =>
        ipcRenderer.invoke('get-settings'),

    // Save settings
    saveSettings: (settings) =>
        ipcRenderer.invoke('save-settings', settings)
});

console.log('🏠 Kammi preload ready');
