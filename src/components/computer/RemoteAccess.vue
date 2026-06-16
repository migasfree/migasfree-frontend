<template>
  <div class="remote-access-compact row items-center gap-sm">
    <!-- Spinner during initial fetch if status is not loaded yet -->
    <q-spinner-dots
      v-if="loading && !agentData.status"
      color="primary"
      size="24px"
    />

    <template v-else>
      <!-- Status Badge -->
      <div :class="['status-badge', statusClass]">
        <span class="status-dot"></span>
        <span class="status-text">{{ statusLabel }}</span>
        <q-tooltip v-if="agentData.status === 'unknown' && agentData.error">
          {{ agentData.error }}
        </q-tooltip>
      </div>

      <!-- Action Connection Buttons (only shown when online) -->
      <div v-if="agentData.status === 'online'" class="row items-center gap-xs">
        <q-btn
          v-for="service in agentData.services"
          :key="service"
          flat
          dense
          no-caps
          class="action-btn text-weight-bold q-px-sm"
          :icon="getServiceIcon(service)"
          :label="service.toUpperCase()"
          @click="openConnectionDialog(service)"
        >
          <q-tooltip>{{ $gettext('Open connection tunnel') }}</q-tooltip>
        </q-btn>

        <!-- SYNC Button is always available if the agent is online -->
        <q-btn
          flat
          dense
          no-caps
          class="action-btn text-weight-bold q-px-sm"
          icon="mdi-sync"
          label="SYNC"
          @click="openConnectionDialog('sync')"
        >
          <q-tooltip>{{ $gettext('Execute synchronization') }}</q-tooltip>
        </q-btn>
      </div>
    </template>

    <!-- Credentials / Confirmation Dialog -->
    <q-dialog
      v-model="dialogOpen"
      persistent
      @show="onDialogShow"
      @keyup.enter="confirmConnection"
    >
      <q-card class="dialog-card shadow-24">
        <q-card-section class="row items-center q-pb-none">
          <div
            class="text-h6 text-weight-bold text-primary flex items-center gap-sm"
          >
            <q-icon :name="getServiceIcon(selectedService)" size="28px" />
            <span>{{ getDialogTitle() }}</span>
          </div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- SSH / RDP Username Input -->
          <div v-if="selectedService === 'ssh' || selectedService === 'rdp'">
            <div class="text-subtitle2 q-mb-xs opacity-80">
              {{ $gettext('Username') }}
            </div>
            <q-input
              ref="usernameInput"
              v-model="credentials.username"
              dense
              outlined
              placeholder="e.g. root"
              @keyup.enter="confirmConnection"
            />
            <div class="text-caption opacity-60 q-mt-xs">
              {{ $gettext('Enter the remote user to connect with.') }}
            </div>
          </div>

          <!-- VNC Password Input -->
          <div v-else-if="selectedService === 'vnc'">
            <div class="text-subtitle2 q-mb-xs opacity-80">
              {{ $gettext('VNC Password') }}
            </div>
            <q-input
              ref="passwordInput"
              v-model="credentials.password"
              dense
              outlined
              type="password"
              placeholder="Password"
              @keyup.enter="confirmConnection"
            />
            <div class="text-caption opacity-60 q-mt-xs">
              {{ $gettext('Enter the VNC password of the remote system.') }}
            </div>
          </div>

          <!-- SYNC Confirmation -->
          <div v-else-if="selectedService === 'sync'">
            <div class="text-body1">
              {{
                $gettext(
                  'Are you sure you want to trigger a synchronization on this computer?',
                )
              }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn
            v-close-popup
            flat
            no-caps
            :label="$gettext('Cancel')"
            color="grey-7"
            class="text-weight-bold"
          />
          <q-btn
            unelevated
            no-caps
            :label="getDialogActionLabel()"
            color="primary"
            class="text-weight-bold q-px-md"
            @click="confirmConnection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="consoleDialogOpen"
      maximized
      persistent
      @show="initConsole"
      @hide="closeConsole"
    >
      <q-card class="console-card flex no-scroll">
        <!-- Toolbar Header -->
        <q-toolbar class="console-toolbar text-white">
          <q-btn flat round dense icon="mdi-remote-desktop" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold title-text">
            {{ agentData.name || $gettext('Computer') }} -
            {{ selectedService ? selectedService.toUpperCase() : '' }}
          </q-toolbar-title>

          <!-- VNC Specific Tools -->
          <template v-if="selectedService === 'vnc' && isConnected">
            <q-btn flat round dense icon="mdi-keyboard-outline" class="q-mx-xs">
              <q-menu anchor="bottom right" self="top right">
                <q-list class="vnc-menu-list">
                  <q-item v-close-popup clickable @click="sendCtrlAltDel">
                    <q-item-section avatar>
                      <q-icon name="mdi-keyboard-caps" />
                    </q-item-section>
                    <q-item-section>{{
                      $gettext('Send Ctrl+Alt+Del')
                    }}</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="sendSuperKey">
                    <q-item-section avatar>
                      <q-icon name="mdi-microsoft-windows" />
                    </q-item-section>
                    <q-item-section>{{
                      $gettext('Send Windows Key')
                    }}</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="toggleVncScaling">
                    <q-item-section avatar>
                      <q-icon
                        :name="
                          vncScaling ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
                        "
                      />
                    </q-item-section>
                    <q-item-section>{{
                      vncScaling
                        ? $gettext('Disable Scaling')
                        : $gettext('Enable Scaling')
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
              <q-tooltip>{{ $gettext('VNC Controls') }}</q-tooltip>
            </q-btn>

            <!-- VNC Clipboard -->
            <q-btn
              flat
              round
              dense
              icon="mdi-clipboard-text-outline"
              class="q-mx-xs"
            >
              <q-menu
                anchor="bottom right"
                self="top right"
                class="vnc-clipboard-menu"
              >
                <q-card class="vnc-clipboard-card">
                  <q-card-section class="q-pa-sm">
                    <q-input
                      v-model="vncClipboardText"
                      dense
                      outlined
                      autogrow
                      :label="$gettext('Send text to remote')"
                    />
                  </q-card-section>
                  <q-card-actions
                    align="right"
                    class="q-pt-none q-pb-sm q-px-sm"
                  >
                    <q-btn
                      v-close-popup
                      flat
                      dense
                      no-caps
                      label="Send"
                      color="primary"
                      @click="sendVncClipboard"
                    />
                  </q-card-actions>
                </q-card>
              </q-menu>
              <q-tooltip>{{ $gettext('Sync Clipboard') }}</q-tooltip>
            </q-btn>
          </template>

          <q-space />

          <!-- Connection Status -->
          <div
            :class="[
              'console-status-badge',
              isConnected ? 'status--connected' : 'status--connecting',
            ]"
          >
            <span class="pulse-dot"></span>
            <span class="status-lbl">{{
              isConnected ? $gettext('CONNECTED') : $gettext('CONNECTING...')
            }}</span>
          </div>

          <q-btn
            flat
            round
            dense
            :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            class="q-mx-sm"
            @click="toggleFullscreen"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="consoleDialogOpen = false"
          />
        </q-toolbar>

        <!-- Console View Area -->
        <q-card-section class="console-container col relative-position bg-dark">
          <!-- SSH / SYNC Terminal Container -->
          <div
            v-show="selectedService === 'ssh' || selectedService === 'sync'"
            ref="terminalRef"
            class="terminal-view"
          ></div>

          <!-- VNC Canvas Container -->
          <div
            v-show="selectedService === 'vnc'"
            ref="vncContainerRef"
            class="vnc-view"
          ></div>

          <!-- RDP Instruction Panel -->
          <div
            v-if="selectedService === 'rdp'"
            class="rdp-view flex flex-center text-white q-pa-xl"
          >
            <q-card class="rdp-info-card text-center q-pa-lg">
              <q-card-section>
                <q-icon
                  name="mdi-microsoft-windows"
                  size="64px"
                  class="text-primary q-mb-md"
                />
                <div class="text-h5 text-weight-bold q-mb-md">
                  {{ $gettext('Remote RDP Connection') }}
                </div>
                <div class="text-body2 opacity-80 max-width-text q-mx-auto">
                  {{
                    $gettext(
                      'To connect via RDP, copy and run the following command in your local system terminal:',
                    )
                  }}
                </div>
              </q-card-section>

              <q-card-section class="command-block-section q-mt-md">
                <code class="command-code">{{ rdpCommand }}</code>
                <q-btn
                  flat
                  round
                  dense
                  icon="mdi-content-copy"
                  color="primary"
                  class="copy-command-btn"
                  @click="copyRdpCommand"
                >
                  <q-tooltip>{{ $gettext('Copy command') }}</q-tooltip>
                </q-btn>
              </q-card-section>

              <q-card-section class="q-mt-md">
                <div class="text-caption opacity-60">
                  {{
                    $gettext(
                      'Make sure you have "migasfree-connect" utility installed on your local machine.',
                    )
                  }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'
import { api } from 'boot/axios'
import { useQuasar, SessionStorage } from 'quasar'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import RFB from '@novnc/novnc'
import '@xterm/xterm/css/xterm.css'

defineOptions({
  name: 'ComputerRemoteAccess',
})

const props = defineProps({
  cid: {
    type: [Number, String],
    required: true,
  },
})

const { $gettext } = useGettext()
const $q = useQuasar()

const loading = ref(false)
const agentData = ref({
  status: null,
  services: [],
  relay: null,
  error: null,
  name: '',
})

const dialogOpen = ref(false)
const selectedService = ref(null)
const credentials = ref({
  username: 'root',
  password: '',
})

// Input focus refs
const usernameInput = ref(null)
const passwordInput = ref(null)

const onDialogShow = () => {
  nextTick(() => {
    if (selectedService.value === 'ssh' || selectedService.value === 'rdp') {
      if (usernameInput.value) {
        usernameInput.value.focus()
      }
    } else if (selectedService.value === 'vnc') {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    }
  })
}

// Embedded Console Refs
const consoleDialogOpen = ref(false)
const isConnected = ref(false)
const isFullscreen = ref(false)
const terminalRef = ref(null)
const vncContainerRef = ref(null)
const rdpCommand = ref('')
const vncClipboardText = ref('')
const vncScaling = ref(true)

let pollingInterval = null
let ws = null
let term = null
let fitAddon = null
let rfb = null
let resizeListener = null

// Dynamic Badge Styling
const statusClass = computed(() => {
  if (agentData.value.status === 'online') return 'status-badge--online'
  if (agentData.value.status === 'offline') return 'status-badge--offline'
  return 'status-badge--unknown'
})

const statusLabel = computed(() => {
  if (agentData.value.status === 'online') return $gettext('Online')
  if (agentData.value.status === 'offline') return $gettext('Offline')
  return $gettext('Unknown')
})

const fetchStatus = async () => {
  loading.value = true
  try {
    const response = await api.get(
      `/api/v1/token/computers/${props.cid}/remote-access/`,
    )
    agentData.value = {
      status: response.data.status,
      services: response.data.services || [],
      relay: response.data.relay || null,
      error: response.data.error || null,
      name: response.data.name || '',
    }
  } catch (err) {
    let errMsg = $gettext('Connection error')
    if (err.response && err.response.data && err.response.data.error) {
      errMsg = err.response.data.error
    } else if (err.message) {
      errMsg = err.message
    }
    agentData.value = {
      status: 'unknown',
      services: [],
      relay: null,
      error: errMsg,
      name: '',
    }
  } finally {
    loading.value = false
  }
}

const getServiceIcon = (service) => {
  if (!service) return 'mdi-link'
  const norm = service.toLowerCase()
  if (norm === 'ssh') return 'mdi-console'
  if (norm === 'vnc') return 'mdi-monitor-eye'
  if (norm === 'rdp') return 'mdi-microsoft-windows'
  if (norm === 'sync') return 'mdi-sync'
  return 'mdi-link'
}

const openConnectionDialog = (service) => {
  selectedService.value = service
  credentials.value.username = 'root'
  credentials.value.password = ''
  dialogOpen.value = true
}

const getDialogTitle = () => {
  if (!selectedService.value) return ''
  const norm = selectedService.value.toLowerCase()
  if (norm === 'ssh') return $gettext('SSH Connection')
  if (norm === 'rdp') return $gettext('RDP Connection')
  if (norm === 'vnc') return $gettext('VNC Connection')
  if (norm === 'sync') return $gettext('Trigger Synchronization')
  return $gettext('Remote Connection')
}

const getDialogActionLabel = () => {
  if (!selectedService.value) return $gettext('Connect')
  const norm = selectedService.value.toLowerCase()
  if (norm === 'sync') return $gettext('Synchronize')
  return $gettext('Connect')
}

const confirmConnection = () => {
  if (!selectedService.value) return

  const service = selectedService.value.toLowerCase()
  if (service === 'ssh' || service === 'rdp') {
    const user = credentials.value.username.trim()
    if (!user) return
  } else if (service === 'vnc') {
    const pwd = credentials.value.password.trim()
    if (!pwd) return
  }

  dialogOpen.value = false
  consoleDialogOpen.value = true
}

// WebSocket URL builder
const getWsUrl = (cid, service, token, user) => {
  let wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  let wsHost = window.location.host

  const base = api.defaults.baseURL
  if (base && (base.startsWith('http://') || base.startsWith('https://'))) {
    const url = new URL(base)
    wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    wsHost = url.host
  }

  let url = `${wsProtocol}//${wsHost}/ws/tunnel/computers/${cid}/?token=${token}&service=${service}`
  if (user) {
    url += `&user=${encodeURIComponent(user)}`
  }
  return url
}

// RDP Setup
const setupRdpInfo = () => {
  const managerUrl = window.location.origin
  const userPart = credentials.value.username.trim()
    ? ` ${credentials.value.username.trim()}`
    : ''
  rdpCommand.value = `migasfree-connect -t rdp -a ${props.cid} -m ${managerUrl}${userPart}`
  isConnected.value = true
}

const copyRdpCommand = () => {
  navigator.clipboard
    .writeText(rdpCommand.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: $gettext('Command copied to clipboard'),
        timeout: 2000,
      })
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
    })
}

