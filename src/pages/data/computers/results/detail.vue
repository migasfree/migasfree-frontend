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
      :add-button="false"
      :continue-button="isSuperUser"
      :save-button="isSuperUser"
      :borderless="true"
      @set-related="setRelated"
      @update-related="setRelated"
      @set-title="setTitle"
    >
      <template v-if="element.id" #actions>
        <q-btn
          :icon="appIcon('events')"
          flat
          round
          color="primary"
          :to="{
            name: 'computer-events',
            params: { id: element.id },
          }"
        >
          <q-tooltip>{{ $gettext('Events') }}</q-tooltip>
        </q-btn>

        <q-btn
          :icon="appIcon('simulate')"
          flat
          round
          color="primary"
          :to="{
            name: 'computer-simulate',
            params: { id: element.id },
          }"
        >
          <q-tooltip>{{ $gettext('Simulate synchronization') }}</q-tooltip>
        </q-btn>

        <q-btn
          :icon="appIcon('identification')"
          flat
          round
          color="primary"
          :to="{
            name: 'computer-label',
            params: { id: element.id },
          }"
        >
          <q-tooltip>{{ $gettext('Identification') }}</q-tooltip>
        </q-btn>

        <ComputerRemoteAccess :cid="element.id" />
      </template>

      <template #fields>
        <!-- Tabs Header -->
        <q-tabs
          v-model="activeTab"
          dense
          class="computer-tabs text-grey-7 q-mb-md"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
          no-caps
        >
          <q-tab
            name="general"
            :label="$gettext('General')"
            :icon="appIcon('identification')"
          />
          <q-tab
            name="hardware"
            :label="$gettext('Hardware')"
            :icon="appIcon('hardware')"
          />
          <q-tab
            name="telemetry"
            :label="$gettext('Telemetry')"
            :icon="appIcon('telemetry')"
          />
          <q-tab
            name="software"
            :label="$gettext('Software')"
            :icon="modelIcon('packages')"
          />
        </q-tabs>

        <q-separator class="q-mb-lg" />

        <!-- Tab Panels -->
        <q-tab-panels
          v-model="activeTab"
          animated
          class="transparent q-pa-none"
        >
          <!-- Tab 1: General -->
          <q-tab-panel name="general" class="q-pa-none">
            <div class="row q-col-gutter-y-md">
              <div class="col-12">
                <ComputerIdentity
                  :cid="element.id"
                  :name="element.name"
                  :fqdn="element.fqdn"
                  :created-at="element.created_at"
                  :status="element.status"
                  :comment="element.comment"
                  :tags="element.tags"
                  :status-options="statusOptions"
                  :is-super-user="isSuperUser"
                  @update:name="(val) => (element.name = val)"
                  @update:status="(val) => (element.status = val)"
                  @update:comment="(val) => (element.comment = val)"
                  @update:tags="(val) => (element.tags = val)"
                />
              </div>

              <div v-if="markers.length > 0" class="col-12">
                <ComputerLocations :markers="markers" />
              </div>
            </div>
          </q-tab-panel>

          <!-- Tab 2: Hardware -->
          <q-tab-panel name="hardware" class="q-pa-none">
            <div class="row q-col-gutter-md justify-center">
              <div class="col-12 col-md-6 col-sm-12 col-xs-12">
                <ComputerHardwareResume
                  :cid="element.id"
                  :last-hardware-capture="
                    showDate(element.last_hardware_capture)
                  "
                  :product="element.product"
                  :product-system="element.product_system"
                  :architecture="element.architecture"
                  :uuid="element.uuid"
                  :cpu="element.cpu"
                  :ram="element.ram"
                  :storage="element.storage"
                  :disks="element.disks"
                  :mac-address="element.mac_address"
                />
              </div>

              <div class="col-12 col-md-6 col-sm-12 col-xs-12">
                <ComputerDevices :cid="element.id" />
              </div>
            </div>
          </q-tab-panel>

          <!-- Tab 3: Telemetry -->
          <q-tab-panel name="telemetry" class="q-pa-none">
            <div class="row justify-center">
              <div class="col-12">
                <ComputerTelemetry
                  :cid="element.id"
                  :project="element.project"
                  :platform="
                    element.project && element.project.platform
                      ? element.project.platform
                      : null
                  "
                  :ip-address="element.ip_address"
                  :forwarded-ip-address="element.forwarded_ip_address"
                  :sync-user="element.sync_user"
                  :sync-info="syncInfo"
                  :loading-sync="loadingSync"
                  :attributes="onlyAttributes"
                  :attribute-sets="onlyAttributeSets"
                  :domains="onlyDomains"
                  :errors="errors"
                  :faults="faults"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- Tab 4: Software -->
          <q-tab-panel name="software" class="q-pa-none">
            <div class="row justify-center">
              <div class="col-12">
                <div v-if="activeTab === 'software'">
                  <div v-if="element.has_software_inventory">
                    <ComputerSoftware :cid="element.id" />
                  </div>
                  <div
                    v-else
                    class="flex flex-center q-pa-xl text-grey-6 text-center"
                  >
                    <div class="q-pa-lg glass-panel text-center">
                      <q-icon
                        :name="modelIcon('packages')"
                        size="4em"
                        class="q-mb-md text-primary"
                        style="opacity: 0.6"
                      />
                      <div class="text-h6 text-primary">
                        {{ $gettext('No Software Inventory') }}
                      </div>
                      <div class="text-body2 q-mt-sm opacity-60">
                        {{
                          $gettext(
                            'This computer does not have software inventory enabled.',
                          )
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from 'vue-router'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import ItemDetail from 'components/ui/ItemDetail'

import ComputerIdentity from 'components/computer/Identity'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import ComputerSoftware from 'components/computer/Software'
import ComputerDevices from 'components/computer/Devices'
import ComputerTelemetry from 'components/computer/Telemetry'
import ComputerLocations from 'components/computer/Locations'
import ComputerRemoteAccess from 'components/computer/RemoteAccess'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

const { $gettext } = useGettext()
const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()
const { elementIcon, attributeValue } = useElement()
const { showDate } = useDate()

const routes = {
  list: 'computers-list',
}
const model = 'computers'

const element = reactive({
  id: 0,
})

const title = ref($gettext('Computer'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const activeTab = ref(route.query.tab || 'general')

watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && newTab !== activeTab.value) {
      activeTab.value = newTab
    }
  },
)

const loadingSync = ref(false)

const statusOptions = ref([])
const syncInfo = reactive({})
const onlyAttributes = ref([])
const onlyAttributeSets = ref([])
const onlyDomains = ref([])
const errors = reactive({ unchecked: 0, total: 0 })
const faults = reactive({ unchecked: 0, total: 0 })

const markers = ref([])

const isSuperUser = computed(() => authStore.user.is_superuser)

const isValid = computed(() => {
  return element.name !== undefined && element.name.trim() !== ''
})

const elementData = () => {
  return {
    name: element.name,
    status: element.status,
    comment: element.comment,
    tags: element.tags ? element.tags.map((t) => t.id) : [],
  }
}

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Data'),
    icon: appIcon('data'),
  },
  {
    text: $gettext('Computers'),
    icon: modelIcon(model),
    to: 'computers-dashboard',
  },
])

