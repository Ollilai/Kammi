// ========================================
// TIPTAP EDITOR SETUP
// ========================================
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

// ========================================
// STATE
// ========================================
let settings = null;
let currentScreen = 'loading';
let sessionFilename = '';
let saveTimeout = null;
let selectedTheme = null;  // For onboarding preview
let editor = null;  // Tiptap editor instance
import { BubbleMenu } from '@tiptap/extension-bubble-menu'

const AUTOSAVE_DELAY = 1000;

// Theme presets
const THEMES = {
    midnight: { fontFamily: 'Georgia, serif', fontSize: 20, bgColor: '#1a1a1a', textColor: '#c4b69c' },
    paper: { fontFamily: "Palatino, 'Palatino Linotype', serif", fontSize: 20, bgColor: '#faf8f0', textColor: '#4a4a4a' },
    focus: { fontFamily: "'Courier New', monospace", fontSize: 20, bgColor: '#ffffff', textColor: '#1a1a1a' }
};

// DOM
const screens = {
    onboardingName: document.getElementById('onboarding-name'),
    onboardingTheme: document.getElementById('onboarding-theme'),
    greeting: document.getElementById('greeting-screen'),
    writing: document.getElementById('writing-screen'),
    menu: document.getElementById('menu-screen'),
    settings: document.getElementById('settings-screen')
};

const els = {
    nameInput: document.getElementById('name-input'),
    greetingText: document.getElementById('greeting-text'),
    editorContainer: document.getElementById('editor-container'),
    cogwheel: document.getElementById('cogwheel'),
    settingsName: document.getElementById('settings-name'),
    settingsFont: document.getElementById('settings-font'),
    settingsFontsize: document.getElementById('settings-fontsize'),
    settingsBgcolor: document.getElementById('settings-bgcolor'),
    settingsBgcolorHex: document.getElementById('settings-bgcolor-hex'),
    settingsFadeEffect: document.getElementById('settings-fade-effect'),
    fontSizeValue: document.getElementById('font-size-value')
};

// ========================================
// UTILITIES
// ========================================
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    currentScreen = name;

    // Show cogwheel only during writing
    els.cogwheel.style.display = (name === 'writing') ? 'block' : 'none';
}

function getContrastColor(bgHex) {
    const r = parseInt(bgHex.slice(1, 3), 16);
    const g = parseInt(bgHex.slice(3, 5), 16);
    const b = parseInt(bgHex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#2d2d2d' : '#e8e0d0';
}

function applyTheme(theme) {
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--text-color-dim', theme.textColor + '66');
    document.documentElement.style.setProperty('--font-family', theme.fontFamily);
    document.documentElement.style.setProperty('--font-size', theme.fontSize + 'px');
}

function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
}

function generateSessionFilename() {
    const date = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    else if (day % 10 === 2 && day !== 12) suffix = 'nd';
    else if (day % 10 === 3 && day !== 13) suffix = 'rd';
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // Changed extension to .html since we're storing rich text now
    return `On ${day}${suffix} of ${months[date.getMonth()]}, ${date.getFullYear()}, ${hours}-${minutes} ${ampm}.html`;
}

