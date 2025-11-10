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
      <template #fields="{ props }">
        <span v-if="props.column.field == '__str__'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.__str__"
          />
        </span>

        <span v-else-if="props.column.field == 'device.name'">
          <MigasLink
            model="devices/devices"
            :pk="props.row.device.id"
            :value="props.row.device.name"
          />
        </span>

        <span v-else-if="props.column.field == 'capability.name'">
          <MigasLink
            model="devices/capabilities"
            :pk="props.row.capability.id"
            :value="props.row.capability.name"
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
import { useFilterHelper } from 'composables/filterHelper'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Logical Devices List') })

    const routes = {
      add: 'logical-device-add',
      detail: 'logical-device-detail',
    }
    const model = 'devices/logical'
    const moreFilters = ['model']

    const title = ref($gettext('Logical Devices'))

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
    ])

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

    return { routes, model, moreFilters, title, breadcrumbs, columns }
  },
}
</script>
