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
          @click="connect(service)"
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
          @click="connect('sync')"
        >
          <q-tooltip>{{ $gettext('Execute synchronization') }}</q-tooltip>
        </q-btn>
      </div>
    </template>
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
  const norm = service.toLowerCase()
  if (norm === 'ssh') return 'mdi-console'
  if (norm === 'vnc') return 'mdi-monitor-eye'
  if (norm === 'rdp') return 'mdi-microsoft-windows'
  if (norm === 'sync') return 'mdi-sync'
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
</style>