// ========================================
// TIPTAP EDITOR INITIALIZATION
// ========================================
function initEditor() {
    editor = new Editor({
        element: els.editorContainer,
        extensions: [
            StarterKit.configure({
                // We'll start with just bold and italic from StarterKit
                // These are included by default
            }),
            BubbleMenu.configure({
                element: document.querySelector('.bubble-menu'),
                tippyOptions: {
                    duration: 200,
                    animation: 'shift-away',
                    zIndex: 999,
                    placement: 'top',
                    offset: [0, 15], // Move it 15px away from text
                    maxWidth: 'none', // Allow it to be as wide as needed
                },
                shouldShow: ({ editor, view, state, from, to }) => {
                    // Only show if selection is not empty and editor is focused
                    return !state.selection.empty && editor.isFocused;
                },
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'writing-editor',
                spellcheck: 'false',
            },
        },
        onUpdate: ({ editor }) => {
            handleInput();

            // Update Bubble Menu states (with null checks)
            document.getElementById('bold-btn')?.classList.toggle('is-active', editor.isActive('bold'));
            document.getElementById('italic-btn')?.classList.toggle('is-active', editor.isActive('italic'));
            document.getElementById('bullet-btn')?.classList.toggle('is-active', editor.isActive('bulletList'));
            document.getElementById('number-btn')?.classList.toggle('is-active', editor.isActive('orderedList'));
        },
        onSelectionUpdate: ({ editor }) => {
            // Validate states on selection change too (with null checks)
            document.getElementById('bold-btn')?.classList.toggle('is-active', editor.isActive('bold'));
            document.getElementById('italic-btn')?.classList.toggle('is-active', editor.isActive('italic'));
            document.getElementById('bullet-btn')?.classList.toggle('is-active', editor.isActive('bulletList'));
            document.getElementById('number-btn')?.classList.toggle('is-active', editor.isActive('orderedList'));
        },
    });

    // Set up fade trailing text effect
    setTimeout(() => setupFadeEffect(), 100);
}

/**
 * Fade Trailing Text - Pen-on-paper focus effect
 * 
 * Uses dynamic CSS injection with :nth-child selectors.
 * This approach works because CSS selectors persist even when
 * ProseMirror recreates DOM elements during editing.
 */
let fadeStyleElement = null;

function setupFadeEffect() {
    // Create a style element for dynamic fade CSS
    fadeStyleElement = document.createElement('style');
    fadeStyleElement.id = 'fade-effect-styles';
    document.head.appendChild(fadeStyleElement);

    // Apply fade on every editor transaction
    editor.on('transaction', () => {
        requestAnimationFrame(applyFadeEffect);
    });

    // Initial application
    setTimeout(applyFadeEffect, 100);
}

function applyFadeEffect() {
    if (!editor || !editor.view || !fadeStyleElement) return;

    // If fade effect is disabled, clear any existing fade CSS
    if (settings && settings.fadeEffect === false) {
        fadeStyleElement.textContent = '';
        return;
    }

    try {
        const { from } = editor.state.selection;
        const $pos = editor.state.doc.resolve(from);

        // Get current block index (0-based, top-level blocks)
        const currentBlockIndex = $pos.index(0);

        // Build CSS rules using :nth-child selectors
        // Current block and after = full opacity (no rule needed)
        // Blocks before cursor = fading opacity based on distance
        let css = '';

        for (let i = 0; i < currentBlockIndex; i++) {
            const distance = currentBlockIndex - i;
            const childNum = i + 1; // nth-child is 1-indexed

            let opacity;
            if (distance === 1) opacity = 0.6;
            else if (distance === 2) opacity = 0.35;
            else if (distance === 3) opacity = 0.2;
            else if (distance === 4) opacity = 0.12;
            else opacity = 0.08; // distance >= 5

            css += `.writing-editor > *:nth-child(${childNum}) { opacity: ${opacity} !important; }\n`;
        }

        fadeStyleElement.textContent = css;
    } catch (e) {
        // Silently ignore errors
    }
}

/**
 * Update fade effect state based on current settings
 * Called when settings are saved to immediately apply the change
 */
function updateFadeEffectState() {
    applyFadeEffect();
}

// ========================================
// INITIALIZATION
// ========================================
async function init() {
    const result = await window.kammi.getSettings();
    if (!result.success) {
        console.error('Failed to load settings');
        return;
    }

    settings = result.settings;

    // Initialize the Tiptap editor
    initEditor();

    // First launch? Start onboarding
    if (!settings.name) {
        showScreen('onboardingName');
        els.nameInput.focus();
    } else {
        // Apply theme and go to greeting
        const theme = settings.theme === 'custom' ? settings.customTheme : THEMES[settings.theme];
        applyTheme(theme);
        showGreeting();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Onboarding: Name
    els.nameInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && els.nameInput.value.trim()) {
            settings.name = els.nameInput.value.trim();
            showScreen('onboardingTheme');
        }
    });

    // Onboarding: Theme selection (PREVIEW, not instant select)
    const themeContinueBtn = document.getElementById('theme-continue');
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const themeName = opt.dataset.theme;
            selectedTheme = themeName;

            // Update visual selection
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');

            // Preview the theme
            if (themeName !== 'custom') {
                applyTheme(THEMES[themeName]);
            }

            // Enable continue button
            themeContinueBtn.classList.add('enabled');
        });
    });

    // Continue button (after theme selection)
    themeContinueBtn.addEventListener('click', async () => {
        if (!selectedTheme) return;

        settings.theme = selectedTheme;

        if (selectedTheme === 'custom') {
            settings.customTheme = { fontFamily: 'Arial, sans-serif', fontSize: 20, bgColor: '#ffffff', textColor: '#1a1a1a' };
            applyTheme(settings.customTheme);
            openSettings();
        } else {
            await window.kammi.saveSettings(settings);
            showGreeting();
        }
    });

    // Greeting: Continue vs New
    document.getElementById('greeting-continue').addEventListener('click', continueLastSession);
    document.getElementById('greeting-browse').addEventListener('click', showSessionList);
    document.getElementById('greeting-new').addEventListener('click', startNewSession);

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (currentScreen === 'writing') {
                showScreen('menu');
            } else if (currentScreen === 'menu' || currentScreen === 'settings') {
                resumeWriting();
            }
        }
    });

    // Cogwheel
    els.cogwheel.addEventListener('click', openSettings);

    // Menu items
    document.getElementById('menu-resume').addEventListener('click', resumeWriting);
    document.getElementById('menu-settings').addEventListener('click', openSettings);
    document.getElementById('menu-privacy').addEventListener('click', () => window.kammi.openExternal('https://kammi-git-main-olli-laitinens-projects.vercel.app/privacy'));
    document.getElementById('menu-support').addEventListener('click', () => window.kammi.openExternal('https://kammi-git-main-olli-laitinens-projects.vercel.app/support'));
    document.getElementById('menu-quit').addEventListener('click', () => window.close());

    // Settings controls - LIVE PREVIEW on all changes
    els.settingsFontsize.addEventListener('input', () => {
        const size = els.settingsFontsize.value;
        els.fontSizeValue.textContent = size;
        document.getElementById('font-size-preview').style.fontSize = size + 'px';
        applyLivePreview();
    });

    els.settingsBgcolor.addEventListener('input', () => {
        els.settingsBgcolorHex.value = els.settingsBgcolor.value;
        applyLivePreview();
    });

    els.settingsBgcolorHex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(els.settingsBgcolorHex.value)) {
            els.settingsBgcolor.value = els.settingsBgcolorHex.value;
            applyLivePreview();
        }
    });

    // Helper: Apply live preview from current form values
    function applyLivePreview() {
        const liveTheme = {
            fontFamily: els.settingsFont.value,
            fontSize: parseInt(els.settingsFontsize.value),
            bgColor: els.settingsBgcolor.value,
            textColor: getContrastColor(els.settingsBgcolor.value)
        };
        applyTheme(liveTheme);
    }

    // Font option clicks
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.addEventListener('click', () => {
            // Update visual selection
            document.querySelectorAll('.font-option').forEach(o => {
                o.style.borderColor = 'var(--text-color-dim)';
                o.style.borderWidth = '1px';
            });
            opt.style.borderColor = 'var(--text-color)';
            opt.style.borderWidth = '2px';

            // Update hidden input and apply live
            els.settingsFont.value = opt.dataset.font;
            applyLivePreview();
        });
    });

    // Theme preset clicks in Settings
    document.querySelectorAll('.theme-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const themeName = preset.dataset.theme;

            // Handle saved theme specially
            let theme;
            if (themeName === 'saved' && settings.savedTheme) {
                theme = settings.savedTheme;
            } else if (THEMES[themeName]) {
                theme = THEMES[themeName];
            } else {
                return; // Unknown theme
            }

            // Update form values to match preset
            els.settingsBgcolor.value = theme.bgColor;
            els.settingsBgcolorHex.value = theme.bgColor;
            els.settingsFont.value = theme.fontFamily;
            els.settingsFontsize.value = theme.fontSize;
            els.fontSizeValue.textContent = theme.fontSize;
            document.getElementById('font-size-preview').style.fontSize = theme.fontSize + 'px';

            // Visual feedback on font options
            document.querySelectorAll('.font-option').forEach(o => {
                o.style.borderColor = o.dataset.font === theme.fontFamily ? 'var(--text-color)' : 'var(--text-color-dim)';
                o.style.borderWidth = o.dataset.font === theme.fontFamily ? '2px' : '1px';
            });

            // Apply live preview
            applyLivePreview();
        });
    });

    document.getElementById('settings-save').addEventListener('click', saveSettings);
    document.getElementById('settings-cancel').addEventListener('click', resumeWriting);

    // Save Current Theme button
    document.getElementById('save-theme-btn').addEventListener('click', async () => {
        // Capture current form values as saved theme
        settings.savedTheme = {
            fontFamily: els.settingsFont.value,
            fontSize: parseInt(els.settingsFontsize.value),
            bgColor: els.settingsBgcolor.value,
            textColor: getContrastColor(els.settingsBgcolor.value)
        };
        await window.kammi.saveSettings(settings);

        // Update the Saved tile appearance and show it
        const savedTile = document.getElementById('saved-theme-tile');
        savedTile.style.display = 'flex';
        savedTile.style.background = settings.savedTheme.bgColor;
        savedTile.style.color = settings.savedTheme.textColor;
        savedTile.style.borderStyle = 'solid';
    });

    // Bubble Menu Buttons
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const bulletBtn = document.getElementById('bullet-btn');
    const numberBtn = document.getElementById('number-btn');

    boldBtn.addEventListener('click', () => {
        editor.chain().focus().toggleBold().run();
    });

    italicBtn.addEventListener('click', () => {
        editor.chain().focus().toggleItalic().run();
    });

    bulletBtn.addEventListener('click', () => {
        editor.chain().focus().toggleBulletList().run();
    });

    numberBtn.addEventListener('click', () => {
        editor.chain().focus().toggleOrderedList().run();
    });
}

