# Kammi Landing Page Specification (v1.1.0)

## Brand Philosophy
- **A refuge for writers** — not a productivity tool
- **Kind, safe, eloquent, beautiful**
- **Immersive** — fullscreen by default, no UI noise
- **Personal** — greets you by name ("Good evening, Olli")
- **Target**: Creative professionals — novelists, playwrights, journalers

---

## Design System

### Time-Based Theme Presets

Each theme pairs a specific time of day with a curated font and color combination.

| Theme | Time | Background | Text | Font | Mood |
|-------|------|------------|------|------|------|
| **First Light** | 4-6 AM | `#fdfbf5` | `#6b5344` | Baskerville | Discipline, clarity, intention |
| **Daily Pages** | 6-9 AM | `#fff8e7` | `#5c4a3a` | Palatino | Manuscript, personal, journaling |
| **Golden Hour** | 5-7 PM | `#2c2418` | `#d4a55a` | Georgia | Warm, comfortable, pleasure |
| **Midnight** (default) | 10 PM-1 AM | `#1a1a1a` | `#c4b69c` | Garamond | Literary tradition, gravitas |
| **3 AM** | 2-4 AM | `#0f0f12` | `#8fa4b8` | Courier New | Urgency, rhythm, forward momentum |

### Typography

5 curated fonts, each with cross-platform fallbacks:

| Font | CSS Stack | Mood |
|------|-----------|------|
| **Baskerville** | `'Baskerville', 'Baskerville Old Face', 'Libre Baskerville', serif` | Refined, disciplined, 18th-century elegance |
| **Palatino** | `'Palatino', 'Palatino Linotype', 'Book Antiqua', serif` | Manuscript, personal, calligraphic |
| **Georgia** | `'Georgia', serif` | Warm, comfortable, screen-optimized |
| **Garamond** | `'Garamond', 'EB Garamond', 'Cormorant Garamond', serif` | Literary tradition, 500 years of writers |
| **Courier New** | `'Courier New', 'Courier', monospace` | Typewriter rhythm, urgency |

- **Body size**: 20px default (adjustable 14-32px)
- **Line height**: 1.6

### Color Philosophy
- **Background**: Sets the mood (dark for night writing, warm cream for morning)
- **Text**: Curated to complement background with optimal readability
- **Auto-contrast**: When users pick custom background, text auto-adjusts
- **Manual override**: Full control with dedicated text color picker

---

## Features (v1.1.0)

### Core
1. **Personal Greeting** — "Good evening, Olli" based on time of day
2. **Auto-Save** — Continuous save to ~/Documents/Kammi
3. **Session Picker** — Browse and resume any previous session
4. **5 Time-Based Themes** — First Light, Daily Pages, Golden Hour, Midnight, 3 AM
5. **Save Custom Theme** — Preserve your personal color/font combination

### Text Formatting
- **Bubble Menu** — Appears on text selection
- **Bold / Italic / Bullet List / Numbered List**
- **Keyboard shortcuts** — Cmd+B, Cmd+I

### Customization
- **5 Fonts** — Baskerville, Palatino, Georgia, Garamond, Courier New
- **Font Size** — 14-32px slider
- **Background Color** — Picker + hex input
- **Text Color** — Picker + hex input (auto-adjusts, manual override)
- **Fade Effect** — Pen-on-paper focus (toggleable)

---

## CSS Variables (for website)

```css
:root {
    /* Midnight (default) */
    --bg-color: #1a1a1a;
    --text-color: #c4b69c;
    --text-color-dim: rgba(196, 182, 156, 0.4);
    --font-family: 'Garamond', 'EB Garamond', 'Cormorant Garamond', serif;
    --font-size: 20px;
    --line-height: 1.6;
}

/* First Light theme */
.theme-first-light {
    --bg-color: #fdfbf5;
    --text-color: #6b5344;
    --font-family: 'Baskerville', 'Baskerville Old Face', 'Libre Baskerville', serif;
}

/* Daily Pages theme */
.theme-daily-pages {
    --bg-color: #fff8e7;
    --text-color: #5c4a3a;
    --font-family: 'Palatino', 'Palatino Linotype', 'Book Antiqua', serif;
}

/* Golden Hour theme */
.theme-golden-hour {
    --bg-color: #2c2418;
    --text-color: #d4a55a;
    --font-family: 'Georgia', serif;
}

/* 3 AM theme */
.theme-3am {
    --bg-color: #0f0f12;
    --text-color: #8fa4b8;
    --font-family: 'Courier New', 'Courier', monospace;
}
```

---

## Page Structure

### Hero Section
**Background**: `#1a1a1a` (Midnight)  
**Layout**: Centered, 100vh

**Content**:
- **Tagline** (large, italic Garamond): "A refuge for writers"
- **Subheading**: "Distraction-free. Personal. Beautiful."
- **CTA**: "Download for Mac" + "Windows" link
- **Theme Showcase**: 5 tiles showing time-based themes

### Features Section
**Background**: `#1a1a1a`  
**Layout**: 3 columns or stacked mobile

1. **Personal Greeting** — "Kammi greets you by name and time of day"
2. **Auto-Save** — "Your words are saved continuously"
3. **Session Picker** — "Browse and resume any of your writing sessions"
4. **Make It Yours** — "5 curated themes, 5 fonts, or build your own"

### Download Section
**Background**: `#fff8e7` (Daily Pages theme)  
**Text**: `#5c4a3a`

- **CTA**: "Download Kammi"
- **Message**: "Free. No subscriptions. No accounts. Just writing."

**Download buttons**:
- Mac (.dmg): `https://github.com/Ollilai/Kammi/releases/latest`
- Windows (.exe): `https://github.com/Ollilai/Kammi/releases/latest`

### Footer
**Background**: `#1a1a1a`  
**Links**: Privacy | Support | GitHub

---

## Copy

### Hero
> **A refuge for writers.**
> 
> Kammi is a minimalist writing sanctuary. No distractions. No clutter. Just you and your words.

### Theme Story (Optional)
> **When do you write?**
> 
> First Light. Daily Pages. Golden Hour. Midnight. 3 AM.
> Each theme is tuned to the mood of the hour — when the words come.

### Features
> **Greets you by name**  
> "Good evening, Olli." Kammi knows when you arrive.
>
> **Saves every word**  
> Auto-saves continuously. Your work is always safe.
>
> **Browse your sessions**  
> Return to any piece you've started.
>
> **Make it yours**  
> Five curated themes. Five fonts. Or build your own.

### Download
> **Start writing today.**
> Free forever. No subscriptions. No accounts.

---

## Summary
Single-page landing site for Kammi v1.1.0 — minimalist writing app. Dark warm palette (Midnight theme), Garamond font, elegant minimal design. Hero with download CTA, features highlighting time-based themes and customization, and footer with privacy/support links. The vibe: cozy, literary sanctuary for writers who know when their words come.
