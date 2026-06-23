<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="$gettext('Build')"
      :icon="modelIcon(model)"
      :has-export-button="false"
    >
      <template #append>
        <MigasLink
          v-if="build.id"
          model="mgi/build"
          :pk="build.id"
          :value="breadcrumbDetailValue"
          hide-icon
        />
      </template>
      <template #actions>
        <q-btn
          v-if="build.uri"
          color="primary"
          :icon="appIcon('download')"
          type="a"
          :href="build.uri"
          target="_blank"
          class="q-mr-sm"
        >
          <q-tooltip>{{ $gettext('Download Image') }}</q-tooltip>
        </q-btn>
        <q-btn color="primary" :icon="appIcon('doc')" @click="downloadLogs">
          <q-tooltip>{{ $gettext('Download Logs') }}</q-tooltip>
        </q-btn>
      </template>
    </Header>

    <div class="row q-col-gutter-lg q-mt-md">
      <!-- Left Column: Metrics & Meta -->
      <div class="col-12 col-md-4">
        <q-card class="metrics-card shadow-2 rounded-borders">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-md row items-center">
              <q-icon
                name="mdi-chart-timeline-variant"
                size="sm"
                class="q-mr-sm color-primary"
              />
              {{ $gettext('Compilation Metrics') }}
            </div>

            <!-- Status Indicator -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Status') }}</span>
              <q-chip
                :color="getStatusColor(build.status)"
                text-color="white"
                :icon="getStatusIcon(build.status)"
                class="text-weight-bold text-uppercase q-px-sm"
              >
                {{ getStatusLabel(build.status) }}
              </q-chip>
            </div>

            <!-- Progress & Build Message -->
            <div
              v-if="build.status === 'building' || (buildProgress !== null && buildProgress !== 0)"
              class="q-py-md border-bottom"
            >
              <div class="row items-center justify-between q-mb-sm">
                <span class="text-grey-8">{{ $gettext('Progress') }}</span>
                <span class="text-weight-bold text-primary font-monospace">{{ buildProgress }}%</span>
              </div>
              <q-linear-progress
                :value="buildProgress / 100"
                color="primary"
                track-color="grey-3"
                stripe
                animated
                class="q-mb-sm rounded-borders"
                style="height: 8px"
              />
              <div v-if="buildMessage" class="text-caption text-grey-7 italic text-center q-mt-xs">
                {{ buildMessage }}
              </div>
            </div>

            <!-- Release Version -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Release') }}</span>
              <MigasLink
                v-if="build.release && releaseName"
                model="mgi/release"
                :pk="build.release"
                :value="releaseName"
              />
              <q-spinner-dots
                v-else-if="build.release"
                color="primary"
                size="1em"
              />
              <span v-else class="text-weight-medium text-grey-6">--</span>
            </div>

            <!-- Flavour Profile -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Flavour') }}</span>
              <MigasLink
                v-if="build.flavour && flavourName"
                model="mgi/flavour"
                :pk="build.flavour"
                :value="flavourName"
              />
              <q-spinner-dots
                v-else-if="build.flavour"
                color="primary"
                size="1em"
              />
              <span v-else class="text-weight-medium text-grey-6">--</span>
            </div>

            <!-- Task ID -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Task ID') }}</span>
              <span class="font-monospace text-caption select-all text-grey-9">
                {{ build.task_id || '--' }}
              </span>
            </div>

            <!-- Started At -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Started At') }}</span>
              <DateView v-if="build.started_at" :value="build.started_at" />
              <span v-else class="text-weight-medium text-grey-6">--</span>
            </div>

            <!-- Finished At -->
            <div class="row items-center justify-between q-py-sm border-bottom">
              <span class="text-grey-8">{{ $gettext('Finished At') }}</span>
              <DateView v-if="build.finished_at" :value="build.finished_at" />
              <span v-else class="text-weight-medium text-grey-6">--</span>
            </div>

            <!-- File Size -->
            <div class="row items-center justify-between q-py-sm">
              <span class="text-grey-8">{{ $gettext('Image Size') }}</span>
              <span class="text-weight-bold text-teal-8">
                {{ build.size ? formatBytes(build.size) : '--' }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column: Interactive Log Terminal -->
      <div class="col-12 col-md-8">
        <q-card class="terminal-card shadow-2 rounded-borders">
          <!-- Terminal Header Tools -->
          <q-card-section
            class="terminal-header row items-center justify-between q-py-sm q-px-md no-wrap"
          >
            <div class="row items-center q-gutter-x-sm">
              <span class="terminal-dot red"></span>
              <span class="terminal-dot yellow"></span>
              <span class="terminal-dot green"></span>
              <span class="q-ml-sm text-subtitle2 font-monospace text-white">{{
                $gettext('mgi_builder.log')
              }}</span>
            </div>

            <div class="row items-center q-gutter-x-md no-wrap">
              <!-- Search bar -->
              <q-input
                v-model="logSearchQuery"
                dense
                standout
                dark
                :placeholder="$gettext('Filter logs...')"
                class="terminal-search"
                clearable
              >
                <template #prepend>
                  <q-icon name="search" size="xs" />
                </template>
              </q-input>

              <!-- Autoscroll checkbox -->
              <q-checkbox
                v-model="autoscroll"
                dark
                dense
                color="green-5"
                :label="$gettext('Auto-scroll')"
                class="text-caption text-white font-monospace"
              />
            </div>
          </q-card-section>

          <!-- Console Terminal Output -->
          <div
            ref="logTerminal"
            class="terminal-body font-monospace q-pa-md"
          >
            <template v-if="filteredLogLines.length > 0">
              <div
                v-for="(line, idx) in filteredLogLines"
                :key="idx"
                class="terminal-line"
                :class="getLineClass(line)"
              >
                <span class="line-number text-grey-7 select-none">{{
                  idx + 1
                }}</span>
                <span class="line-text">{{ line }}</span>
              </div>
            </template>
            <div v-else-if="logLines.length > 0" class="text-grey-6 text-center q-pa-xl">
              {{ $gettext('No matching log entries found.') }}
            </div>
            <div
              v-else
              class="text-grey-6 text-center q-pa-xl row flex-center column q-gutter-md"
            >
              <q-spinner-cube color="green-5" size="2em" />
              <span>{{
                $gettext('Waiting for build engine log pipeline...')
              }}</span>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'

import { appIcon, modelIcon } from 'composables/element'

const route = useRoute()
const uiStore = useUiStore()
const { $gettext } = useGettext()

const model = 'mgi/build'
const projectName = ref('')
const releaseName = ref('')
const flavourName = ref('')

const breadcrumbDetailValue = computed(() => {
  if (projectName.value && releaseName.value && flavourName.value) {
    return `${projectName.value} ${releaseName.value} ${flavourName.value}`
      .trim()
      .replace(/\s+/g, ' ')
  }
  return `#${route.params.id}`
})

const windowTitle = ref($gettext('Compilation Detail'))
useMeta(() => ({ title: windowTitle.value }))

const build = reactive({
  id: 0,
  release: undefined,
  flavour: undefined,
  task_id: '',
  status: 'queued',
  started_at: null,
  finished_at: null,
  uri: '',
  size: null,
  log: '',
})

const buildProgress = ref(0)
const buildMessage = ref('')
const logLines = ref([])
let nextStart = 0

const logSearchQuery = ref('')
const autoscroll = ref(true)
const logTerminal = ref(null)

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Golden Images'),
    icon: appIcon('golden-images'),
  },
  {
    text: $gettext('Builds'),
    icon: modelIcon(model),
  },
  {
    text: $gettext('Results'),
    icon: appIcon('results'),
    to: 'builds-list',
  },
  {
    text: breadcrumbDetailValue,
    icon: modelIcon(model),
  },
])