// ========================================
// SCREEN HANDLERS
// ========================================
async function showGreeting() {
    els.greetingText.textContent = `${getTimeGreeting()}, ${settings.name}`;

    // Show Continue option if there's a last session
    const continueBtn = document.getElementById('greeting-continue');
    const browseBtn = document.getElementById('greeting-browse');
    const newBtn = document.getElementById('greeting-new');

    if (settings.lastSessionFile) {
        continueBtn.style.display = 'block';
        newBtn.textContent = 'Start new';
    } else {
        continueBtn.style.display = 'none';
        newBtn.textContent = 'Click anywhere to begin';
    }

    // Check if there are any sessions to browse
    const sessionsResult = await window.kammi.listSessions();
    if (sessionsResult.success && sessionsResult.sessions.length > 0) {
        browseBtn.style.display = 'block';
    } else {
        browseBtn.style.display = 'none';
    }

    showScreen('greeting');
}

async function showSessionList() {
    const sessionList = document.getElementById('session-list');
    const browseBtn = document.getElementById('greeting-browse');

    // Toggle visibility
    if (sessionList.style.display === 'block') {
        sessionList.style.display = 'none';
        browseBtn.textContent = 'Browse all sessions';
        return;
    }

    // Load and display sessions
    const result = await window.kammi.listSessions();
    if (!result.success || result.sessions.length === 0) {
        return;
    }

    sessionList.innerHTML = result.sessions.map(session => `
        <p class="session-item" data-filename="${session.filename}" 
           style="cursor: pointer; padding: 0.3rem 0; border-bottom: 1px solid var(--text-color-dim); opacity: 0.8;">
            ${session.displayName}
        </p>
    `).join('');

    // Add click handlers
    sessionList.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', () => loadSession(item.dataset.filename));
    });

    sessionList.style.display = 'block';
    browseBtn.textContent = 'Hide sessions';
}

