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
          :icon="modelIcon('deployments')"
          color="secondary"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { schedule: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
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
  add: 'schedule-add',
  detail: 'schedule-detail',
}
const model = 'schedules'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Schedules'),
  $gettext('Schedules List'),
  [
    {
      text: $gettext('Release'),
      icon: appIcon('release'),
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
      label: $gettext('Description'),
      field: 'description',
    },
    {
      label: $gettext('Delays count'),
      field: 'delays_count',
      type: 'number',
      sortable: false,
    },
  ],
)
</script>