// Fullscreen
const toggleFullscreen = () => {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    el.requestFullscreen()
      .then(() => {
        isFullscreen.value = true
      })
      .catch((err) => {
        console.error(err)
      })
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Console Initialization
const initConsole = async () => {
  isConnected.value = false
  const token = SessionStorage.getItem('auth.token')
  const service = selectedService.value.toLowerCase()

  if (service === 'rdp') {
    setupRdpInfo()
    return
  }

  let userParam = ''
  if (service === 'ssh') {
    userParam = credentials.value.username.trim()
  } else if (service === 'vnc') {
    userParam = credentials.value.password.trim()
  }

  const wsUrl = getWsUrl(
    props.cid,
    service === 'sync' ? 'exec' : service,
    token,
    userParam,
  )

  try {
    ws = new WebSocket(wsUrl)

    if (service === 'ssh' || service === 'sync') {
      term = new Terminal({
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        cursorBlink: true,
        convertEol: true,
        theme: {
          background: '#121214',
          foreground: '#e4e4e7',
          cursor: '#00cc66',
          black: '#121214',
          red: '#ff5555',
          green: '#50fa7b',
          yellow: '#f1fa8c',
          blue: '#bd93f9',
          magenta: '#ff79c6',
          cyan: '#8be9fd',
          white: '#bfbfbf',
        },
      })

      fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.value)
      fitAddon.fit()

      const handleResize = () => {
        if (fitAddon) {
          fitAddon.fit()
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'resize',
                cols: term.cols,
                rows: term.rows,
              }),
            )
          }
        }
      }

      resizeListener = handleResize
      window.addEventListener('resize', resizeListener)

      term.onResize((size) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'resize',
              cols: size.cols,
              rows: size.rows,
            }),
          )
        }
      })

      term.onData((data) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const hexData = Array.from(data)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
          ws.send(JSON.stringify({ data: hexData }))
        }
      })

      term.clear()
      const connMsg =
        service === 'ssh'
          ? `→ Connecting to ${credentials.value.username.trim()}@Computer ${props.cid}...`
          : `→ Connecting to execute Sync on Computer ${props.cid}...`
      term.writeln(`\x1b[1;36m${connMsg}\x1b[0m`)

      ws.onopen = () => {
        isConnected.value = true
        term.writeln('\x1b[1;32m✓ Connected to WebSocket Proxy!\x1b[0m')
        term.writeln('')
        term.focus()

        if (service === 'sync') {
          ws.send(
            JSON.stringify({
              type: 'execute_command',
              command: 'migasfree sync',
            }),
          )
        }

        setTimeout(handleResize, 200)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'data' && message.data) {
            const hexData = message.data
            const match = hexData.match(/.{1,2}/g)
            if (match) {
              const bytes = new Uint8Array(
                match.map((byte) => parseInt(byte, 16)),
              )
              const text = new TextDecoder('utf-8').decode(bytes)
              term.write(text)
            }
          } else if (message.type === 'output') {
            term.write(message.data)
          } else if (message.type === 'command_complete') {
            term.writeln(
              '\r\n\x1b[1;32m✓ Synchronization completed successfully\x1b[0m',
            )
          } else if (message.type === 'command_error') {
            term.writeln(
              `\r\n\x1b[1;31m✗ Synchronization failed: ${message.error}\x1b[0m`,
            )
          } else if (message.status === 'closed') {
            term.writeln(
              '\r\n\x1b[1;33m✗ Connection closed by remote host\x1b[0m',
            )
            isConnected.value = false
          } else if (message.error) {
            term.writeln(`\r\n\x1b[1;31m✗ Error: ${message.error}\x1b[0m`)
          }
        } catch (err) {
          console.error(err)
        }
      }

      ws.onerror = (error) => {
        console.error(error)
        term.writeln('\r\n\x1b[1;31m✗ WebSocket connection error\x1b[0m')
        isConnected.value = false
      }

      ws.onclose = () => {
        term.writeln('\r\n\x1b[1;33m✗ Connection disconnected\x1b[0m')
        isConnected.value = false
        if (service === 'ssh') {
          setTimeout(() => {
            consoleDialogOpen.value = false
          }, 1500)
        }
      }
    } else if (service === 'vnc') {
      vncContainerRef.value.innerHTML = ''
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      )

      rfb = new RFB(vncContainerRef.value, wsUrl)

      rfb.addEventListener('connect', () => {
        isConnected.value = true
        rfb.focus()
        rfb.scaleViewport = vncScaling.value
        rfb.resizeSession = false
      })

      rfb.addEventListener('disconnect', (e) => {
        isConnected.value = false
        if (e.detail.clean) {
          console.log('Clean VNC disconnect')
        } else {
          console.error('VNC Disconnect Error', e)
        }
      })
    }
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: $gettext('Failed to initialize connection'),
      caption: err.message,
    })
  }
}

