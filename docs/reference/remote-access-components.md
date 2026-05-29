# Remote Access Components Reference

This document provides a technical reference for the frontend components that power the secure remote console inside **migasfree-frontend**.

---

## `RemoteAccess.vue`

The core component responsible for displaying available remote control utilities, collecting user credentials dynamically, and rendering inline interactive sessions.

- **Path**: `src/components/computer/RemoteAccess.vue`
- **UI Framework**: Quasar 2 (`q-dialog`, `q-input`, `q-btn`, `q-card`)
- **Core Dependecies**: `xterm`, `xterm-addon-fit`, `@novnc/novnc`

### 1. Component State & Properties

#### Inputs / Props

- `computerId` (Number): The unique database ID of the computer to connect to.
- `services` (Array): Active remote services reported by the computer's heartbeat agent (e.g. `['ssh', 'vnc', 'sync']`).

#### Connection Credentials State

- `username` (String): Standard shell user requested before launching SSH or RDP sessions. Defaults dynamically to the logged-in admin username.
- `password` (String): Secure password requested before starting graphical VNC sessions.

---

### 2. Focus & Keyboard Usability Mechanics

To provide an optimal developer experience, `RemoteAccess.vue` incorporates advanced UX logic for focus management and keyboard-based execution:

#### Programmatic Focus

Focus is requested immediately after the connection modal transitions to a visible state. This prevents administrators from having to click manually on input fields.

```javascript
const onDialogShow = () => {
  nextTick(() => {
    if (userInput.value) {
      userInput.value.focus()
    } else if (passwordInput.value) {
      passwordInput.value.focus()
    }
  })
}
```

- **Binding**: Linked to the `@show` event on the parent `q-dialog` element.

#### Enter Key Confirmation

Administrators can press `Enter` at any time while the credential collection form is open to execute the default action (starting the connection):

- **Binding**: Intercepted globally inside the dialog panel using `@keyup.enter="confirmConnection"`.

---

### 3. Protocol-Specific Dismissal Logic

Different session types have different UX lifecycles:

- **SSH Connections**: When the remote host closes the session or a "disconnected" state is detected, the dialog remains open for **1.5 seconds** (`setTimeout` delay) to allow the administrator to read the final disconnection logs, then automatically closes to keep the workspace clean.
- **Package Synchronization (`sync`)**: Log collection is critical for audit and review. When a sync session completes (or encounters an error), the dialog **does not auto-dismiss**. The administrator must inspect the logs and close the dialog manually.

---

### 4. Terminal Configuration Settings

Standard stdout streams from Linux servers use `\n` (LF) instead of `\r\n` (CRLF) for lines. Within raw standard output shells, this causes a "staircase effect" where subsequent lines start offset to the right of the previous line.

`RemoteAccess.vue` resolves this by enabling automatic carriage-return conversion inside the terminal instance:

```javascript
const term = new Terminal({
  cursorBlink: true,
  convertEol: true, // Converts LF (\n) to CRLF (\r\n) automatically
  theme: {
    background: '#1e1e1e',
    foreground: '#ffffff',
  },
})
```
