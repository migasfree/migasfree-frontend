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
          :icon="modelIcon('devices/drivers')"
          color="secondary"
          @click="
            $router.push({
              name: 'driver-add',
              query: { capability: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Driver') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('devices/logical')"
          color="secondary"
          @click="
            $router.push({
              name: 'logical-device-add',
              query: { capability: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Logical Device') }}</q-tooltip></q-btn
        >
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  add: 'capability-add',
  detail: 'capability-detail',
}
const model = 'devices/capabilities'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Capabilities'),
  $gettext('Capabilities List'),
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
  ],
)
</script>
