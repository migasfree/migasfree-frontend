---
title: 'Style Guide'
description: 'Reference guide for UI/UX elements, styling patterns, and the visual language of the Migasfree ecosystem.'
diataxis_quadrant: 'Reference'
---

This reference guide defines the variables, patterns, and design principles that standardize the visual appearance of the **Migasfree ecosystem** (including tools like `migasfree-frontend`, `migasfree-play`, and the main web portal). This document acts as the **"Single Source of Truth"** for the visual style under the precepts of _Functional Design_ (UI/UX) and the _Migasfree Visual Language_.

## 1. Design Philosophy ("Scientific Clean" & Functionality)

- **Functionality over Art**: Every visual element must solve a navigation, hierarchy, or usage problem, reducing cognitive load.
- **Glassmorphism**: Use of translucent surfaces with blur over backgrounds that provide a technical, modern, and premium appearance.
- **The 4px Rule**: All margins, paddings, and sizes MUST be multiples of `4px` to maintain a coherent visual rhythm, regardless of the framework or tech stack used.

---

## 2. Color Palette (Earth Palette & Semantics)

The ecosystem uses a warm corporate palette (_Earth Palette_) in light mode, along with a high-contrast native dark mode designed to prevent eye fatigue during long operational hours.

**Corporate Scheme (Brand):**

- `Primary`: `#431407` (Deep Brown - ACME Brand) - Hex RGB: `67, 20, 7`
- `Secondary`: `#8d7772`
- `Tertiary/Accent`: `#feda00` (Corporate Yellow)
- `On-Primary`: `#ffffff` (Main text over Primary backgrounds)

**Dark Mode (`[data-theme="dark"]`):**

In dark mode, the scheme adapts dynamically for graphical interfaces and websites:

- General Background: `#0d0807`
- Surfaces / Cards: `#1a1210`
- `Primary` (Actionable texts): `#fefce8` (Cream)
- `Text-Main`: `#fefce8`

**Semantic Colors (Use only to denote states):**

- **Success**: `#166534` (Green) / Light Surface: `rgba(22, 101, 52, 0.08)`
- **Warning**: `#a16207` (Dark Yellow/Ochre) / Light Surface: `rgba(161, 98, 7, 0.08)`
- **Critical/Error**: `#dc2626` (Red) / Light Surface: `rgba(220, 38, 38, 0.08)`
- **Info**: `#1e40af` (Blue) / Light Surface: `rgba(30, 64, 175, 0.08)`

_Note on technical implementation: If the project uses styled frameworks (like Quasar, Vuetify, Tailwind, or vanilla SCSS), the base utilities or variables must be explicitly mapped to these global corporate CSS properties._

---

## 3. Typography

The ecosystem uses two base font families to ensure identity consistency in interfaces (dashboards) and public web portals:

- **Base Fonts:**
  - `UI/Headings/Brand`: **Dosis** (`var(--font-ui)`) - Provides a rounded, friendly, yet technical appearance. Used for titles, branding elements, headers, and main UI structures.
  - `Monospace`: **JetBrains Mono** - Reserved exclusively for terminals, command visualization, agent logs, or code blocks (`var(--font-mono)`).
  - _Body Text_: The use of readable system sans-serifs (like Roboto or Inter) is standardized for long reading blocks or manual-oriented documentation, leaving `Dosis` primarily for structural UI and marketing.

- **Hierarchy:**
  - Prioritize the use of weight (`font-weight: 500/700/800`) and neutral/desaturated colors (e.g., `--neutral-500`) instead of abusing drastic variations in base font sizes.

---

## 4. Component Styles & Glassmorphism

Any UI component (native semantically built by HTML or assembled using JavaScript frameworks) must adhere to the following structural styles and behaviors:

### Translucent Surfaces (Glass-Cards)

To highlight information and provide a modern sense of depth, notable containers are grouped in translucent blocks:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
}

/* Dark mode: base background using semitransparent tertiary/brand color (0.05) */
[data-theme='dark'] .glass-card {
  background: rgba(254, 252, 232, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Inputs and Forms (Material Evolution)

Text boxes, searches (`SearchFilter`), or forms (regardless of the library) should target this appearance:

1. **Solid Background** (e.g., `--neutral-100`) for the input container, providing natural contrast over the card surface.
2. **Asymmetric Borders**: Rounded at the top, straight at the bottom (`border-radius: 8px 8px 0 0`).
3. **Focus Indicator (Continuous Bottom Line)**: Thick or colored in the `Primary` tone when the element is active.
4. **Labels**: In empty fields, they maintain the visual weight of a normal but more prominent placeholder; with focus, they "float" to the upper scale, decreasing in size (`scale(0.75)`).

### Interactive Elements (Chips, Badges, Buttons)

- **Polished Radii**: Status pills, algorithmic badges, or labels must have marked circular ends (`border-radius: 12px`).
- **Cursor Response (Hover)**: Interactive elements should invoke a slight organic lifting effect (e.g., `transform: translateY(-1px)`) implementing dynamic shadow for the invoked corporate color (`box-shadow`), favoring visual response to _touch_.

---

## 5. Layout and Structure

- **Fluid Grid/Layouts**: Web applications or SaaS profiles must adapt fluidly to resolution space, prioritizing containers in `flex` or automatic behaviors over classic rigid breakpoints.
- **Navigation (Sidebar / Main Menus)**: Active options should stand out both visually (light asynchronous translucent background) and structurally (with a vertical `Primary` color bar or pseudo-element to the left of the listing).
- **Page Headers**: Group context blocks (Functional Icons, Titles, or associated Breadcrumbs) in a left panel; conversely, group block executable actions (e.g., Exports, Modals for adding configurations or profiles) aligned to the right.

---

## 6. Animations and Micro-interactions

- **Functional Purpose**: Ecosystem web animations must channel toward natural operation. Purely decorative or experimental purposes are not permitted if they cause organic delays (below a resolutive UX factor).
- **Performance**: Require transitional routines purely graphically controlled (`transform`, `opacity`, `background-color`, `box-shadow`). Animating parameters that recalculate base DOM nodes (such as `width`, `height`, or text flows in absolute `margin`) is PROHIBITED.
- **Curves (Easing)**: Standard stable transitions should be around `0.25s ease`, averaging `0.2s` for faster interactions like tooltips or menu option hovers, projecting a generally reactive and fast feel across any Migasfree tool.

---

## 7. General Accessibility (WAI-ARIA and WCAG 2.1)

1. **Inter-Component Contrast**: The current dynamic scheme inherently pursues validating base contrast controls by coloration. Consistently use associated variables (e.g., use `--brand-on-primary` against pure dark textures on `--brand-primary`).
2. **Semantic SEO/HTML Usage**: The rendered DOM (even if based on Vue/Nuxt/Frameworks) must maintain coherent WAI-ARIA attributes and an explicit taxonomy (e.g., `nav` blocks in option menus in `migasfree-frontend` or generic `main`, `header`, `footer` website blocks).
3. **Environment Ergonomics**: Administration and prolonged console query elements have an imperative obligation to have the palette switcher (`ToggleDarkMode`) for the analyst's comfort and eye health, and to be accessible for the operator facing incidents.

---

📝 _Reference Documentation - Visual Language Platform (Migasfree Ecosystem)_
