<template>
  <q-btn-dropdown
    v-if="isAlertsVisible"
    flat
    no-caps
    dense
    class="alerts-dropdown"
    content-class="alerts-menu"
    dropdown-icon="expand_more"
  >
    <template #label>
      <div class="alerts-pill">
        <div class="alerts-pill-main">
          <q-icon :name="appIcon('alert')" size="18px" />
          <span class="alerts-count">{{ totalAlerts }}</span>
        </div>
      </div>
      <q-tooltip>{{ $gettext('Alerts') }}</q-tooltip>
    </template>

    <q-list v-if="alerts.length" class="alerts-list">
      <q-item
        v-for="(item, index) in alerts"
        :key="index"
        v-close-popup
        clickable
        class="alert-item"
        :to="resolveAlertLink(item.api)"
      >
        <q-item-section avatar>
          <div
            :class="[
              'alert-icon-flat',
              `text-${LEVEL_COLORS[item.level] || 'grey'}`,
            ]"
          >
            <q-icon
              :name="TARGET_ICONS[item.target] || 'mdi-cloud'"
              size="22px"
            />
          </div>
        </q-item-section>

        <q-item-section>
          <q-item-label class="alert-msg">
            {{ resolveAlertText(item) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge
            :color="LEVEL_COLORS[item.level] || 'grey'"
            :text-color="LEVEL_TEXT_COLORS[item.level] || 'white'"
            class="alert-value-badge"
          >
            {{ item.result }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'
import { appIcon } from 'composables/element'

const { $gettext } = useGettext()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const alerts = ref([])
const totalAlerts = ref(0)
const socket = ref(null)

const { loggedIn } = storeToRefs(authStore)

// --- Static maps ---

const LEVEL_COLORS = {
  critical: 'negative',
  error: 'negative',
  warning: 'warning',
  info: 'info',
  success: 'positive',
}

const LEVEL_TEXT_COLORS = {
  critical: 'white',
  error: 'white',
  warning: 'black',
  info: 'black',
  success: 'white',
}

const TARGET_ICONS = {
  computer: 'mdi-laptop',
  server: 'mdi-cloud',
}

const ROUTE_MAP = {
  errors: 'errors-list',
  faults: 'faults-list',
  notifications: 'notifications-list',
  package_sets: 'package-sets-list',
  packages: 'packages-list',
  deployments: 'deployments-list',
  messages: 'messages-list',
}

// --- Computed ---

const isAlertsVisible = computed(
  () => loggedIn.value && (alerts.value.length > 0 || totalAlerts.value > 0),
)

// --- Data ---

const updateData = (newData) => {
  alerts.value = newData.filter((item) => parseInt(item.result) > 0)
  totalAlerts.value = alerts.value.reduce(
    (acc, item) => acc + parseInt(item.result),
    0,
  )
}

const loadAlerts = async () => {
  try {
    const { data } = await api.get('/api/v1/token/stats/alerts/')
    updateData(data)
  } catch (error) {
    if (error?.response?.status === 403) {
      LocalStorage.remove('auth.token')
      router.push({ name: 'login' })
    }
    uiStore.notifyError(error)
  }
}

// --- Route & text resolution ---

const resolveAlertLink = (value) => {
  if (!value?.model) return value

  const query = value.query
    ? Object.fromEntries(
        Object.entries(value.query).map(([k, v]) => [
          k,
          typeof v === 'boolean' ? v.toString() : v,
        ]),
      )
    : {}

  const name = ROUTE_MAP[value.model]
  return name ? { name, query } : value
}

const resolveAlertText = (item) => {
  const { api: alertApi } = item
  if (!alertApi?.model) return item.msg

  const staticMessages = {
    packages: $gettext('Orphan Packages'),
    notifications: $gettext('Unchecked Notifications'),
    faults: $gettext('Unchecked Faults'),
    errors: $gettext('Unchecked Errors'),
  }
  if (alertApi.model in staticMessages) return staticMessages[alertApi.model]

  const query = alertApi.query ?? {}

  if (alertApi.model === 'deployments') {
    if ('id_in' in query) return $gettext('Generating Repositories')
    if ('percent__lt' in query) return $gettext('Active schedule Deployments')
    if ('percent__gte' in query)
      return $gettext('Finished schedule Deployments')
  }

  if (alertApi.model === 'messages') {
    if ('created_at__gte' in query)
      return $gettext('Synchronizing Computers Now')
    if ('created_at__lt' in query) return $gettext('Delayed Computers')
  }

  return item.msg
}

// --- WebSocket ---

const connectWS = () => {
  const wsScheme = uiStore.server.startsWith('https') ? 'wss' : 'ws'
  const wsHost = uiStore.server.split('//')[1]
  socket.value = new WebSocket(`${wsScheme}://${wsHost}/alerts/`)

  socket.value.onmessage = (event) => updateData(JSON.parse(event.data))
  socket.value.onclose = () => setTimeout(connectWS, 1000)
  socket.value.onerror = (error) => {
    console.error(error.message ?? error)
    socket.value?.close()
  }
}

// --- Lifecycle ---

onMounted(async () => {
  if (loggedIn.value) {
    await loadAlerts()
    connectWS()
  }
})

onUnmounted(() => socket.value?.close())

watch(loggedIn, (val) => {
  if (val) loadAlerts()
})

defineExpose({
  resolveAlertLink,
  resolveAlertText,
})
</script>

<style scoped>
.alerts-dropdown {
  margin: 0 8px;
  border-radius: 24px;
}

/* Pill trigger */
.alerts-pill {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 4px 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  height: 32px;
  transition: all 0.3s ease;
}

.alerts-dropdown:hover .alerts-pill {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.alerts-pill-main {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.alerts-count {
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 20px;
  text-align: center;
}

/* Icon circle */
.alert-icon-flat {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neutral-100);
  transition: all 0.2s ease;
}

.alert-item:hover .alert-icon-flat {
  transform: scale(1.05);
  background: white;
}

/* List items */
.alerts-list {
  padding: 8px 0;
}

.alert-item {
  padding: 12px 16px;
}

.alert-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.alert-msg {
  font-weight: 600;
  font-size: 0.9rem;
}

.alert-value-badge {
  font-weight: 700;
  border-radius: 6px;
  padding: 4px 8px;
}

:deep(.q-btn-dropdown__arrow) {
  margin-left: 4px;
  opacity: 0.7;
  font-size: 18px;
  color: white;
}

/* Dark mode */
[data-theme='dark'] .alert-icon-flat {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .alert-item:hover .alert-icon-flat {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .alert-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>

<style>
/* Portal styles (teleported menu) */
.alerts-menu {
  background: rgba(var(--bg-card-rgb), 0.9) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  margin-top: 8px !important;
  min-width: 320px !important;
  color: var(--text-main);
}
</style>
