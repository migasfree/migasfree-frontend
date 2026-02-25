<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #cell-name="{ props }">
        {{ props.row.name.split('/').reverse()[0] }}
      </template>

      <template #cell-model_name="{ props }">
        <MigasLink
          model="devices/models"
          :pk="props.row.model.id"
          :value="`${props.row.model.name} (${props.row.model.manufacturer.name})`"
        />
      </template>

      <template #cell-project_name="{ props }">
        <MigasLink
          model="projects"
          :pk="props.row.project.id"
          :value="props.row.project.name"
        />
      </template>

      <template #cell-capability_name="{ props }">
        <MigasLink
          model="devices/capabilities"
          :pk="props.row.capability.id"
          :value="props.row.capability.name"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

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