async function loadSession(filename) {
    sessionFilename = filename;

    // Load content
    const result = await window.kammi.readContent(filename);
    if (result.success) {
        editor.commands.setContent(result.content);
    }

    // Update last session
    settings.lastSessionFile = filename;
    await window.kammi.saveSettings(settings);

    startWriting();
}

async function continueLastSession() {
    sessionFilename = settings.lastSessionFile;

    // Load content from last session
    const result = await window.kammi.readContent(sessionFilename);
    if (result.success) {
        // Set content in Tiptap editor (supports HTML)
        editor.commands.setContent(result.content);
    }

    startWriting();
}

function startNewSession() {
    sessionFilename = generateSessionFilename();
    editor.commands.clearContent();
    startWriting();
}

function startWriting() {
    showScreen('writing');
    // Focus the Tiptap editor
    editor.commands.focus();
    requestAnimationFrame(() => editor.commands.focus());
    setTimeout(() => editor.commands.focus(), 50);
    setTimeout(() => editor.commands.focus(), 150);
}

function resumeWriting() {
    showScreen('writing');
    editor.commands.focus();
    requestAnimationFrame(() => editor.commands.focus());
    setTimeout(() => editor.commands.focus(), 50);
}

function openSettings() {
    const theme = settings.theme === 'custom' ? settings.customTheme : THEMES[settings.theme];
    els.settingsName.value = settings.name;
    els.settingsFont.value = theme.fontFamily;
    els.settingsFontsize.value = theme.fontSize;
    els.fontSizeValue.textContent = theme.fontSize;
    els.settingsBgcolor.value = theme.bgColor;
    els.settingsBgcolorHex.value = theme.bgColor;

    // Fade effect toggle (default to true if not set)
    els.settingsFadeEffect.checked = settings.fadeEffect !== false;

    // Show Saved tile if a saved theme exists
    const savedTile = document.getElementById('saved-theme-tile');
    if (settings.savedTheme) {
        savedTile.style.display = 'flex';
        savedTile.style.background = settings.savedTheme.bgColor;
        savedTile.style.color = settings.savedTheme.textColor;
        savedTile.style.borderStyle = 'solid';
    } else {
        savedTile.style.display = 'none';
    }

    showScreen('settings');
}

