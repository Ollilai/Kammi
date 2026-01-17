# Kammi Monetization Plan - Context for Development

## Overview
We're adding a paid license system to Kammi, a minimalist distraction-free writing app. The goal is to monetize while **preserving Kammi's core philosophy**: a refuge for writers, not a productivity tool.

---

## Strategic Decisions Made

### 1. Distribution & Code Signing
- **Mac**: Will pay $99/year for Apple Developer certificate (removes scary warnings)
- **Windows**: No code signing (too expensive), will accept unsigned warnings for now
- **Why**: Mac signing is worth it for trust + small cost. Windows can wait until revenue justifies $200-500/year

### 2. Monetization Model
- **Model**: 14-day trial → €29 one-time purchase (NOT subscription)
- **Philosophy**: Kammi is a refuge, not SaaS. Writers hate subscriptions (see: Ulysses backlash)
- **Device Limit**: 1 device per license
  - Reasoning: Pro writers use ONE main machine
  - Prevents casual key sharing
  - Can add "deactivate device" option later for laptop upgrades
- **Post-Trial Behavior**: Hard block (no writing after trial expires)
  - BUT: Don't interrupt mid-writing session
  - Show activation screen on quit/reopen

### 3. Payment Processor
- **Choice**: Gumroad
- **Why**:
  - Handles EU VAT automatically
  - Has built-in License Key API (no custom server needed)
  - 10% fee is reasonable for simplicity
  - Dead simple to integrate

### 4. Trial System
- **Length**: 14 days
- **Tracking**: Local (first launch date in settings.json)
- **Reminders**:
  - Days 1-10: Silent (just enjoy the app)
  - Day 11: Gentle reminder in ESC menu: "Trial: 3 days left"
  - Day 13: Reminder when quitting: "Trial ends tomorrow"
  - Day 14: Reminder when quitting: "Trial ends today"
  - Day 15+: Activation screen before writing canvas

### 5. Essential Features to Add Before Launch
Before we can justify charging €29, we need:

**Tier 1: Must-Have (needed for paid launch)**
1. **Export functionality** - TXT, Markdown, PDF, DOCX (writers need to get their work OUT)
2. **Session titles** - Replace "Modified 3 days ago" with actual titles
3. **Search across sessions** - Full-text search when you have 50+ sessions

**Tier 2: Nice-to-Have (for v1 or shortly after)**
4. **Community themes** - JSON import/export for custom themes
5. **Word count** - Show word count in editor
6. **Better session organization** - Maybe tags or folders (later)

---

## Technical Architecture Decisions

### License Key Format
- **Format**: `KAMMI-XXXX-XXXX-XXXX` (Gumroad auto-generates)
- **Why**: Human-readable, professional, easy to copy/paste
- **Validation**: Server-side via Gumroad's License API

### Trial Tracking
- **Method**: Local storage (settings.json)
- **Fields**:
  ```json
  {
    "trialStartDate": "2026-01-17",
    "licenseKey": null,
    "isActivated": false,
    "deviceId": "unique-device-identifier"
  }
  ```
- **Anti-cheat**: Store trial date in multiple places, use device ID
- **Accept**: Some users will crack it (5-10%), but 90% will pay

### License Validation Flow
1. User purchases on Gumroad → receives `KAMMI-XXXX-XXXX-XXXX` via email
2. User enters key in Kammi → App calls Gumroad API: "Is this key valid?"
3. Gumroad validates key + checks device count
4. If valid → App stores activation in settings.json
5. User can now use app offline (no server check after first activation)

### Device Limit Implementation
- Generate unique device ID (MAC address + hostname hash)
- Store device ID with license on first activation
- On subsequent activations: Check if device ID matches
- If different device → block ("This license is already activated on another device")
- **Future**: Add "deactivate this device" button in settings to allow transfers

---

## UX Design Philosophy

### Core Principle: **The Writing Canvas is Sacred**

**What This Means:**
- ✅ NEVER interrupt during writing (no popups, no timers on canvas)
- ✅ Trial reminders ONLY in ESC menu or on quit
- ✅ License screens appear BEFORE writing canvas (on app open)
- ✅ Activation flows match Kammi's aesthetic (dark, calm, literary)

### License Screen Design Language
To match Kammi's aesthetic (see screenshots: dark background, serif fonts, quotes from Eino Leino):

**Visual Style:**
- Same dark background as writing canvas
- Same serif font (Baskerville/Palatino)
- Minimal, centered layout
- No bright colors (except one accent for CTA button)
- Lots of breathing room (whitespace/darkspace)

