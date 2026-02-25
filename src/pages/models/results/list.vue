<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :more-filters="moreFilters"
    >
      <template #cell-manufacturer_name="{ props }">
        <MigasLink
          model="devices/manufacturers"
          :pk="props.row.manufacturer.id"
          :value="props.row.manufacturer.name"
        />
      </template>

      <template #cell-device_type_name="{ props }">
        <MigasLink
          model="devices/types"
          :pk="props.row.device_type.id"
          :value="props.row.device_type.name"
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
  add: 'model-add',
  detail: 'model-detail',
}
const model = 'devices/models'
const moreFilters = ['project']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Models'),
  $gettext('Models List'),
  [
    {
      text: $gettext('Devices'),
      icon: appIcon('devices'),
    },
  ],
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
      field: 'manufacturer.id',
      hidden: true,
    },
    {
      label: $gettext('Manufacturer'),
      field: 'manufacturer.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      field: 'device_type.id',
      hidden: true,
    },
    {
      label: $gettext('Type'),
      field: 'device_type.name',
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
    const [manufacturersResponse, typesResponse] = await Promise.all([
      api.get('/api/v1/token/devices/manufacturers/'),
      api.get('/api/v1/token/devices/types/'),
    ])

    setFilterItems(
      'manufacturer.name',
      manufacturersResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'device_type.name',
      typesResponse.data.results.map(({ id, name }) => ({
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
