<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :element-data="elementData"
      :is-valid="isValid"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <!-- General Section -->
        <q-card-section>
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center"
          >
            <q-icon
              name="mdi-information-outline"
              size="sm"
              class="q-mr-sm color-primary"
            />
            {{ $gettext('General') }}
          </div>

          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="element.config"
                :label="$gettext('Configuration')"
                :options="configs"
                option-value="id"
                :option-label="getConfigOptionLabel"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="element.name"
                :label="$gettext('Release Version')"
                placeholder="e.g. v1.0, 2026-05"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                type="textarea"
                rows="4"
                :label="$gettext('Release Notes & Changelog')"
              />
            </div>
          </div>
        </q-card-section>
      </template>

      <!-- Builds List and Launcher in the Extra slot -->
      <template v-if="element.id" #extra>
        <q-card class="builds-card q-pa-md shadow-2 rounded-borders">
          <q-card-section
            class="row items-center justify-between no-wrap q-py-sm"
          >
            <div>
              <div class="text-h5 text-weight-medium row items-center">
                <q-icon
                  name="mdi-hammer-wrench"
                  size="sm"
                  class="q-mr-sm text-primary"
                />
                {{ $gettext('Image Compilations (Builds)') }}
              </div>
              <div class="text-caption text-grey-8 q-mt-xs">
                {{
                  $gettext(
                    'Manage, monitor, and launch new build tasks for this release version.',
                  )
                }}
              </div>
            </div>

            <q-btn
              color="primary"
              push
              no-caps
              :icon="appIcon('play')"
              class="q-px-md q-py-sm"
              @click="triggerBuild"
            >
              <span class="q-ml-xs text-weight-bold">{{
                $gettext('Launch Build')
              }}</span>
            </q-btn>
          </q-card-section>

          <q-separator class="q-my-md" />

          <!-- Builds Table -->
          <q-card-section class="q-pa-none">
            <q-table
              flat
              bordered
              :rows="builds"
              :columns="buildColumns"
              row-key="id"
              class="no-shadow"
              :no-data-label="
                $gettext('No compilations launched for this release.')
              "
            >
              <!-- Actions Cell -->
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <div class="row items-center q-gutter-x-xs no-wrap">
                    <q-btn
                      flat
                      round
                      size="sm"
                      color="primary"
                      :icon="appIcon('edit')"
                      @click="
                        $router.push({
                          name: 'build-detail',
                          params: { id: props.row.id },
                        })
                      "
                    >
                      <q-tooltip>{{
                        $gettext('View Build Logs & Details')
                      }}</q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="props.row.uri"
                      flat
                      round
                      size="sm"
                      color="secondary"
                      :icon="appIcon('download')"
                      type="a"
                      :href="props.row.uri"
                      target="_blank"
                      class="q-mr-xs"
                    >
                      <q-tooltip>{{
                        $gettext('Download System Image')
                      }}</q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="isFinishedStatus(props.row.status)"
                      flat
                      round
                      size="sm"
                      color="negative"
                      :icon="appIcon('delete')"
                      @click.stop="confirmRemove(props.row.id)"
                    >
                      <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>

              <!-- ID Cell -->
              <template #body-cell-id="props">
                <q-td :props="props">
                  <MigasLink
                    model="mgi/build"
                    :pk="props.row.id"
                    :value="props.row.__str__"
                  />
                </q-td>
              </template>

              <!-- Status Cell -->
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.row.status)"
                    text-color="white"
                    :icon="getStatusIcon(props.row.status)"
                    class="text-weight-bold text-uppercase text-caption q-px-sm"
                  >
                    {{ getStatusLabel(props.row.status) }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Size Cell -->
              <template #body-cell-size="props">
                <q-td :props="props">
                  {{ props.row.size ? formatBytes(props.row.size) : '--' }}
                </q-td>
              </template>

              <!-- Finished / Finished Cells -->
              <template #body-cell-started_at="props">
                <q-td :props="props">
                  <DateView
                    v-if="props.row.started_at"
                    :value="props.row.started_at"
                  />
                  <span v-else class="text-grey-6">--</span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'

import { appIcon, modelIcon } from 'composables/element'

const uiStore = useUiStore()
const router = useRouter()
const { $gettext } = useGettext()
const $q = useQuasar()

const title = ref($gettext('Release'))

const isFinishedStatus = (status) => {
  if (!status) return false
  const s = status.toLowerCase()
  return ['completed', 'failed', 'cancelled', 'error'].includes(s)
}

const confirmRemove = (buildId) => {
  $q.dialog({
    message: $gettext('Are you sure you want to remove this item?'),
    ok: {
      color: 'negative',
      label: $gettext('Delete'),
      icon: appIcon('delete'),
    },
    cancel: {
      flat: true,
      label: $gettext('Cancel'),
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/api/v1/token/mgi/build/${buildId}/`)
      uiStore.notifySuccess($gettext('Item deleted!'))
      // Refresh related builds
      const buildsResponse = await api.get(
        `/api/v1/token/mgi/build/?release=${element.id}`,
      )
      builds.value = buildsResponse.data.results
    } catch (error) {
      uiStore.notifyError(error)
    }
  })
}
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'releases-list',
  add: 'release-add',
  detail: 'release-detail',
}
const model = 'mgi/release'

const getConfigOptionLabel = (item) => {
  if (!item) return ''
  return item.__str__ || item.template_id || ''
}

const element = reactive({
  id: 0,
  config: undefined,
  name: '',
  description: '',
})

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
    text: $gettext('Releases'),
    icon: modelIcon(model),
    to: routes.list,
  },
])

const configs = ref([])
const builds = ref([])

const buildColumns = [
  { name: 'actions', label: $gettext('Actions'), align: 'left' },
  { name: 'id', label: 'ID', align: 'left', sortable: true },
  { name: 'status', label: $gettext('Status'), align: 'center' },
  {
    name: 'started_at',
    label: $gettext('Started At'),
    align: 'left',
    sortable: true,
  },
  { name: 'size', label: $gettext('Size'), align: 'left' },
]

const isValid = computed(() => {
  return (
    element.config !== undefined &&
    element.name !== undefined &&
    element.name.trim() !== ''
  )
})

const loadRelated = async () => {
  try {
    const configsResponse = await api.get('/api/v1/token/mgi/config/')
    configs.value = configsResponse.data.results

    if (element.id) {
      if (element.config) {
        const resolvedConf = configs.value.find((c) => c.id === element.config)
        if (resolvedConf) {
          element.config = resolvedConf
        }
      }

      // Fetch related builds
      const buildsResponse = await api.get(
        `/api/v1/token/mgi/build/?release=${element.id}`,
      )
      builds.value = buildsResponse.data.results
    }
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const triggerBuild = async () => {
  try {
    const { data } = await api.post(
      `/api/v1/token/mgi/release/${element.id}/build/`,
    )
    const taskId = data.task_id

    uiStore.notifySuccess($gettext('Compilation started successfully!'))

    // Poll until the Build record appears in the database (created async by the worker)
    const MAX_RETRIES = 10
    const RETRY_INTERVAL = 2000

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL))

      const buildsResponse = await api.get(
        `/api/v1/token/mgi/build/?task_id=${encodeURIComponent(taskId)}`,
      )

      const results = buildsResponse.data.results
      if (results && results.length > 0) {
        router.push({
          name: 'build-detail',
          params: { id: results[0].id },
        })
        return
      }
    }

    // Fallback: refresh the builds table if the record never appeared
    const buildsResponse = await api.get(
      `/api/v1/token/mgi/build/?release=${element.id}`,
    )
    builds.value = buildsResponse.data.results
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusColor = (status) => {
  if (!status) return 'grey-7'
  const s = status.toLowerCase()
  const colors = {
    queued: 'orange-7',
    running: 'blue-8',
    completed: 'green-8',
    failed: 'red-8',
    error: 'red-8',
  }
  return colors[s] || 'grey-7'
}

const getStatusIcon = (status) => {
  if (!status) return 'mdi-help-circle'
  const s = status.toLowerCase()
  const icons = {
    queued: 'mdi-clock-outline',
    running: 'mdi-sync',
    completed: 'mdi-check-circle-outline',
    failed: 'mdi-alert-circle-outline',
    error: 'mdi-alert-circle-outline',
  }
  return icons[s] || 'mdi-help-circle'
}

const getStatusLabel = (status) => {
  if (!status) return ''
  const s = status.toLowerCase()
  const labels = {
    queued: $gettext('Queued'),
    running: $gettext('Running'),
    completed: $gettext('Completed'),
    failed: $gettext('Failed'),
    error: $gettext('Failed'),
  }
  return labels[s] || status
}

const elementData = () => {
  return {
    config:
      typeof element.config === 'object' ? element.config.id : element.config,
    name: element.name,
    description: element.description,
  }
}

const resetElement = () => {
  Object.assign(element, {
    id: 0,
    config: undefined,
    name: '',
    description: '',
  })
  builds.value = []
}

const setTitle = (value) => {
  windowTitle.value = value
}
</script>

<style scoped>
.color-primary {
  color: var(--brand-primary);
}
.builds-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
}
[data-theme='dark'] .builds-card {
  background: rgba(var(--bg-card-rgb), 0.4);
  backdrop-filter: blur(10px);
}
</style>
