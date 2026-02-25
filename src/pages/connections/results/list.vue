<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #actions="{ props }">
        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('devices/models')"
          color="secondary"
          @click="
            $router.push({
              name: 'model-add',
              query: { connections: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Model') }}</q-tooltip></q-btn
        >
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
  add: 'connection-add',
  detail: 'connection-detail',
}
const model = 'devices/connections'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Connections'),
  $gettext('Connections List'),
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
      field: 'device_type.id',
      hidden: true,
    },
    {
      label: $gettext('Device Type'),
      field: 'device_type.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Fields'),
      field: 'fields',
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const response = await api.get('/api/v1/token/devices/types/')

    setFilterItems(
      'device_type.name',
      response.data.results.map(({ id, name }) => ({
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
