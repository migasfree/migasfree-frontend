<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResultsRef"
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #header-actions>
        <q-btn
          v-if="isSuperUser"
          class="q-ma-xs"
          color="secondary"
          :icon="appIcon('copy')"
          @click="openCopyModal"
        >
          <q-tooltip>{{ $gettext('Copy Drivers') }}</q-tooltip>
        </q-btn>
      </template>

      <template #cell-name="{ props }">
        {{ getDriverDisplayName(props.row.name) }}
      </template>

      <template #cell-model_name="{ props }">
        <MigasLink
          model="devices/models"
          :pk="props.row.model.id"
          :value="`${props.row.model.name} (${props.row.model.manufacturer.name})`"
        />
      </template>
    </TableResults>

    <!-- Copy Drivers Dialog -->
    <CopyProjectDialog
      v-model="showCopyModal"
      :icon="modelIcon('devices/drivers')"
      :title="$gettext('Copy Drivers to Project')"
      :items-label="$gettext('Drivers to Copy')"
      :get-items="getDriversToCopy"
      :copy-item="copyDriver"
      @copied="onDriversCopied"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'
import CopyProjectDialog from 'components/ui/CopyProjectDialog'

import { appIcon, modelIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()
const authStore = useAuthStore()

const isSuperUser = computed(() => authStore.user?.is_superuser)

const getDriverDisplayName = (name) => {
  return (name || '').split('/').reverse()[0] || $gettext('Unnamed')
}

const tableResultsRef = ref(null)
const showCopyModal = ref(false)

const openCopyModal = () => {
  showCopyModal.value = true
}

const getDriversToCopy = async (projectId) => {
  const { data } = await api.get('/api/v1/token/devices/drivers/', {
    params: {
      project__id: projectId,
      page_size: 10000,
    },
  })
  const list = data.results || []
  return list.map((driver) => ({
    id: driver.id,
    label: `${getDriverDisplayName(driver.name)} [${driver.model.name} (${driver.model.manufacturer.name})]`,
    original: driver,
  }))
}

const copyDriver = async (item, destinationProjectId) => {
  const driver = item.original
  const payload = {
    name: driver.name,
    model: driver.model.id,
    project: destinationProjectId,
    capability: driver.capability.id,
    packages_to_install: driver.packages_to_install || [],
  }
  await api.post('/api/v1/token/devices/drivers/', payload)
}

const onDriversCopied = () => {
  tableResultsRef.value?.loadItems()
}

const routes = {
  add: 'driver-add',
  detail: 'driver-detail',
}
const model = 'devices/drivers'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Drivers'),
  $gettext('Drivers List'),
  [
    {
      text: $gettext('Devices'),
      icon: appIcon('devices'),
    },
  ],
  [
    {
      label: $gettext('Driver'),
      field: 'name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      field: 'model.id',
      hidden: true,
    },
    {
      label: $gettext('Model'),
      field: 'model.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      field: 'project.id',
      hidden: true,
    },
    {
      label: $gettext('Project'),
      field: 'project.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      field: 'capability.id',
      hidden: true,
    },
    {
      label: $gettext('Capability'),
      field: 'capability.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [modelsResponse, projectsResponse, capabilitiesResponse] =
      await Promise.all([
        api.get('/api/v1/token/devices/models/'),
        api.get('/api/v1/token/projects/'),
        api.get('/api/v1/token/devices/capabilities/'),
      ])

    setFilterItems(
      'model.name',
      modelsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'project.name',
      projectsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'capability.name',
      capabilitiesResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
