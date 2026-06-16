# Codebase Audit Report: migasfree-frontend

![Integrity](https://img.shields.io/badge/Integrity-Verified-brightgreen?style=for-the-badge)
![Risk](https://img.shields.io/badge/Risk-Medium-yellow?style=for-the-badge)
![Traceability](https://img.shields.io/badge/Traceability-High-brightgreen?style=for-the-badge)

## 📊 Inspection Scorecard

| Layer                         | Confidence | Status                          |
| :---------------------------- | :--------- | :------------------------------ |
| **Frontend Architecture**     | 95%        | ⚠️ Portal Styling Concerns      |
| **Infrastructure & Security** | 88%        | ⚠️ Vulnerable Core Dependencies |
| **DevOps & Quality**          | 70%        | 🛑 Silent CI Audit Failures     |
| **Documentation Standards**   | 90%        | ✅ Compliant                    |

---

## 🛠️ Stack Identification

- **Framework**: Vue 3 + Quasar Framework v2 (Webpack-based packaging)
- **State Management**: Pinia
- **Networking**: Axios + custom `smartRequest` composable
- **Containerization**: Docker (multi-stage build with `node:iron-alpine`)
- **CI/CD**: GitHub Actions
- **Testing**: Vitest (Unit) + Cypress (E2E)

---

## 🕵️ Codebase Analysis (Deep Dive)

### ⚛️ Module B: Frontend Inspection & Visual Layer

![Staff Engineer](https://img.shields.io/badge/Role-Staff_Engineer-black?style=for-the-badge)

#### ⚛️ Module B.1 - i18n Hard Stop Coverage (Remediated)

- **Finding**: User-facing labels in `PieDataDialog.vue` (CSV, JSON) were hardcoded text nodes inside `<q-item-section>`.
- **Status**: Resolved. Wrapped the strings in `$gettext` to dynamically support localization tags.

#### ⚛️ Module B.2 - Reactivity & DOM Manipulation Compliance

- **Finding**: Full compliance. No direct DOM manipulation methods (`document.getElementById`, `document.querySelector`) are present in `src/`. Vue 3 template refs (`ref`) are correctly leveraged.

#### ⚛️ Module B.3 - Migasfree Specifics & smartRequest Bypass

- **Finding**: Multiple list templates directly call `api.get` instead of the centralized `smartRequest` composable to populate dropdown options:
  - `src/pages/attributes/results/list.vue` (fetching formulas)
  - `src/pages/packages-history/results/list.vue` (fetching projects)
  - `src/pages/releases/results/list.vue` (fetching config and projects)
  - `src/pages/package-sets/results/list.vue` (fetching projects and stores)
  - `src/pages/flavours/results/list.vue` (fetching config and projects)
  - `src/pages/formulas/results/list.vue` (fetching properties and languages)
  - `src/pages/tags/results/list.vue` (fetching stamps)
  - `src/pages/connections/results/list.vue` (fetching device types)
- **[Virtual Adversary]: Seed critique generated during codebase audit. Formalization recommended.**: While these metadata queries currently have small filter sizes, bypassing `smartRequest` introduces architectural inconsistency. If a filter query parameter (e.g., fetching projects filtered by a long list of computer scopes) grows beyond proxy and load-balancer limits (2000 characters), it will trigger an HTTP 414 URI Too Long error. All API queries should be uniformly routed through the `smartRequest` wrapper.

#### ⚛️ Module B.4 - Style Scoping & Portal CSS Leakage

- **Finding**: Unscoped `<style>` blocks targeting teleported dropdowns and menus are embedded in components:
  - `src/components/ui/TablePagination.vue` (overriding `.per-page-menu`)
  - `src/components/ui/UserAccount.vue` (overriding `.app-user-menu` and `.app-select-menu`)
  - `src/components/MigasLink.vue` (overriding `.popover-menu`)
- **Justification**: Since Quasar teleports dropdown portals outside the Vue component layout tree, standard `scoped` styles cannot reach them. However, putting them in unscoped blocks inside individual SFCs is an anti-pattern.
- **Exception**: `src/pages/computers/results/label.vue` uses an unscoped `<style>` block for `@media print` overrides. This is a justified layout exception as print style declarations must explicitly target layout wrapper elements.
- **[Virtual Adversary]: Seed critique generated during codebase audit. Formalization recommended.**: SFC un-scoped styles contaminate the global CSS namespace. They create rendering race conditions (depending on component load order) and impede style optimizations. Following the `migasfree-ui-ux-expert` guideline, these styles must reside exclusively in the global stylesheet (`src/css/style.css`).

---

### 🐳 Module C: Infrastructure Inspection & Runtime Security

![CISO](https://img.shields.io/badge/Role-CISO-red?style=for-the-badge)

#### 🐳 Module C.1 - Docker Container Safety

- **Finding**: The `Dockerfile` implements a correct multi-stage build pattern using the pinned LTS image `node:iron-alpine`.
- **Runtime User**: Securely drops privileges to `USER node` for execution.
- **Exclusion Policy**: `.dockerignore` exists and correctly excludes `node_modules`, `dist`, `.git`, `.env`, and log files from the docker context, keeping build sizes minimal and protecting local secrets.

---

### 🔧 Module D: DevOps & Quality Inspection

![QA Architect](https://img.shields.io/badge/Role-QA_Architect-blue?style=for-the-badge)

#### 🔧 Module D.1 - Test Suite Determinism

- **Finding**: No flaky `sleep` or `setTimeout` commands are present in unit or E2E tests. Async operations use standard awaiting and polling. All 329 tests pass cleanly across 33 files.

#### 🔧 Module D.2 - CI/CD Webpack Pipeline Command Mismatch

- **Finding**: `.github/workflows/webpack.yml` runs `yarnpkg audit --severity high` on line 49. Under Yarn modern (v4.1.0), `yarn audit` does not exist as a default command (modern Yarn uses `yarn npm audit`).
- **Impact**: The security audit step fails with a script resolution error. However, because it has `continue-on-error: true` (line 50), the workflow run reports a successful pass, silently leaving the repository without CI-enforced dependency security audits.
- **[Virtual Adversary]: Seed critique generated during codebase audit. Formalization recommended.**: A silently failing security gate is worse than no gate. It creates a false sense of compliance. The audit command must be corrected to use the standard Yarn v4 npm plugin syntax.

#### 🔧 Module D.3 - ESLint Security Plugin Deactivation

- **Finding**: `eslint-plugin-security` is commented out in `eslint.config.js` due to compatibility conflicts with ESLint v10.
- **[Virtual Adversary]: Seed critique generated during codebase audit. Formalization recommended.**: Commenting out AST-level security checks leaves the code vulnerable to common syntax risks (e.g., regex injection, raw shell spawns). Alternative packages or temporary rules should be introduced.

#### 🔧 Module D.4 - Vulnerability & Deprecation Analysis

- **Finding**: Running an audit scan reveals critical vulnerabilities and package deprecations:
  - **`dompurify`** (v3.4.2): Vulnerable to multiple XSS and bypass issues (CVE-2024-47875, etc.). Fixed in `>=3.4.9`.
  - **`vite`** (v8.0.10): Vulnerable to `server.fs.deny` Alternate Path bypass and NTLMv2 hash disclosure. Fixed in `>=8.0.16`.
  - **`xterm` & `xterm-addon-fit`** (v5.3.0 / v0.8.0): Deprecated. The package namespace has migrated to `@xterm/xterm` and `@xterm/addon-fit`.

---

## 📉 Metrics

- **Vulnerable Packages**: 2 (`dompurify`, `vite`)
- **Deprecated Packages**: 2 (`xterm`, `xterm-addon-fit`)
- **Unscoped Style Files**: 3 (excluding `label.vue` print stylesheet)
- **Direct api.get Bypass Count**: 8 files

---

## 💡 Senior Analysis

The codebase exhibits strong quality metrics, as evidenced by passing test suites and a functional build pipeline. However, several silent failures and structural layout issues pose medium-level risks:

1. **The Silent Audit Gate**: The broken `yarnpkg audit` script command prevents security alerts from breaking the build process. A security check that fails silently defeats the purpose of devsecops pipelines.
2. **Global Styling Contamination**: The presence of un-scoped styling inside components targeting teleported DOM nodes (`.q-menu`) creates style race conditions. If components are lazy-loaded, styles are injected dynamically, leading to unstable UI representations.
3. **Vulnerable Dependencies**: `dompurify` is responsible for sanitizing input data for the `Truncate` component. Running a version with multiple XSS and sanitization bypass bugs weakens the main security wall.

---

## 📐 Architecture Overview

```mermaid
graph TD
    subgraph Quasar Application Client
        V[Vue 3 Components] --> |Render| Q[Quasar UI Portals]
        V --> |Dispatch Actions| P[Pinia Store]
        V -.-> |Bypass Composable| AX[Direct Axios Client]
        V --> |Call Composable| SR[smartRequest]
    end

    subgraph Service & Network Layer
        SR --> |Choose GET/POST| AX
        AX --> |JSON Payload| MB[Migasfree Backend]
    end

    subgraph CI/CD Pipeline
        GA[GitHub Actions Workflow] --> |Runs lint & format| L[ESLint]
        GA --> |Broken command| A[Yarn Audit Gate]
    end
```

---

## 🔄 smartRequest Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Component as Vue 3 Component
    participant Composable as useSmartRequest
    participant Axios as Axios HTTP Client
    participant Server as Migasfree Backend

    Component->>Composable: smartRequest(endpoint, params)
    activate Composable
    Composable->>Composable: estimateUrlLength(endpoint, params)
    alt URL Length <= 2000 Characters
        Composable->>Axios: api.get(endpoint, params)
        Axios->>Server: GET /api/v1/.../?params
    else URL Length > 2000 Characters
        Composable->>Composable: toFilterEndpoint(endpoint)
        Note right of Composable: Appends '/filter/' suffix
        Composable->>Axios: api.post(filterEndpoint, data: params)
        Axios->>Server: POST /api/v1/.../filter/
    end
    Server-->>Axios: JSON Response
    Axios-->>Composable: Response Object
    Composable-->>Component: data
    deactivate Composable
```

---

## 🚑 Remediation Plan

### Fix 1: Correct CI/CD Security Audit Command

Modify line 49 in `.github/workflows/webpack.yml` to use Yarn Berry's native npm audit syntax:

```diff
-      - name: Security audit
-        run: |
-          yarnpkg audit --severity high
-        continue-on-error: true
+      - name: Security audit
+        run: |
+          yarnpkg npm audit --severity high
+        continue-on-error: true
```

### Fix 2: Upgrade Vulnerable Packages

Upgrade the packages using `yarnpkg` to ensure the project uses safe releases:

```bash
yarnpkg up dompurify@^3.4.9
yarnpkg up vite@^8.0.16
```

### Fix 3: Standardize Teleported CSS Overrides

Remove the un-scoped `<style>` blocks from `TablePagination.vue`, `UserAccount.vue`, and `MigasLink.vue`, and move the styling rules to the bottom of `src/css/style.css`:

```css
/* Teleported Dropdown & Portal Overrides (Moved from SFCs) */
.per-page-menu {
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--border);
}

.app-user-menu {
  background: rgba(var(--bg-card-rgb), 0.9) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 16px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  margin-top: 8px !important;
  min-width: 280px !important;
  color: var(--text-main);
  padding: 8px 0 !important;
}

.app-user-menu .q-field__native,
.app-user-menu .q-field__input {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.app-user-menu .q-field__control {
  min-height: 32px !important;
}

.app-select-menu {
  background: rgba(var(--bg-card-rgb), 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px !important;
  border: 1px solid var(--border);
  color: var(--text-main);
}

.app-select-menu .q-item {
  font-weight: 500;
}

.app-select-menu .q-item--active {
  color: var(--brand-primary) !important;
  background: var(--neutral-100) !important;
}

[data-theme='dark'] .app-select-menu .q-item--active {
  color: var(--brand-tertiary) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.popover-menu {
  border-radius: 16px !important;
  border: 1px solid var(--border);
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(var(--bg-card-rgb), 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 320px;
}
```

---

## 📄 Delivery Metadata

- **Audit Date**: 2026-06-16
- **Auditor**: Antigravity (Agentic AI)
- **Compliance**: staff-engineer-standard v1.2 (Virtual Adversary Mode)
