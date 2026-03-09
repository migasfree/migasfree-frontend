# CSS Architecture and Theming

This document explains the architecture and design decisions behind the CSS ecosystem in `migasfree-frontend`. It clarifies the role of each stylesheet within the `/src/css/` directory and how they interact with Quasar and Vue components to deliver a flexible, headless theming system.

This document falls under the **Explanation** quadrant of the Diátaxis framework, aimed at providing context and illuminating architectural choices.

## The Headless Theming Approach

The CSS architecture is designed around a modern "Headless Theming" pattern. This means the core styling properties (colors, typography, spacing) are handled entirely natively by the browser through CSS Custom Properties (variables), rather than being locked inside a CSS preprocessor like SASS.

This decoupling allows the design tokens to be reused across any project (e.g., vanilla HTML, React, Angular) without depending on a specific build system, while still allowing the SASS compiler and Quasar framework to consume them effectively.

## Core Stylesheets and Responsibilities

The system consists of two primary files, each with a single, distinct responsibility.

### 1. `style.css` (The Source of Truth)

This is the foundation of the Design System. It stores all custom CSS variables globally within the `:root` and `[data-theme='dark']` / `.body--dark` scopes.

- **Purpose**: By defining raw CSS variables (`--brand-primary`, `--bg-card`, etc.), the application leverages the power of native CSS theming.
- **Benefit**: This enables seamless, instantaneous switching between Light and Dark modes at runtime via JavaScript (modifying the `data-theme` attribute on the `body` tag) without any need to recompile CSS processors.
- **Contents**: Base typography rules, grid layout primitives, component resets, and color palettes.

### 2. `quasar.variables.sass` (The Framework Integrator)

This file is explicitly responsible for configuring the inner workings of the Quasar UI Framework.

- **Purpose**: Quasar relies on its own predefined variable names (`$primary`, `$secondary`, `$positive`, etc.) to generate its internal UI components (like buttons, badges, and form inputs).
- **Benefit**: By establishing mappings like `$primary: var(--brand-primary)` inside this specific file, we force all native Quasar components to automatically adapt to the Custom CSS Properties defined in `style.css`. Quasar injects this file inherently before compiling any of its UI components.

Note that `style.css` is the only CSS file directly declared in the main `quasar.config.js` configuration.

## Architectural Trade-offs and Considerations

By unifying historical SASS files (`app.sass` and `tokens.sass`) into native `style.css`, we achieved:

1. **Portability**: The raw CSS Design Tokens can be effortlessly shared with non-Vue or non-Webpack projects without SASS compilation constraints.
2. **Simplicity**: A single source of truth for all custom overrides and styling logic, improving developer ergonomics by eliminating the need to jump between multiple preprocessor files.
3. **Framework Compatibility**: We retain `quasar.variables.sass` solely as an integration point to connect our custom design tokens with Quasar's internal styling engine, while moving all our custom styles to native CSS.

This clean separation distinguishes between **Implementation (CSS Custom Properties and Styles)** and **Framework State (Quasar variables)**.
