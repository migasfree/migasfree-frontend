---
name: migasfree-frontend
description: Visual identity for Migasfree Systems Management. A Luxury Scientific aesthetic combining earth tones with high-tech glassmorphism.
version: alpha

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

  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.input}'
    padding: '0 12px'
---

## Overview

**Luxury Scientific.** The Migasfree UI evokes a premium, professional experience that balances technical precision with organic warmth. It avoids the "cold" blue-dominated tech aesthetic in favor of a "scientific journal" or "modern gallery" feel.

The design system is centered around **Glassmorphism** for depth and **Earth Tones** for stability, reflecting the project's roots in managing critical infrastructure reliably.

## Colors

The palette is rooted in high-contrast neutrals and a single iconic accent.

- **Primary (#431407):** Deep espresso brown for headlines and core brand elements.
- **Secondary (#705a56):** Sophisticated slate for metadata and secondary actions.
- **Tertiary (#feda00):** Vibrant yellow used sparingly for key interactions and brand recognition.
- **Neutrals:** A limestone-based foundation (`#fcfaf9`) provides a softer, more premium base than pure white.

### Dark Mode

In dark mode, the palette shifts to deep ink (`#0d0807`) and charcoal brown (`#1a1210`), with the primary brand color flipping to a warm yellow-white (`#fefce8`) for maximum readability.

## Typography

The system uses **Dosis** for its human-centric, rounded yet professional character.

- **UI Text:** Dosis is used for all interface elements, providing a distinct and friendly personality.
- **Data & Code:** **JetBrains Mono** is used for system logs, technical data, and any element requiring fixed-width precision.

## Grid

Layouts are built on a flexible grid system, typically maximizing at **1440px** for the main container. Whitespace (Spacing MD and LG) is used liberally to separate technical data and prevent information overload.

## Components

Components are defined by their geometric clarity and subtle depth effects.

- **Cards:** Clean, white surfaces with thin borders (`--border`) and soft shadows.
- **Glass Panels:** Used for overlays and high-impact dashboards to provide a sense of hierarchy and modern elegance.
- **Inputs:** Large, accessible tap targets with distinctive focused states that use brand colors.

## Motion

Transitions are subtle and professional, typically using `ease-in-out` with durations between **150ms** and **300ms**. Hover effects on cards and buttons include subtle translations or shadow expansions to provide tactile feedback.

## Accessibility

The design system enforces a minimum contrast ratio of **4.5:1** for all body text. Interactive elements have clearly defined `:focus-visible` states using brand-primary or brand-tertiary glows.

## Glossary

- **Glassmorphism:** The use of background blur and semi-transparent layers to create depth.
- **Luxury Scientific:** The specific brand voice of Migasfree — professional, clean, and premium.
- **Earth Palette:** The collection of brown and neutral tones used throughout the UI.