const loadSyncInfo = async () => {
  loadingSync.value = true
  try {
    const response = await api.get(
      `/api/v1/token/${model}/${route.params.id}/sync/`,
    )
    Object.assign(syncInfo, response.data)

    const fetchBadge = async (val, type) => {
      const { data } = await api.get(
        `/api/v1/token/attributes/${val.id}/badge/`,
      )
      const icon = modelIcon(type)
      const modelName =
        type === 'attribute-sets'
          ? data.pk === 1
            ? 'features'
            : 'attribute-sets'
          : 'domains'
      return {
        id: data.pk,
        icon,
        model: modelName,
        value: attributeValue(val),
        summary: data.summary,
      }
    }

    const badgePromises = []
    onlyAttributeSets.value = []
    onlyDomains.value = []
    onlyAttributes.value = []
    markers.value = []

    for (const [, val] of Object.entries(response.data.sync_attributes)) {
      if (val.property_att.prefix === 'SET') {
        badgePromises.push(
          fetchBadge(val, 'attribute-sets').then((obj) =>
            onlyAttributeSets.value.push(obj),
          ),
        )
      } else if (val.property_att.prefix === 'DMN') {
        badgePromises.push(
          fetchBadge(val, 'domains').then((obj) => onlyDomains.value.push(obj)),
        )
      } else {
        onlyAttributes.value.push({
          id: val.id,
          value: attributeValue(val),
          model: val.property_att.sort === 'server' ? 'tags' : 'features',
          icon:
            val.property_att.sort === 'server'
              ? modelIcon('tags')
              : modelIcon('attributes'),
          summary: val.description,
        })
      }

      if (val.latitude !== null) {
        markers.value.push({
          id: val.id,
          model: val.property_att.sort === 'server' ? 'tags' : 'features',
          lat: val.latitude,
          lng: val.longitude,
          tooltip: attributeValue(val),
          description: val.description ? val.description : null,
        })
      }
    }

    await Promise.all(badgePromises)
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loadingSync.value = false
  }
}

const loadErrors = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/${model}/${route.params.id}/errors/`,
    )
    Object.assign(errors, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const loadFaults = async () => {
  try {
    const { data } = await api.get(
      `/api/v1/token/${model}/${route.params.id}/faults/`,
    )
    Object.assign(faults, data)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const getComputerStatus = async () => {
  try {
    const response = await api.get(`/api/v1/token/${model}/status/`)
    const { choices } = response.data

    statusOptions.value = []
    Object.entries(choices).forEach(([key, val]) => {
      statusOptions.value.push({
        label: val,
        value: key,
        icon: elementIcon(key),
      })
    })
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const setRelated = () => {
  loadSyncInfo()
  loadErrors()
  loadFaults()

  getComputerStatus()

  if (element.tags) {
    Object.entries(element.tags).map(([, val]) => {
      if (val.latitude !== null) {
        markers.value.push({
          id: val.id,
          model: 'tags',
          lat: val.latitude,
          lng: val.longitude,
          tooltip: attributeValue(val),
          description: val.description ? val.description : null,
        })
      }
    })
  }
}

const setTitle = (value) => {
  windowTitle.value = value
}
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
}
#map {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 400px;
}

.computer-tabs {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
  padding: 4px;
}

[data-theme='dark'] .computer-tabs {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.computer-tabs :deep(.q-tab) {
  min-height: 44px;
  font-weight: 700;
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--neutral-500);
}

.computer-tabs :deep(.q-tab:hover) {
  background: rgba(var(--brand-primary-rgb), 0.05);
  color: var(--brand-primary);
}

[data-theme='dark'] .computer-tabs :deep(.q-tab:hover) {
  background: rgba(255, 255, 255, 0.06);
  color: var(--brand-tertiary);
}

.computer-tabs :deep(.q-tab--active) {
  background: rgba(var(--brand-primary-rgb), 0.08);
  color: var(--brand-primary);
}

[data-theme='dark'] .computer-tabs :deep(.q-tab--active) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--brand-tertiary);
}

.computer-tabs :deep(.q-tab__indicator) {
  display: none;
}
</style>
