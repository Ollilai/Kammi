/**
 * MAIN PROCESS - main.js
 * 
 * Handles: window creation, file saving, and settings storage.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Paths
let mainWindow;
const DOCUMENTS_DIR = app.getPath('documents');
const KAMMI_DIR = path.join(DOCUMENTS_DIR, 'Kammi');
const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

// Default settings (used on first launch)
const DEFAULT_SETTINGS = {
    name: '',  // Empty = trigger onboarding
    theme: 'midnight',
    customTheme: {
        fontFamily: 'Georgia',
        fontSize: 20,
        bgColor: '#1a1a1a',
        textColor: '#c4b69c'
    }
};

/**
 * Ensure Kammi folder exists for saving writings
 */
function ensureKammiFolder() {
    if (!fs.existsSync(KAMMI_DIR)) {
        fs.mkdirSync(KAMMI_DIR, { recursive: true });
    }
}

/**
 * SETTINGS: Get current settings (or defaults if none exist)
 */
ipcMain.handle('get-settings', async () => {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
            return { success: true, settings: JSON.parse(data) };
        }
        // No settings file = first launch
        return { success: true, settings: DEFAULT_SETTINGS };
    } catch (error) {
        console.error('Failed to read settings:', error);
        return { success: false, error: error.message };
    }
});

/**
 * SETTINGS: Save settings to disk
 */
ipcMain.handle('save-settings', async (event, settings) => {
    try {
        await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
        return { success: true };
    } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, error: error.message };
    }
});

/**
 * FILE SAVING: Atomic write strategy
 */
ipcMain.handle('save-content', async (event, filename, content) => {
    try {
        ensureKammiFolder();
        const targetPath = path.join(KAMMI_DIR, filename);
        const tempPath = path.join(KAMMI_DIR, `${filename}.tmp`);

        await fs.promises.writeFile(tempPath, content, 'utf8');
        await fs.promises.rename(tempPath, targetPath);

        return { success: true };
    } catch (error) {
        console.error('Save failed:', error);
        return { success: false, error: error.message };
    }
});

/**
 * FILE READING: Load content from a saved session
 */
ipcMain.handle('read-content', async (event, filename) => {
    try {
        const targetPath = path.join(KAMMI_DIR, filename);
        if (!fs.existsSync(targetPath)) {
            return { success: false, error: 'File not found' };
        }
        const content = await fs.promises.readFile(targetPath, 'utf8');
        return { success: true, content };
    } catch (error) {
        console.error('Read failed:', error);
        return { success: false, error: error.message };
    }
});

/**
 * Create the main window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 600,
        minHeight: 400,
        backgroundColor: '#1a1a1a',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    mainWindow.setFullScreen(true);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
