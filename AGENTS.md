# AGENTS.md

> **Context for AI Agents working on `migasfree-frontend`**
> This file provides the essential context, commands, and conventions for AI agents to work effectively on this project.

## 1. Project Overview

**migasfree-frontend** is the web-based frontend for the Migasfree Systems Management System.

- **Framework**: Vue 3 + Quasar Framework (Webpack)
- **State Management**: Pinia
- **Language**: JavaScript (Modules) / Vue SFC
- **Testing**: Vitest (Unit), Cypress (E2E)
- **Style**: SASS / SCSS

## 2. Setup & Commands

Use `yarn` for package management.

- **Install Dependencies**: `yarn`
- **Start Dev Server**: `yarn dev` (runs `quasar dev`)
- **Run Unit Tests**: `yarn test` (`vitest run`)
- **Run E2E Tests**: `yarn cypress:run`
- **Lint Code**: `yarn lint`
- **Format Code**: `yarn format`

## 3. Code Style & Conventions

- **Linter**: ESLint with Prettier and Security plugins.
- **Formatting**: Prettier is authoritative. Run `yarn format` if unsure.
- **Vue Components**: Use Composition API (`<script setup>`) where possible, though Options API exists in legacy code.
- **CSS**: Use Quasar utility classes (`q-pa-md`, `text-primary`) and SASS variables found in `src/css/quasar.variables.sass`.
- **Icons**: Material Design Icons (`mdi-*`) are the standard.
- **Strict Mode**: Avoid `any` types (if using TS, though this is JS) and implicit conversions.

## 4. Architecture Standards

- **Components**: `src/components/` - Atomic design principles.
- **Pages**: `src/pages/` - Route views.
- **Stores**: `src/stores/` - Pinia stores for global state.
- **Composables**: `src/composables/` - Reusable logic.
- **Services**: `src/services/` - API communication (Axios).

## 5. Available Skills & specialized constraints

This project is equipped with specialized AI Skills in `.agent/skills`.
**ALWAYS** check and use these skills when working on relevant tasks:

- **CI/CD & DevOps**: `cicd-expert` (GitHub Actions, Workflows)
- **Testing (Cypress)**: `cypress-expert` (E2E patterns)
- **Testing (Vitest)**: `vitest-expert` (Unit testing patterns)
- **UI/UX Design**: `ui-designer-expert` & `migasfree-ui-ux-expert` (Visual language, Glassmorphism)
- **Documentation**: `docs-expert` (Diátaxis, ADRs)
- **Security**: `security-expert` (AppSec, OWASP)
- **Docker**: `docker-expert` (Containerization)
- **Backend/API (if relevant)**: `django-expert`, `graphql-expert`
- **Quality Assurance**: `qa-expert`
- **Output Standards**: `output-standard-expert` (Response formatting)

## 6. Critical Rules

1. **User Rules**: Always follow user-defined rules in memory (e.g., specific language requirements).
2. **Safe Editing**: Do not blindly overwrite large files. Use specific line edits or chunks.
3. **Verification**: Always verify changes with `yarn test` or by checking the dev server status if possible.