const filteredLogLines = computed(() => {
  if (logLines.value.length === 0) return []
  const lines = logLines.value
  if (!logSearchQuery.value) return lines
  const q = logSearchQuery.value.toLowerCase()
  return lines.filter((line) => line.toLowerCase().includes(q))
})

let pollingInterval = null

const updateWindowTitle = () => {
  if (projectName.value && releaseName.value && flavourName.value) {
    windowTitle.value = `${$gettext('Build')}: ${projectName.value} ${releaseName.value} ${flavourName.value} [${build.status.toUpperCase()}]`
  } else {
    windowTitle.value = `${$gettext('Compilation')} #${build.id} [${build.status.toUpperCase()}]`
  }
}

const loadBuild = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/mgi/build/${route.params.id}/`,
    )
    Object.assign(build, data)

    if (build.release && !releaseName.value) {
      const relRes = await api.get(
        `/api/v1/token/mgi/release/${build.release}/`,
      )
      releaseName.value = relRes.data.name

      if (relRes.data.config) {
        const confRes = await api.get(
          `/api/v1/token/mgi/config/${relRes.data.config}/`,
        )
        if (confRes.data.project) {
          const projRes = await api.get(
            `/api/v1/token/projects/${confRes.data.project}/`,
          )
          projectName.value = projRes.data.name
        }
      }
    }

    if (build.flavour && !flavourName.value) {
      const flaRes = await api.get(
        `/api/v1/token/mgi/flavour/${build.flavour}/`,
      )
      flavourName.value = flaRes.data.name
    }

    updateWindowTitle()
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const fetchStatus = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/mgi/build/${route.params.id}/status/`,
    )
    build.status = data.status
    build.task_id = data.task_id
    buildProgress.value = data.progress
    buildMessage.value = data.message
    updateWindowTitle()
  } catch (error) {
    console.error('Error fetching build status:', error)
    updateWindowTitle()
  }
}

