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
              query: { manufacturer: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Model') }}</q-tooltip></q-btn
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
  add: 'manufacturer-add',
  detail: 'manufacturer-detail',
}
const model = 'devices/manufacturers'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Manufacturers'),
  $gettext('Manufacturers List'),
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
