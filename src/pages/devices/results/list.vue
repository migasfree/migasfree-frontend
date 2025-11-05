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

        <span v-else-if="props.column.field == 'model.name'">
          <MigasLink
            model="devices/models"
            :pk="props.row.model.id"
            :value="props.row.model.name"
          />
        </span>

        <span v-else-if="props.column.field == 'connection.name'">
          <MigasLink
            model="devices/connections"
            :pk="props.row.connection.id"
            :value="props.row.connection.name"
          />
        </span>

        <span v-else-if="props.column.field == 'model.manufacturer.name'">
          <MigasLink
            model="devices/manufacturers"
            :pk="props.row.model.manufacturer.id"
            :value="props.row.model.manufacturer.name"
          />
        </span>

        <span v-else-if="props.column.field == 'total_computers'">
          {{ props.row.total_computers }}
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

    useMeta({ title: $gettext('Devices List') })

    const routes = {
      add: 'device-add',
      detail: 'device-detail',
    }
    const model = 'devices/devices'

    const title = ref($gettext('Devices'))

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
        to: 'devices-dashboard',
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
        label: $gettext('Location'),
        field: 'location',
      },
      {
        field: 'model.id',
        hidden: true,
      },
      {
        label: $gettext('Model'),
        field: 'model.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'model.manufacturer.id',
        hidden: true,
      },
      {
        label: $gettext('Manufacturer'),
        field: 'model.manufacturer.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'connection.id',
        hidden: true,
      },
      {
        label: $gettext('Connection'),
        field: 'connection.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Computers'),
        field: 'total_computers',
        type: 'number',
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/devices/models/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'model.name',
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

      await api
        .get('/api/v1/token/devices/manufacturers/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'model.manufacturer.name',
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

      await api
        .get('/api/v1/token/devices/connections/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'connection.name',
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
