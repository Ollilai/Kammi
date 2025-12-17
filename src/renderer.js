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
const AUTOSAVE_DELAY = 1000;

// Theme presets
const THEMES = {
    midnight: { fontFamily: 'Georgia, serif', fontSize: 20, bgColor: '#1a1a1a', textColor: '#c4b69c' },
    paper: { fontFamily: "'Times New Roman', serif", fontSize: 20, bgColor: '#f5f5dc', textColor: '#3d3d3d' },
    focus: { fontFamily: 'Inter, sans-serif', fontSize: 20, bgColor: '#ffffff', textColor: '#1a1a1a' }
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
        },
    });
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
    document.getElementById('menu-privacy').addEventListener('click', () => alert('Privacy Policy coming soon'));
    document.getElementById('menu-support').addEventListener('click', () => alert('Support: hello@kammi.app'));
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
            const theme = THEMES[themeName];

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
}

// ========================================
// SCREEN HANDLERS
// ========================================
function showGreeting() {
    els.greetingText.textContent = `${getTimeGreeting()}, ${settings.name}`;

    // Show Continue option if there's a last session
    const continueBtn = document.getElementById('greeting-continue');
    const newBtn = document.getElementById('greeting-new');

    if (settings.lastSessionFile) {
        continueBtn.style.display = 'block';
        newBtn.textContent = 'Start new';
    } else {
        continueBtn.style.display = 'none';
        newBtn.textContent = 'Click anywhere to begin';
    }

    showScreen('greeting');
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

    applyTheme(settings.customTheme);
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
