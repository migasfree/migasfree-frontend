<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Schedules List') })

    const routes = {
      add: 'schedule-add',
      detail: 'schedule-detail',
    }
    const model = 'schedules'

    const title = ref($gettext('Schedules'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: title.value,
        icon: modelIcon(model),
      },
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
      },
    ])

    const columns = ref([
      {
        field: 'id',
        hidden: true,
      },
      {
        label: $gettext('Actions'),
        field: 'actions',
        html: true,
        sortable: false,
        globalSearchDisabled: true,
      },
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
    ])

    return { model, routes, title, breadcrumbs, columns }
  },
}
</script>
