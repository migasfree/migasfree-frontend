# Copy Project Dialog Reference

This document provides a technical reference for the generic, premium-styled component `CopyProjectDialog.vue` used to copy/migrate resources (Applications, Drivers, Deployments, etc.) between projects.

---

## Component Overview

- **Path**: `src/components/ui/CopyProjectDialog.vue`
- **UI Framework**: Quasar 2 (`q-dialog`, `q-select`, `q-checkbox`, `q-linear-progress`, `q-btn`)
- **Key Features**:
  - Premium glassmorphism container styles.
  - Multi-select checkbox tree with "Select All" toggle.
  - Rate-limited progress bar (sequential API execution).
  - Flexible result parsing (success, warning/skipped, or error states).
  - Slot support for custom per-item UI details.

---

## 1. Props & API Reference

| Prop Name               | Type       | Required | Default                                  | Description                                                                                                 |
| ----------------------- | ---------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `modelValue`            | `Boolean`  | Yes      | -                                        | Controls the visibility of the dialog.                                                                      |
| `icon`                  | `String`   | No       | `''`                                     | Icon name shown in the dialog header.                                                                       |
| `title`                 | `String`   | Yes      | -                                        | Dialog main title (e.g., _Copy Deployments to Project_).                                                    |
| `itemsLabel`            | `String`   | Yes      | -                                        | Label for the select list section header (e.g., _Deployments to Copy_).                                     |
| `getItems`              | `Function` | Yes      | -                                        | `async (projectId) => Array<{ id, label, ... }>`: Fetches copyable resources for a source project.          |
| `copyItem`              | `Function` | Yes      | -                                        | `async (item, destProjectId) => any`: Executes the copy request for a single item.                          |
| `parseItemResult`       | `Function` | No       | `() => ({ success: true })`              | Maps copy result to `{ success, skipped, skippedName }`. Useful if backend does not throw 400 on collision. |
| `isDuplicateError`      | `Function` | No       | _Matches HTTP 400 with "already exists"_ | Callback to detect legacy duplicate API exceptions.                                                         |
| `successMessage`        | `String`   | No       | `''`                                     | Customize final success notification.                                                                       |
| `errorMessage`          | `String`   | No       | `''`                                     | Customize final error notification.                                                                         |
| `alreadyExistedMessage` | `String`   | No       | `''`                                     | Customize notification when all selected items were skipped.                                                |

---

## 2. Slots

### `item-extra`

Allows injecting custom markup next to the checkbox label for each item.

- **Scope**: `{ item }` (the individual object from the list returned by `getItems`)
- **Example Usage**:

```html
<template #item-extra="{ item }">
  <q-badge
    v-if="item.enabled"
    color="green-1"
    text-color="green-8"
    class="q-ml-sm"
    label="enabled"
  />
</template>
```

---

## 3. Integration Examples

### Simple Case (Applications & Drivers)

Assumes that copy operations throw a validation error (HTTP 400) if the item is already present in the destination project.

```html
<CopyProjectDialog
  v-model="showCopyModal"
  :icon="appIcon('copy')"
  :title="$gettext('Copy Applications')"
  :items-label="$gettext('Applications to Copy')"
  :get-items="getAppsToCopy"
  :copy-item="copyApp"
  @copied="onCopied"
/>
```

### Custom Parsing & Slot Case (Deployments)

Uses custom result mapping (where the backend returns a successful response code but indicates `created: false` and a `skipped_name` string) along with badges indicating resource state.

```html
<CopyProjectDialog
  v-model="showCopyModal"
  :icon="modelIcon('deployments')"
  :title="$gettext('Copy Deployments to Project')"
  :items-label="$gettext('Deployments to Copy')"
  :get-items="getDeploymentsToCopy"
  :copy-item="copyDeployment"
  :parse-item-result="parseDeploymentResult"
  @copied="onDeploymentsCopied"
>
  <template #item-extra="{ item }">
    <q-badge
      :color="item.enabled ? 'green-1' : 'red-1'"
      :text-color="item.enabled ? 'green-8' : 'red-8'"
      class="q-ml-sm text-weight-bold"
      :label="item.enabled ? 'enabled' : 'disabled'"
    />
  </template>
</CopyProjectDialog>
```

```javascript
const parseDeploymentResult = (result) => {
  if (result && result.created === false) {
    return {
      success: false,
      skipped: true,
      skippedName: result.skipped_name || '',
    }
  }
  return { success: true, skipped: false, skippedName: null }
}
```

### Custom Parsing & Slot Case with Extra Metadata (Package Sets)

Uses custom result mapping similar to Deployments, but renders inline metadata (the originating store name) inside the item selection row.

```html
<CopyProjectDialog
  v-model="showCopyModal"
  :icon="modelIcon('package-sets')"
  :title="$gettext('Copy Package Sets to Project')"
  :items-label="$gettext('Package Sets to Copy')"
  :get-items="getPackageSetsToCopy"
  :copy-item="copyPackageSet"
  :parse-item-result="parsePackageSetResult"
  @copied="onPackageSetsCopied"
>
  <template #item-extra="{ item }">
    <span v-if="item.store" class="text-caption text-grey-6 q-ml-sm">
      ({{ item.store }})
    </span>
  </template>
</CopyProjectDialog>
```

```javascript
const parsePackageSetResult = (result) => {
  if (result && result.created === false) {
    return {
      success: false,
      skipped: true,
      skippedName: result.skipped_name || '',
    }
  }
  return { success: true, skipped: false, skippedName: null }
}
```