const fetchLogs = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/mgi/build/${route.params.id}/logs/`,
      { params: { start: nextStart } }
    )
    if (data.logs && data.logs.length > 0) {
      logLines.value.push(...data.logs)
    }
    nextStart = data.next_start
  } catch (error) {
    console.error('Error fetching build logs:', error)
  }
}

const fetchAllLogs = async () => {
  let hasMore = true
  nextStart = 0
  logLines.value = []
  try {
    while (hasMore) {
      const { data } = await api.get(
        `/api/v1/token/mgi/build/${route.params.id}/logs/`,
        { params: { start: nextStart } }
      )
      if (data.logs && data.logs.length > 0) {
        logLines.value.push(...data.logs)
        const previousStart = nextStart
        nextStart = data.next_start
        if (nextStart <= previousStart) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }
  } catch (error) {
    console.error('Error fetching all logs from manager:', error)
  }

  // Fallback to build.log from database if manager has no logs or is unavailable
  if (logLines.value.length === 0 && build.log) {
    logLines.value = build.log.split('\n')
  }
}

const startPolling = () => {
  if (pollingInterval) return
  pollingInterval = setInterval(async () => {
    await fetchStatus()
    await fetchLogs()
    if (
      build.status !== 'queued' &&
      build.status !== 'building' &&
      build.status !== 'running'
    ) {
      stopPolling()
      await fetchAllLogs()
      await loadBuild()
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

onMounted(async () => {
  await loadBuild()
  await fetchStatus()
  if (
    build.status === 'queued' ||
    build.status === 'building' ||
    build.status === 'running'
  ) {
    nextStart = 0
    logLines.value = []
    await fetchLogs()
    if (
      build.status === 'queued' ||
      build.status === 'building' ||
      build.status === 'running'
    ) {
      startPolling()
    } else {
      await fetchAllLogs()
    }
  } else {
    await fetchAllLogs()
  }
})

onUnmounted(() => {
  stopPolling()
})

watch(
  filteredLogLines,
  () => {
    if (autoscroll.value && logTerminal.value) {
      nextTick(() => {
        const el = logTerminal.value
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    }
  },
  { deep: true },
)

const downloadLogs = () => {
  const blob = new Blob([logLines.value.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `build_${build.id}_log.txt`
  link.click()
  URL.revokeObjectURL(url)
}

const getLineClass = (line) => {
  const lower = line.toLowerCase()
  if (
    lower.includes('error') ||
    lower.includes('failed') ||
    lower.includes('crit')
  )
    return 'line-error'
  if (lower.includes('warning') || lower.includes('warn')) return 'line-warn'
  if (
    lower.includes('success') ||
    lower.includes('completed') ||
    lower.includes('done')
  )
    return 'line-success'
  return ''
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  // eslint-disable-next-line security/detect-object-injection
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusColor = (status) => {
  const colors = {
    queued: 'orange-7',
    running: 'blue-8',
    building: 'blue-8',
    completed: 'green-8',
    failed: 'red-8',
    cancelled: 'grey-8',
  }
  // eslint-disable-next-line security/detect-object-injection
  return colors[status] || 'grey-7'
}

const getStatusIcon = (status) => {
  const icons = {
    queued: 'mdi-clock-outline',
    running: 'mdi-sync',
    building: 'mdi-sync',
    completed: 'mdi-check-circle-outline',
    failed: 'mdi-alert-circle-outline',
    cancelled: 'mdi-close-circle-outline',
  }
  // eslint-disable-next-line security/detect-object-injection
  return icons[status] || 'mdi-help-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    queued: $gettext('Queued'),
    running: $gettext('Running'),
    building: $gettext('Building'),
    completed: $gettext('Completed'),
    failed: $gettext('Failed'),
    cancelled: $gettext('Cancelled'),
  }
  // eslint-disable-next-line security/detect-object-injection
  return labels[status] || status
}
</script>

<style scoped>
.color-primary {
  color: var(--brand-primary);
}

.metrics-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
}
[data-theme='dark'] .metrics-card {
  background: rgba(var(--bg-card-rgb), 0.4);
  backdrop-filter: blur(10px);
}
[data-theme='dark'] .metrics-card .text-grey-8 {
  color: #b0bec5 !important;
}
[data-theme='dark'] .metrics-card .text-grey-9 {
  color: #cfd8dc !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
[data-theme='dark'] .border-bottom {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

/* Retro dark terminal styling */
.terminal-card {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background: #0d0e15;
  border: 1px solid #1e2030;
  border-radius: 20px;
  min-height: 520px;
  max-height: 640px;
  overflow: hidden;
}

.terminal-header {
  background: #141522;
  border-bottom: 1px solid #1e2030;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.terminal-dot.red {
  background: #ef4444;
}
.terminal-dot.yellow {
  background: #f59e0b;
}
.terminal-dot.green {
  background: #10b981;
}

.terminal-search {
  max-width: 200px;
}
.terminal-search :deep(.q-field__control) {
  background: #1d1e2e !important;
  border-radius: 8px;
  border: 1px solid #2e3047 !important;
}

.terminal-body {
  flex-grow: 1;
  overflow-y: auto;
  color: #a6accd;
  background: #0d0e15;
  line-height: 1.5;
  font-size: 0.85rem;
}

.terminal-line {
  white-space: pre-wrap;
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
}

.line-number {
  min-width: 32px;
  display: inline-block;
  text-align: right;
  margin-right: 12px;
}

.line-text {
  flex: 1;
}

.line-error .line-text {
  color: #f87171;
}
.line-warn .line-text {
  color: #fbbf24;
}
.line-success .line-text {
  color: #34d399;
}
</style>
