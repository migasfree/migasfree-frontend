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

        <span v-else-if="props.column.field == 'device_type.name'">
          <MigasLink
            model="devices/types"
            :pk="props.row.device_type.id"
            :value="props.row.device_type.name"
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
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

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
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Connections List') })

    const routes = {
      add: 'connection-add',
      detail: 'connection-detail',
    }
    const model = 'devices/connections'

    const title = ref($gettext('Connections'))

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
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/devices/types/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'device_type.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            ({ id, name }) => ({
              value: id,
              text: name,
            }),
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await loadFilters()
    })

    return { title, breadcrumbs, columns, routes, model }
  },
}
</script>
