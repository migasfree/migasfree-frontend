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
        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-12 col-md-6 col-sm-12 col-xs-12">
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

          <div class="col-12 col-md-6 col-sm-12 col-xs-12">
            <ComputerHardwareResume
              :cid="element.id"
              :last-hardware-capture="showDate(element.last_hardware_capture)"
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
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-12 col-md-6 col-sm-12 col-xs-12">
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

          <!-- Card 4: Software & Devices -->
          <div class="col-12 col-md-6 col-sm-12 col-xs-12">
            <div class="q-gutter-y-md">
              <div v-if="element.has_software_inventory">
                <ComputerSoftware :cid="element.id" />
              </div>

              <div v-if="element.id">
                <ComputerDevices :cid="element.id" />
              </div>
            </div>
          </div>
        </div>

        <!-- Card 5: Locations Map -->
        <div v-if="markers.length > 0" class="row q-pb-md q-col-gutter-md">
          <div class="col col-md col-sm-12">
            <ComputerLocations :markers="markers" />
          </div>
        </div>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRoute } from 'vue-router'
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
</style>