async function saveSettings() {
    settings.name = els.settingsName.value.trim() || settings.name;
    settings.theme = 'custom';
    settings.customTheme = {
        fontFamily: els.settingsFont.value,
        fontSize: parseInt(els.settingsFontsize.value),
        bgColor: els.settingsBgcolor.value,
        textColor: getContrastColor(els.settingsBgcolor.value)
    };
    settings.fadeEffect = els.settingsFadeEffect.checked;

    applyTheme(settings.customTheme);
    updateFadeEffectState();
    await window.kammi.saveSettings(settings);
    resumeWriting();
}

// ========================================
// AUTO-SAVE
// ========================================
function handleInput() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        // Get HTML content from Tiptap
        const content = editor.getHTML();
        if (!content || content === '<p></p>') return;

        // Save content
        await window.kammi.saveContent(sessionFilename, content);

        // Store this as the last session (for resume)
        if (settings.lastSessionFile !== sessionFilename) {
            settings.lastSessionFile = sessionFilename;
            await window.kammi.saveSettings(settings);
        }
    }, AUTOSAVE_DELAY);
}

// Save before closing (ensures Windows saves session)
window.addEventListener('beforeunload', async () => {
    if (editor) {
        const content = editor.getHTML();
        if (content && content !== '<p></p>' && sessionFilename) {
            await window.kammi.saveContent(sessionFilename, content);
            if (settings.lastSessionFile !== sessionFilename) {
                settings.lastSessionFile = sessionFilename;
                await window.kammi.saveSettings(settings);
            }
        }
    }
});

// Start
init();
