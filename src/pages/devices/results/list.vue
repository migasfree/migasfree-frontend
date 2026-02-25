<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #cell-model_name="{ props }">
        <MigasLink
          model="devices/models"
          :pk="props.row.model.id"
          :value="props.row.model.name"
        />
      </template>

      <template #cell-connection_name="{ props }">
        <MigasLink
          model="devices/connections"
          :pk="props.row.connection.id"
          :value="props.row.connection.name"
        />
      </template>

      <template #cell-model_manufacturer_name="{ props }">
        <MigasLink
          model="devices/manufacturers"
          :pk="props.row.model.manufacturer.id"
          :value="props.row.model.manufacturer.name"
        />
      </template>

      <template #cell-total_computers="{ props }">
        {{ props.row.total_computers }}
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

import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const routes = {
  add: 'device-add',
  detail: 'device-detail',
}
const model = 'devices/devices'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Devices'),
  $gettext('Devices List'),
  [],
  [
    {
      label: $gettext('Name'),
      field: 'name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Location'),
      field: 'location',
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
      field: 'model.manufacturer.id',
      hidden: true,
    },
    {
      label: $gettext('Manufacturer'),
      field: 'model.manufacturer.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      field: 'connection.id',
      hidden: true,
    },
    {
      label: $gettext('Connection'),
      field: 'connection.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Computers'),
      field: 'total_computers',
      type: 'number',
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [modelsResponse, manufacturersResponse, connectionsResponse] =
      await Promise.all([
        api.get('/api/v1/token/devices/models/'),
        api.get('/api/v1/token/devices/manufacturers/'),
        api.get('/api/v1/token/devices/connections/'),
      ])

    setFilterItems(
      'model.name',
      modelsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'model.manufacturer.name',
      manufacturersResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'connection.name',
      connectionsResponse.data.results.map(({ id, name }) => ({
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
