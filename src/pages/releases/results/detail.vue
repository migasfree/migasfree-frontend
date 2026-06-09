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
                @update:model-value="onConfigChanged"
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
              :icon="appIcon('add')"
              class="q-px-md q-py-sm"
              @click="openLaunchDialog"
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
              <!-- Flavour Cell -->
              <template #body-cell-flavour="props">
                <q-td :props="props">
                  <span class="text-weight-bold text-primary">{{
                    getFlavourName(props.row.flavour)
                  }}</span>
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

              <!-- Created / Finished Cells -->
              <template #body-cell-started_at="props">
                <q-td :props="props">
                  <span v-if="props.row.started_at">{{
                    formatDateTime(props.row.started_at)
                  }}</span>
                  <span v-else class="text-grey-6">--</span>
                </q-td>
              </template>

              <!-- Actions Cell -->
              <template #body-cell-actions="props">
                <q-td
                  :props="props"
                  class="row items-center q-gutter-x-sm no-wrap"
                >
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="mdi-text-box-search-outline"
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
                    color="secondary"
                    icon="mdi-download"
                    type="a"
                    :href="props.row.uri"
                    target="_blank"
                  >
                    <q-tooltip>{{
                      $gettext('Download System Image')
                    }}</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Launch Compilation Dialog -->
        <q-dialog v-model="launchDialog" persistent>
          <q-card style="min-width: 420px; border-radius: 16px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6 text-weight-bold row items-center">
                <q-icon
                  name="mdi-play-circle-outline"
                  size="sm"
                  class="q-mr-sm text-primary"
                />
                {{ $gettext('Launch Compilation') }}
              </div>
              <q-space />
              <q-btn v-close-popup flat round dense icon="close" />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <p class="text-body2 text-grey-8">
                {{
                  $gettext(
                    'Select which flavour profile you want to trigger the system compilation for.',
                  )
                }}
              </p>
              <q-select
                v-model="selectedFlavour"
                :label="$gettext('System Flavour')"
                :options="filteredFlavours"
                option-value="id"
                option-label="name"
                filled
                class="q-mt-md"
              />
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md bg-grey-1">
              <q-btn v-close-popup flat :label="$gettext('Cancel')" no-caps />
              <q-btn
                color="primary"
                push
                :label="$gettext('Start Compilation')"
                no-caps
                :disabled="!selectedFlavour"
                @click="triggerBuild"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta, date } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

const uiStore = useUiStore()
const { $gettext } = useGettext()

const title = ref($gettext('Release'))
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
  const projectName =
    item.project && typeof item.project === 'object'
      ? item.project.name
      : item.project || ''
  return projectName ? `${projectName} (${item.template_id})` : item.template_id
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
const flavoursList = ref([])

const launchDialog = ref(false)
const selectedFlavour = ref(null)

const buildColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'flavour', label: $gettext('Flavour'), align: 'left' },
  { name: 'status', label: $gettext('Status'), align: 'center' },
  {
    name: 'started_at',
    label: $gettext('Started At'),
    align: 'left',
    sortable: true,
  },
  { name: 'size', label: $gettext('Size'), align: 'left' },
  { name: 'actions', label: $gettext('Actions'), align: 'right' },
]

const isValid = computed(() => {
  return (
    element.config !== undefined &&
    element.name !== undefined &&
    element.name.trim() !== ''
  )
})

const filteredFlavours = computed(() => {
  if (!element.config) return []
  const cid =
    typeof element.config === 'object' ? element.config.id : element.config
  return flavoursList.value.filter(
    (f) => f.config === cid || f.config?.id === cid,
  )
})

const loadRelated = async () => {
  try {
    const configsResponse = await api.get('/api/v1/token/mgi/config/')
    configs.value = configsResponse.data.results

    if (element.id) {
      if (element.config) {
        const resolvedConf = configs.value.find(
          (c) => c.id === element.config || c.id === element.config?.id,
        )
        if (resolvedConf) {
          element.config = resolvedConf
        }
      }

      // Fetch related builds and flavours
      const [buildsResponse, flavoursResponse] = await Promise.all([
        api.get(`/api/v1/token/mgi/build/?release=${element.id}`),
        api.get('/api/v1/token/mgi/flavour/'),
      ])

      builds.value = buildsResponse.data.results
      flavoursList.value = flavoursResponse.data.results
    }
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const onConfigChanged = () => {
  selectedFlavour.value = null
}

const getFlavourName = (flavourId) => {
  const f = flavoursList.value.find((x) => x.id === flavourId)
  return f ? f.name : `${$gettext('Flavour')} #${flavourId}`
}

const openLaunchDialog = () => {
  selectedFlavour.value = null
  launchDialog.value = true
}

const triggerBuild = async () => {
  try {
    const payload = {
      release: element.id,
      flavour: selectedFlavour.value.id,
    }
    const { data } = await api.post('/api/v1/token/mgi/build/', payload)

    // Append the new build to our list
    builds.value.unshift(data)

    uiStore.notifySuccess($gettext('Compilation started successfully!'))
    launchDialog.value = false
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

const formatDateTime = (val) => {
  return date.formatDate(val, 'YYYY-MM-DD HH:mm:ss')
}

const getStatusColor = (status) => {
  const colors = {
    queued: 'orange-7',
    running: 'blue-8',
    completed: 'green-8',
    failed: 'red-8',
  }
  return colors[status] || 'grey-7'
}

const getStatusIcon = (status) => {
  const icons = {
    queued: 'mdi-clock-outline',
    running: 'mdi-sync',
    completed: 'mdi-check-circle-outline',
    failed: 'mdi-alert-circle-outline',
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    queued: $gettext('Queued'),
    running: $gettext('Running'),
    completed: $gettext('Completed'),
    failed: $gettext('Failed'),
  }
  return labels[status] || status
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
