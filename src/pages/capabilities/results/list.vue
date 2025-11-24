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

    useMeta({ title: $gettext('Capabilities List') })

    const routes = {
      add: 'capability-add',
      detail: 'capability-detail',
    }
    const model = 'devices/capabilities'

    const title = ref($gettext('Capabilities'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: $gettext('Capabilities'),
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
    ])

    return {
      title,
      breadcrumbs,
      columns,
      model,
      routes,
      modelIcon,
    }
  },
}
</script>
