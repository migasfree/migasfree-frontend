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
      <template #cell-__str__="{ props }">
        <MigasLink
          :model="model"
          :pk="props.row.id"
          :value="props.row.__str__"
        />
      </template>

      <template #cell-device_name="{ props }">
        <MigasLink
          model="devices/devices"
          :pk="props.row.device.id"
          :value="props.row.device.name"
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
  add: 'logical-device-add',
  detail: 'logical-device-detail',
}
const model = 'devices/logical'
const moreFilters = ['model']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Logical Devices'),
  $gettext('Logical Devices List'),
  [
    {
      text: $gettext('Devices'),
      icon: appIcon('devices'),
    },
  ],
  [
    {
      label: $gettext('Logical Device'),
      field: '__str__',
      html: true,
    },
    {
      field: 'device.id',
      hidden: true,
    },
    {
      label: $gettext('Device'),
      field: 'device.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
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
    {
      label: $gettext('Alternative Capability Name'),
      field: 'alternative_capability_name',
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const { data } = await api.get('/api/v1/token/devices/capabilities/')

    setFilterItems(
      'capability.name',
      data.results.map(({ id, name }) => ({
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
