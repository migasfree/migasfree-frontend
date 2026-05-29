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
    <q-dialog v-model="dialogOpen" persistent>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { api } from 'boot/axios'

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

const loading = ref(false)
const agentData = ref({
  status: null,
  services: [],
  relay: null,
  error: null,
})

const dialogOpen = ref(false)
const selectedService = ref(null)
const credentials = ref({
  username: 'root',
  password: '',
})

let pollingInterval = null

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
  let url = `/manager/v1/private/tunnel/console?agent=${props.cid}&service=${service}`

  if (service === 'ssh' || service === 'rdp') {
    const user = credentials.value.username.trim()
    if (!user) return
    url += `&user=${encodeURIComponent(user)}`
  } else if (service === 'vnc') {
    const pwd = credentials.value.password.trim()
    if (!pwd) return
    url += `&user=${encodeURIComponent(pwd)}#password=${encodeURIComponent(pwd)}`
  }

  window.open(url, '_blank')
  dialogOpen.value = false
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
</style>
