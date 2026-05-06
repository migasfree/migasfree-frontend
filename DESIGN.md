---
name: migasfree-frontend
description: Visual identity for Migasfree Systems Management. A Luxury Scientific aesthetic combining earth tones with high-tech glassmorphism.
version: 1.1.0

colors:
  primary: '#431407' # Deep Espresso Brown
  on-primary: '#ffffff'
  secondary: '#705a56' # Sophisticated Slate Brown
  tertiary: '#feda00' # Migasfree Yellow Accent
  background: '#fcfaf9' # Warm Limestone foundation
  surface: '#ffffff'
  border: '#eee4e1'

  success: '#166534'
  warning: '#a16207'
  error: '#dc2626'
  info: '#1e40af'

typography:
  font-family-ui: 'Dosis, sans-serif'
  font-family-mono: 'JetBrains Mono, monospace'

  h1:
    fontFamily: '{typography.font-family-ui}'
    fontSize: '2.5rem'
    fontWeight: '700'
    lineHeight: '1.2'

  body-base:
    fontFamily: '{typography.font-family-ui}'
    fontSize: '1rem'
    lineHeight: '1.5'

  label-caps:
    fontFamily: '{typography.font-family-ui}'
    fontSize: '0.75rem'
    fontWeight: '800'
    letterSpacing: '0.1em'
    textTransform: 'uppercase'

rounded:
  default: '12px'
  glass: '20px'
  menu: '16px'
  menu-item: '10px'
  chip: '12px'
  input: '8px'

spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'

components:
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.default}'
    padding: '{spacing.md}'

  glass-panel:
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
    rounded: '{rounded.glass}'
    backdropFilter: 'blur(12px)'

  q-menu:
    backgroundColor: 'rgba(var(--bg-card-rgb), 0.8)'
    backdropFilter: 'blur(20px) saturate(180%)'
    rounded: '{rounded.menu}'
    border: '1px solid rgba(var(--brand-primary-rgb), 0.08)'
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)'

  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.input}'
    padding: '0 12px'
---

# Design System: Luxury Scientific (Migasfree)

## 📌 Overview

The Migasfree design system evokes a premium, professional, and institutional experience that balances the precision of a scientific instrument interface with the organic warmth of earth tones. It carefully avoids the "cold" blue-dominated aesthetic typical of generic tech platforms, opting instead for a "modern gallery" or "high-end scientific journal" feel.

This visual identity is driven by two core aesthetic pillars:

- **Glassmorphism (Glass Effects):** Translucent surfaces with deep background blur to provide elegant spatial hierarchy and tactile modern depth.
- **Earth Tones (Earth Palette):** A high-contrast, warm color foundation representing stability, robustness, and technical reliability in managing critical systems infrastructure.

---

## 🎨 Color Palette

The palette is segmented into interactive brand tones, organic background foundations, and high-contrast accents.