// Close Console
const closeConsole = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  }

  if (ws) {
    ws.close()
    ws = null
  }
  if (term) {
    term.dispose()
    term = null
  }
  if (fitAddon) {
    fitAddon = null
  }
  if (rfb) {
    rfb.disconnect()
    rfb = null
  }
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener)
    resizeListener = null
  }
  isConnected.value = false
}

// VNC Tool Helpers
const sendCtrlAltDel = () => {
  if (rfb) {
    rfb.sendCtrlAltDel()
  }
}

const sendSuperKey = () => {
  if (rfb) {
    rfb.sendKey(0xffeb)
  }
}

const toggleVncScaling = () => {
  if (rfb) {
    vncScaling.value = !vncScaling.value
    rfb.scaleViewport = vncScaling.value
  }
}

const sendVncClipboard = () => {
  if (rfb && vncClipboardText.value) {
    rfb.clipboardPasteFrom(vncClipboardText.value)
    vncClipboardText.value = ''
  }
}

// Lifecycle Hooks (Polling setup)
onMounted(() => {
  fetchStatus()
  pollingInterval = setInterval(fetchStatus, 30000)
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
.remote-access-compact {
  display: inline-flex;
  align-items: center;
}

.gap-xs {
  gap: 4px;
}
.gap-sm {
  gap: 8px;
}

/* Status Badge styling */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-family: var(--font-family-ui, 'Dosis', sans-serif);
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.status-badge--online {
  background: rgba(22, 101, 52, 0.08);
  color: #166534;
  border: 1px solid rgba(22, 101, 52, 0.2);
}

.status-badge--offline {
  background: rgba(117, 95, 90, 0.08);
  color: #755f5a;
  border: 1px solid rgba(117, 95, 90, 0.2);
}

.status-badge--unknown {
  background: rgba(161, 98, 7, 0.08);
  color: #a16207;
  border: 1px solid rgba(161, 98, 7, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
}

.status-badge--online .status-dot {
  animation: status-pulse 2s infinite ease-in-out;
}

@keyframes status-pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(22, 101, 52, 0.5);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(22, 101, 52, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(22, 101, 52, 0);
  }
}

/* Action Buttons Styling */
.action-btn {
  background: rgba(var(--brand-primary-rgb), 0.05);
  color: var(--brand-primary);
  font-weight: 700;
  border-radius: 8px;
  padding: 4px 10px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.15);
}

.action-btn:hover {
  background: var(--brand-primary);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--brand-primary-rgb), 0.2);
}

