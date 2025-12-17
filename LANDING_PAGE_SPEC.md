# Kammi Landing Page Specification

## Brand Philosophy
- **A refuge for writers** — not a productivity tool
- **Kind, safe, eloquent, beautiful**
- **Immersive** — fullscreen by default, no UI noise
- **Personal** — greets you by name ("Good evening, Olli")
- **Target**: Creative professionals — novelists, playwrights, journalers

---

## Design System

### Theme Presets

| Theme | Background | Text | Font | Mood |
|-------|------------|------|------|------|
| **Midnight** (default) | `#1a1a1a` | `#c4b69c` | Georgia | Cozy, night owl |
| **Paper** | `#faf8f0` | `#4a4a4a` | Palatino | Literary, timeless |
| **Focus** | `#ffffff` | `#1a1a1a` | Courier New | Stark, typewriter |

### Typography
| Font | Usage | Mood |
|------|-------|------|
| **Georgia, serif** | Warm, screen-optimized | Disappears while you write |
| **Palatino, 'Palatino Linotype', serif** | Literary, elegant | Classical book feel |
| **'Courier New', monospace** | Typewriter rhythm | Forward momentum |

- **Body size**: 20px default (adjustable 14-32px)
- **Line height**: 1.6
- **Headings**: Same font, italic for elegance

### Visual Style
- **Minimal** — No borders, shadows, or visual noise
- **Warm** — Sepia tones in dark mode, cream in light
- **Elegant** — Subtle transitions, generous whitespace
- **Fullscreen feel** — Centered content, responsive padding

---

## Features (v1.0.2)

### Core
1. **Personal Greeting** — "Good evening, Olli" based on time of day
2. **Auto-Save** — Continuous save to ~/Documents/Kammi
3. **Session Picker** — Browse and resume any previous session
4. **Theme Presets** — Midnight, Paper, Focus + custom save

### Text Formatting
- **Bubble Menu** — Appears on text selection
- **Bold / Italic / Bullet List / Numbered List**
- **Keyboard shortcuts** — Cmd+B, Cmd+I

### Customization
- **Save Custom Theme** — Preserve your settings as a preset
- **Font Selection** — Georgia, Palatino, Courier New
- **Font Size** — 14-32px slider
- **Background Color** — Picker + hex input

---

## Page Structure

### Hero Section
**Background**: `#1a1a1a`  
**Layout**: Centered, 100vh

**Content**:
- **Tagline** (large, italic Georgia): "A refuge for writers"
- **Subheading**: "Distraction-free. Personal. Beautiful."
- **CTA**: "Download for Mac" + "Windows" link
- **Theme Showcase**: Optional 3 tiles showing Midnight/Paper/Focus

### Features Section
**Background**: `#1a1a1a`  
**Layout**: 3 columns or stacked mobile

1. **Personal Greeting** — "Kammi greets you by name and time of day"
2. **Auto-Save** — "Your words are saved continuously"
3. **Session Picker** — "Browse and resume any of your writing sessions"
4. **Save Your Theme** — "Customize colors and fonts, save as your preset"

### Download Section
**Background**: `#faf8f0` (Paper theme)  
**Text**: `#4a4a4a`

**Model**: $9 one-time OR free scholarship
- **CTA**: "Get Kammi — $9" 
- **Secondary**: "Can't afford it? Request a scholarship"
- **Message**: "No subscriptions. No accounts. Pay once, own forever."

**Download buttons**:
- Mac (.dmg): `https://github.com/Ollilai/Kammi/releases/latest`
- Windows (.exe): `https://github.com/Ollilai/Kammi/releases/latest`

### Footer
**Background**: `#1a1a1a`  
**Links**: 
- Privacy: `/privacy`
- Support: `/support`
- GitHub (optional): `https://github.com/Ollilai/Kammi`

---

## Pages

| Page | Purpose |
|------|---------|
| `/` | Landing — Hero, features, download, footer |
| `/privacy` | Privacy policy |
| `/support` | Support contact / FAQ |

---

## CSS Variables (for website)

```css
:root {
    /* Midnight (default) */
    --bg-color: #1a1a1a;
    --text-color: #c4b69c;
    --text-color-dim: rgba(196, 182, 156, 0.4);
    --font-family: Georgia, serif;
    --font-size: 20px;
    --line-height: 1.6;
}

/* Paper theme section */
.theme-paper {
    --bg-color: #faf8f0;
    --text-color: #4a4a4a;
    --font-family: Palatino, 'Palatino Linotype', serif;
}

/* Focus theme section */
.theme-focus {
    --bg-color: #ffffff;
    --text-color: #1a1a1a;
    --font-family: 'Courier New', monospace;
}
```

---

## Copy

### Hero
> **A refuge for writers.**
> 
> Kammi is a minimalist writing sanctuary. No distractions. No clutter. Just you and your words.

### Features
> **Greets you by name**  
> "Good evening, Olli." Kammi knows when you arrive.
>
> **Saves every word**  
> Auto-saves continuously. Your work is always safe.
>
> **Browse your sessions**  
> Return to any piece you've started. Rename files freely.
>
> **Make it yours**  
> Three curated themes, or save your own custom setup.

### Download
> **Start writing today.**
> Free to try. $9 to keep forever. No subscriptions.

---

## Summary
Single-page landing site for Kammi — minimalist writing app. Dark warm palette (Midnight theme), Georgia font, elegant minimal design. Hero with download CTA, features highlighting session picker and custom themes, and footer with privacy/support links. The vibe: cozy, literary sanctuary.