**Copy Tone:**
- Quiet, respectful, literary
- No urgency tactics ("LAST CHANCE!!!")
- No guilt trips
- Honest: "This app costs money to make. If you find it valuable, please support it."

**Example (Trial Ended Screen):**
```
┌─────────────────────────────────────────┐
│                                         │
│         Your trial has ended.          │
│                                         │
│   Kammi is a refuge for writers who    │
│   value focus and calm. If it's been   │
│   valuable to you, please consider     │
│   supporting its development.          │
│                                         │
│       [Purchase License — €29]         │
│                                         │
│       [I already have a license]       │
│                                         │
└─────────────────────────────────────────┘
```

### User Flow Examples

**First Launch (Day 1):**
```
User opens Kammi
  ↓
Welcome screen: "Welcome to Kammi. You have 14 days to explore."
  ↓
[Start Writing]
  ↓
ESC menu shows: "Trial: 14 days left" (subtle, bottom of menu)
```

**During Trial (Days 2-13):**
```
User opens Kammi
  ↓
Straight to writing canvas (no interruption)
  ↓
Trial reminder only in ESC menu
```

**Trial Ending (Day 14):**
```
User writes, then presses CMD+Q
  ↓
"Your trial ends today. Purchase to continue."
  ↓
[Purchase] [Remind me later] [I have a key]
```

**Trial Expired (Day 15+):**
```
User opens Kammi
  ↓
Activation screen (BEFORE canvas appears)
  ↓
"Your trial has ended. Please activate a license."
  ↓
[Purchase License (€29)] [Enter License Key] [Exit]
  ↓
NO writing until activated (hard block)
```

**Mid-Session Expiration:**
```
Trial expires WHILE user is writing
  ↓
Don't interrupt them (let them finish)
  ↓
Show activation screen when they quit or reopen
```

---

## Implementation Timeline

### Week 1: Core Monetization Infrastructure
1. ✅ Create `Kammi-paid` private repo (DONE)
2. Add trial tracking system (settings.json with trialStartDate)
3. Build Gumroad API integration (license validation)
4. Create activation UI screens (matching Kammi aesthetic)
5. Add trial reminders (ESC menu + quit screen)
6. Generate device ID (for 1-device limit)
7. Test full flow: first launch → trial → expired → activation

### Week 2: Essential Features
8. Export functionality (TXT, Markdown, PDF, DOCX)
9. Session titles (user can name sessions instead of "Modified 3 days ago")
10. Search across sessions (simple full-text search)

### Week 3: Polish & Launch
11. Community themes (JSON import/export)
12. Mac code signing ($99 Apple Developer, integrate into build)
13. Final testing (trial flow, license validation, exports)
14. Set up Gumroad product page
15. Launch! 🚀

---

## Current Codebase State

### What We Have (It's Actually Pretty Good!)
- ✅ Clean Electron architecture (main + renderer, proper IPC)
- ✅ Security best practices (context isolation, preload script)
- ✅ Auto-save (every 1 second)
- ✅ Session management
- ✅ 5 time-based themes + custom theme builder
- ✅ Font customization (5 fonts, size slider)
- ✅ Fade effect (pen-on-paper focus)
- ✅ Auto-update system (via electron-updater + GitHub releases)

### What's Missing (What We'll Build)
- ❌ License system (trial tracking, validation)
- ❌ Export functionality
- ❌ Session titles
- ❌ Search across sessions
- ❌ Community themes (import/export)

### Key Files to Modify
```
/main.js - Add license checking IPC handlers
/preload.js - Expose license validation methods to renderer
/src/renderer.js - Check license on init, feature gates
/src/index.html - Add license activation UI
/(new) src/license.js - License validation logic
/(new) src/export.js - Export functionality
```

---

## Repository Setup

### Current State
- **Original repo**: `Ollilai/Kammi` (public, free version)
- **New repo**: `Ollilai/Kammi-paid` (private, for paid development)
- **Branch**: Working on `main` branch in Kammi-paid
- **Status**: Repo initialized with full codebase, ready for development

### Git Workflow
- All development happens in `Kammi-paid` repo
- Keep commits clean and descriptive
- When features are ready: build, sign (Mac), release

---

## Next Immediate Steps

**Start here in the new session:**

1. **Set up working directory**: `cd /home/user/Kammi-paid`
2. **Verify codebase**: Check that all files are present
3. **Create license system branch** (optional): `git checkout -b feature/license-system`
4. **Begin Week 1 tasks**:
   - Task 1: Add trial tracking to settings.json
   - Task 2: Build license validation IPC handlers
   - Task 3: Create activation UI screens

---

## Important Context: Kammi's Philosophy

From `CLAUDE.md` in the repo:

> **What it is:** A minimalist, distraction-free writing app
> **Philosophy:** A refuge, not a productivity tool
> **Stack:** Electron (learning focus)

This philosophy **must inform every decision**:
- License screens should feel like Kammi (dark, calm, literary)
- No aggressive sales tactics (no "BUY NOW!!!" popups)
- Don't interrupt writing (trial reminders only in menu/quit screen)
- Respect the user's flow (let them finish if trial expires mid-session)

The app currently has:
- Dark themes with literary quotes (e.g., Eino Leino, "Halla" 1908)
- Serif fonts (Baskerville, Palatino, Georgia, Garamond, Courier New)
- Fade effect (pen-on-paper focus, fades previous lines)
- ESC menu for settings (subtle, non-intrusive)

**Every feature we add must maintain this aesthetic and philosophy.**

---

## Questions Answered

**Q: Should we rebuild from scratch with Tauri/Rust to prevent reverse-engineering?**
**A**: No. The current Electron codebase is solid, and rebuilding would delay monetization by 2-3 months. Accept that 5-10% of users might crack it (they wouldn't pay anyway). Focus on making the product so good that 90% WANT to pay. Server-side license validation prevents key sharing (the real threat).

**Q: What about reverse-engineering?**
**A**: Electron apps are inherently reversible (.asar files can be extracted). But:
- 90% of users won't try
- 5% who crack it were never going to pay
- Server-side validation prevents key sharing (the bigger threat)
- Successful paid Electron apps (Sizzy, Polypane, Volta) accept this

**Q: Why 1 device instead of 2-3?**
**A**: Pro writers typically use ONE main machine. This prevents casual sharing while keeping licensing simple. Can add device transfer option later.

**Q: Why hard block instead of soft nag (limited sessions after trial)?**
**A**: Olli's preference. But we respect the flow - if trial expires mid-writing, let them finish. Show activation screen on quit/reopen.

---

## Code Snippets for Reference

### Trial Tracking (settings.json structure)
```json
{
  "userName": "Olli",
  "theme": "Midnight",
  "font": "Baskerville",
  "fontSize": 20,
  "fadeEffect": true,
  "customThemes": [],
  "trialStartDate": "2026-01-17",
  "licenseKey": null,
  "isActivated": false,
  "deviceId": "abc123def456"
}
```

### Gumroad License Validation (main.js)
```javascript
const { ipcMain } = require('electron');

ipcMain.handle('validate-license', async (event, licenseKey) => {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'YOUR_GUMROAD_PRODUCT_ID',
        license_key: licenseKey,
        increment_uses_count: false
      })
    });

    const data = await response.json();

    if (data.success && data.purchase.refunded === false && data.purchase.chargebacked === false) {
      return { valid: true };
    } else {
      return { valid: false, reason: 'Invalid or revoked license' };
    }
  } catch (error) {
    return { valid: false, reason: 'Could not verify license. Check your internet connection.' };
  }
});
```

### Device ID Generation
```javascript
const crypto = require('crypto');
const os = require('os');

function generateDeviceId() {
  const networkInterfaces = os.networkInterfaces();
  let macAddress = '';

  // Get first non-internal MAC address
  for (const name in networkInterfaces) {
    for (const net of networkInterfaces[name]) {
      if (!net.internal && net.mac !== '00:00:00:00:00:00') {
        macAddress = net.mac;
        break;
      }
    }
    if (macAddress) break;
  }

  const hostname = os.hostname();
  const uniqueString = `${macAddress}-${hostname}`;

  return crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 32);
}
```

---

## Success Criteria

We're ready to launch when:
- ✅ 14-day trial works (tracks start date, shows reminders, blocks after expiration)
- ✅ License activation works (validates with Gumroad, stores in settings.json, unlocks app)
- ✅ Device limit works (1 device per license, generates unique ID)
- ✅ Export works (TXT, MD, PDF, DOCX)
- ✅ Session titles work (user can name sessions)
- ✅ Search works (full-text search across sessions)
- ✅ Mac app is signed (no scary warnings)
- ✅ License screens match Kammi aesthetic (dark, calm, literary)
- ✅ No interruptions during writing (trial reminders only in menu/quit)

---

## Final Notes

- **Repo**: Work in `Kammi-paid` (private)
- **Philosophy**: Preserve Kammi's refuge aesthetic in all license screens
- **Timeline**: 3 weeks to launch
- **Pricing**: €29 one-time, 14-day trial
- **Payment**: Gumroad (handles EU VAT)
- **Device Limit**: 1 device per license
- **Post-Trial**: Hard block, but respect mid-session writing

**Let's build this! 🚀**