- **Primary (#431407):** Deep Espresso Brown. Used for headings, major UI anchors, and primary brand elements. It delivers a highly sophisticated and premium contrast.
- **Secondary (#705a56):** Sophisticated Slate Brown. Used for body text, metadata descriptions, and secondary interactive states.
- **Tertiary (#feda00):** Migasfree Yellow Accent. A vibrant brand yellow used selectively for critical active states, warning indicators, and brand recognition accents.
- **Neutrals (Limestone Foundation):** The default application background is a warm Limestone (`#fcfaf9`), providing a softer, more organic and premium visual foundation than pure sterile white.

### 🌓 Dark Mode

In dark mode, the interface transitions to an aesthetic inspired by deep ink (`#0d0807`) and charcoal brown (`#1a1210`).

- **Dynamic RGB Variables:** To construct precise transparency overlays, RGB variables are exposed dynamically in the DOM:
  - `--bg-card-rgb`: Evaluates to `255, 255, 255` in light mode, and `26, 18, 16` in dark mode.
  - `--brand-primary-rgb`: Facilitates translucent overlays using brand colors dynamically.

### 🟫 Neutral Scale (Earth Palette)

Color consistency and rigorous readability (maintaining a **4.5:1** contrast ratio according to WCAG AA guidelines) are managed via a limestone-based warm gray scale:

| Variable Token  | Light Mode (Limestone Base) | Dark Mode (Inverted) | Primary UI Purpose                       |
| :-------------- | :-------------------------- | :------------------- | :--------------------------------------- |
| `--neutral-50`  | `#fcfaf9`                   | `#1a1210`            | General page background (`body`)         |
| `--neutral-100` | `#f7f2f0`                   | `#251b19`            | Field backgrounds and secondary cards    |
| `--neutral-200` | `#eee4e1`                   | `#3c2f2c`            | Standard and inactive borders            |
| `--neutral-300` | `#d6c1ba`                   | `#6b554f`            | Dividers and custom scrollbars           |
| `--neutral-400` | `#b5a4a0`                   | `#a38c86`            | Placeholders and secondary help texts    |
| `--neutral-500` | `#755f5a`                   | `#b5a4a0`            | Inactive labels and subtitles            |
| `--neutral-700` | `#5c4842`                   | `#dfcfca`            | Medium contrast secondary body text      |
| `--neutral-800` | `#251b19`                   | `#eee4e1`            | Primary text inside cards                |
| `--neutral-900` | `#1a1210`                   | `#fefce8`            | Primary headlines and high-contrast text |

The automatic inversion of neutral shades in dark mode preserves organic visual warmth while preventing user eye strain in low-light environments.

---

## ✍️ Typography

The system prioritizes technical precision blended with softened geometric edges.

- **Dosis (UI & Controls):** Used for all interface typography. Its rounded and professional character provides a friendly, human-centric, yet rigorous brand voice.
- **JetBrains Mono (Data & Code):** Monospace font used for console output, system logs, hardware specs, and any screen requiring character-aligned technical layout.

---

## 💎 Glassmorphism & Translucent Interfaces

The glass effects are engineered under strict optical rules to ensure continuous legibility:

### 1. Unified Menus & Dropdowns (`.q-menu`)

All popover menus, Quasar select dropdowns (`q-select`), and context containers (`.q-menu`) must inherit the exact glassmorphism specifications unifed with the search bar:

- **Translucent Surface:** `background: rgba(var(--bg-card-rgb), 0.8) !important;`
- **Background Blur:** `backdrop-filter: blur(20px) saturate(180%) !important;` (including `-webkit-` vendor support).
- **Thin Border:** `border: 1px solid rgba(var(--brand-primary-rgb), 0.08) !important;` (swaps to `rgba(255, 255, 255, 0.08)` in dark mode).
- **Geometric Radius:** `16px` border-radius for the menu container, and `10px` for internal active cells (`.q-item`).

### 2. Form Controls & Inputs (`.q-field`)

Inputs and select components reflect the geometric precision of the Luxury Scientific aesthetic, featuring crisp contrast and fluid interaction transitions:

- **Base Control Geometry (`.q-field__control`):**
  - Mandatory minimum height: `56px` to guarantee an optimal touch target.
  - Border radius: `8px` for geometric symmetry with main action buttons.
  - Fluid transition: `background-color 0.2s, border-color 0.2s, box-shadow 0.2s` for immediate, soft focus feedback.

- **Filled Variant (`.q-field--filled`):**
  - Inactive background starts at warm clay gray (`var(--neutral-100)`), transforming to pure Limestone (`var(--neutral-50)`) on focus.
  - Features a subtle brand-primary bottom border (`rgba(var(--brand-primary-rgb), 0.5)`), which scales a solid `4px` active accent (`--brand-primary`) on focus:

    ```css
    transform: scaleX(1); /* Smoothly scales from center on focus */
    ```

- **Outlined Variant (`.q-field--outlined`):**
  - Transparent background with a fine solid border. Upon focus, harsh borders are skipped in favor of a soft translucent halo:

    ```css
    box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb), 0.1) !important;
    ```

- **Floating Labels (`.q-field__label`):**
  - Inactive labels start with weight `500` colored in `--neutral-500`. On active float (`.q-field--float`), the label transitions upward (`translateY(-40%) scale(0.75)`), taking on weight `700` and the primary brand color.

- **Dark Mode Adaptability:**
  - In dark mode, the input background `.q-field__control` adopts an anthracite tone (`#251b19`) with a subtle `rgba(255, 255, 255, 0.1)` border. On focus, the active bottom accent is highlighted in high-contrast yellow (`#fefce8`).

---

## 🏗️ Vue SFC CSS Engineering Best Practices

To maintain code excellence across components:

- **Separation of Concerns (DRY):** **NEVER** write global, un-scoped `<style>` blocks inside individual Vue Single File Components (`.vue`).
- **Centralization of Portals:** If a style applies to teleported elements rendered at the root of the DOM (like Quasar's `.q-menu`, `.scope-menu`, or `.alerts-menu`), its definitions **MUST** reside exclusively inside [style.css](file:///home/usuarioayto/github/migasfree-frontend/src/css/style.css). Components should only maintain local, scoped CSS using `<style scoped>`.

---

## 🏃‍♂️ Motion & Micro-interactions

Motion in the Migasfree UI is designed to be subtle, natural, and responsive.

### 1. Unified Physic Easing

Modals, dropdowns, and cards emerge with a realistic physical damping transition:

```css
transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
```

This cubic-bezier simulates real-world physics, starting with swift acceleration and transitioning into a smooth, amortized deceleration at the end of the motion.

### 2. Static Hover States (No Lateral Translation)

- **Critical Constraint:** Text rows or list items (`.q-item`) **must not** apply lateral translations on hover (e.g., `transform: translateX(2px)`). This shifting motion disrupts reading flow and creates layout instability on high-density data lists.
- **Translucent Hover:** Hover states are limited to subtle glass-like background shifts:
  - **Light Mode:** `background: rgba(var(--brand-primary-rgb), 0.05) !important;`
  - **Dark Mode:** `background: rgba(255, 255, 255, 0.06) !important;`
- **Scale on Support Accents:** Gentle scaling (`transform: scale(1.05)`) is reserved exclusively for independent visual anchors such as circular icon buttons or status badges, never on principal text labels.