[data-theme='dark'] .action-btn {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Premium Dialog Styling */
.dialog-card {
  min-width: 380px;
  border-radius: 16px;
  background: var(--bg-surface, #ffffff);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.08);
}
[data-theme='dark'] .dialog-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

/* Embedded Console Layout & Theme (Scenario C) */
.console-card {
  width: 100vw;
  height: 100vh;
  background: #121214;
  display: flex;
  flex-direction: column;
}

.console-toolbar {
  background: #18181b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: 56px;
  min-height: 56px;
}

.title-text {
  font-family: var(--font-family-ui, 'Dosis', sans-serif);
  letter-spacing: 0.02em;
  font-size: 1.1rem;
}

/* Connection Status Badge in Console Toolbar */
.console-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-right: 8px;
  border: 1px solid transparent;
}

.status--connecting {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}

.status--connected {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.status--connected .pulse-dot {
  animation: pulse-green 1.5s infinite ease-in-out;
}

.status--connecting .pulse-dot {
  animation: pulse-amber 1.5s infinite ease-in-out;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes pulse-amber {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* Console Container */
.console-container {
  background: #121214;
  overflow: hidden;
  padding: 0;
}

/* SSH & SYNC View */
.terminal-view {
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.terminal-view :deep(.xterm) {
  padding: 8px;
}

/* VNC View */
.vnc-view {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vnc-view :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

/* RDP Styling */
.rdp-view {
  width: 100%;
  height: 100%;
}

.rdp-info-card {
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  max-width: 550px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

.max-width-text {
  max-width: 400px;
}

.command-block-section {
  background: #121214;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.command-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: #a78bfa;
  word-break: break-all;
  text-align: left;
}

.copy-command-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.copy-command-btn:hover {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

/* VNC Specific Dropdown menus */
.vnc-menu-list {
  background: #1e1e24;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.vnc-menu-list .q-item {
  min-width: 200px;
}

.vnc-menu-list .q-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.vnc-clipboard-card {
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 260px;
}
</style>
