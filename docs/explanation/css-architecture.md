# CSS Architecture and Theming

This document explains the architecture and design decisions behind the CSS ecosystem in `migasfree-frontend`. It clarifies the role of each stylesheet within the `/src/css/` directory and how they interact with Quasar and Vue components to deliver a flexible, headless theming system.

This document falls under the **Explanation** quadrant of the Diátaxis framework, aimed at providing context and illuminating architectural choices.

## The Headless Theming Approach

The CSS architecture is designed around a modern "Headless Theming" pattern. This means the core styling properties (colors, typography, spacing) are handled entirely natively by the browser through CSS Custom Properties (variables), rather than being locked inside a CSS preprocessor like SASS.

This decoupling allows the design tokens to be reused across any project (e.g., vanilla HTML, React, Angular) without depending on a specific build system, while still allowing the SASS compiler and Quasar framework to consume them effectively.

## Core Stylesheets and Responsibilities

The system consists of four primary files, each with a single, distinct responsibility.

### 1. `style.css` (The Source of Truth)

This is the foundation of the Design System. It stores all custom CSS variables globally within the `:root` and `[data-theme='dark']` / `.body--dark` scopes.

- **Purpose**: By defining raw CSS variables (`--brand-primary`, `--bg-card`, etc.), the application leverages the power of native CSS theming.
- **Benefit**: This enables seamless, instantaneous switching between Light and Dark modes at runtime via JavaScript (modifying the `data-theme` attribute on the `body` tag) without any need to recompile CSS processors.
- **Contents**: Base typography rules, grid layout primitives, component resets, and color palettes.

### 2. `tokens.sass` (The Preprocessor Bridge)

This file acts as the translation layer between the raw CSS Variables in `style.css` and the SASS/SCSS compiler.

- **Purpose**: It re-defines SASS variables (e.g., `$primary`, `$space-md`) by pointing them directly to the CSS custom properties (e.g., `$primary: var(--brand-primary)`).
- **Benefit**: If developers write native SASS elements that require a variable (such as within a mixin or a math function), it guarantees they use the dynamic runtime value. It also allows developers to use familiar, concise SASS syntax (like `$primary`) instead of repeatedly typing `var(--brand-primary)`.

### 3. `quasar.variables.sass` (The Framework Integrator)

This file is explicitly responsible for configuring the inner workings of the Quasar UI Framework.

- **Purpose**: Quasar relies on its own predefined variable names (`$primary`, `$secondary`, `$positive`, etc.) to generate its internal UI components (like buttons, badges, and form inputs).
- **Benefit**: By establishing mappings like `$primary: var(--brand-primary)` inside this specific file, we force all native Quasar components to automatically adapt to the Custom CSS Properties defined in `style.css`. Quasar injects this file inherently before compiling any of its UI components.

### 4. `app.sass` (Global Utilities and Overrides)

This is the primary styling entry point for global SASS rules and overarching aesthetic adjustments applied across the entire application.

- **Purpose**: It imports `tokens.sass` at the top to access the variable aliases and contains utility classes or global component overrides.
- **Benefit**: It acts as the central location for modifying the design of existing components globally (e.g., altering the shadow of all `.q-card` elements globally, adjusting table borders, etc.).

Note that `style.css` and `app.sass` are the only two CSS files directly declared in the main `quasar.config.js` configuration.

## Architectural Trade-offs and Considerations

While it might seem tempting to unify these files (for example, by combining `style.css` directly into `app.sass`), doing so breaks the architectural separation of concerns:

1. **Loss of Portability**: Combining `style.css` into SASS prevents the effortless sharing of the raw CSS Design Tokens with non-Vue or non-Webpack projects.
2. **Loss of Framework Control**: Removing `quasar.variables.sass` severs the connection between the custom design tokens and Quasar's internal component styling engine.
3. **Loss of Developer Ergonomics**: Removing `tokens.sass` would force developers to abandon shorthand SASS variables and manually type out full CSS variable declarations everywhere.

Therefore, the separation is intentional, cleanly distinguishing between **Configuration (CSS Variables)**, **Implementation (SASS overrides)**, and **Framework State (Quasar variables)**.
