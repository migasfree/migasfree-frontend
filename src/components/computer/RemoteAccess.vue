<template>
  <q-card class="panel detail-card overflow-hidden shadow-2 rounded-borders">
    <q-card-section class="q-pa-lg">
      <!-- Header with Icon, Title and Status -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <div class="row items-center gap-sm">
          <q-icon
            name="mdi-remote-desktop"
            size="24px"
            class="text-primary"
            aria-hidden="true"
          />
          <h2 class="panel-title">{{ $gettext('Remote Access') }}</h2>
        </div>

        <div class="row items-center gap-sm">
          <q-spinner-dots v-if="loading && !agentData.status" color="primary" size="24px" />
          <template v-else>
            <!-- Dynamic Status Badge -->
            <div :class="['status-badge', statusClass]">
              <span class="status-dot"></span>
              <span class="status-text">{{ statusLabel }}</span>
            </div>
          </template>

          <q-btn
            flat
            round
            dense
            icon="mdi-refresh"
            :loading="loading"
            class="refresh-btn"
            @click="fetchStatus"
          >
            <q-tooltip>{{ $gettext('Refresh status') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Dynamic Content Sections -->
      <div v-if="loading && !agentData.status" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <template v-else>
        <!-- ONLINE STATE -->
        <div
          v-if="agentData.status === 'online'"
          class="glass-panel q-pa-md row items-center justify-between shadow-1"
        >
          <div class="col-12 col-md-8">
            <div class="text-subtitle1 text-weight-medium text-primary">
              {{ $gettext('Agent is ready for secure remote connections.') }}
            </div>
            <div class="text-caption text-mono q-mt-sm opacity-70 flex items-center gap-xs">
              <q-icon name="mdi-server-network" size="16px" />
              <span>Relay: {{ agentData.relay || '--' }}</span>
            </div>
          </div>
          <div class="col-12 col-md-4 row justify-end q-gutter-sm q-mt-sm-md">
            <q-btn
              v-for="service in agentData.services"
              :key="service"
              flat
              no-caps
              class="action-btn text-weight-bold"
              :icon="getServiceIcon(service)"
              :label="service.toUpperCase()"
              @click="connect(service)"
            >
              <q-tooltip>{{ $gettext('Open connection terminal') }}</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- OFFLINE STATE -->
        <div v-else-if="agentData.status === 'offline'" class="solid-panel q-pa-md">
          <div class="row items-center no-wrap">
            <q-icon
              name="mdi-cloud-off-outline"
              size="32px"
              class="opacity-40 q-mr-md"
              aria-hidden="true"
            />
            <div>
              <div class="text-subtitle1 text-weight-bold text-neutral-800">
                {{ $gettext('Agent is currently offline') }}
              </div>
              <div class="text-body2 text-neutral-500 q-mt-xs">
                {{ $gettext('The migasfree-agent service may not be running on this computer, or the computer is turned off.') }}
              </div>
            </div>
          </div>
        </div>

        <!-- UNKNOWN / ERROR STATE -->
        <div v-else class="solid-panel q-pa-md theme-warning-border">
          <div class="row items-center no-wrap">
            <q-icon
              name="mdi-alert-circle-outline"
              size="32px"
              class="text-warning q-mr-md"
              aria-hidden="true"
            />
            <div>
              <div class="text-subtitle1 text-weight-bold text-neutral-800">
                {{ $gettext('Connection Status Unknown') }}
              </div>
              <div class="text-body2 text-neutral-500 q-mt-xs">
                {{ agentData.error || $gettext('Could not retrieve status from the remote access manager.') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </q-card-section>
  </q-card>
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
    const response = await api.get(`/api/v1/token/computers/${props.cid}/remote-access/`)
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
  const norm = service.toLowerCase()
  if (norm === 'ssh') return 'mdi-console'
  if (norm === 'vnc') return 'mdi-monitor-eye'
  if (norm === 'rdp') return 'mdi-microsoft-windows'
  return 'mdi-link'
}

const connect = (service) => {
  const url = `/manager/v1/private/tunnel/console?agent=${props.cid}&service=${service.toLowerCase()}`
  window.open(url, '_blank')
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
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.action-btn:hover {
  background: rgba(var(--brand-primary-rgb), 0.12);
  transform: scale(1.05);
}

[data-theme='dark'] .action-btn {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* Warning Border for error states */
.theme-warning-border {
  border: 1px solid var(--q-warning, #a16207) !important;
  background: rgba(var(--q-warning-rgb, 161, 98, 7), 0.02);
}

/* Refresh Button rotation */
.refresh-btn {
  transition: transform 0.2s ease-in-out;
}

.refresh-btn:hover {
  transform: rotate(30deg);
}
</style>
