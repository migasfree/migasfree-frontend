<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
      :add-route="addRoute"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            model="devices/devices"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'model.name'">
          <MigasLink
            model="devices/models"
            :pk="slotProps.props.row.model.id"
            :value="slotProps.props.row.model.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'connection.name'">
          <MigasLink
            model="devices/connections"
            :pk="slotProps.props.row.connection.id"
            :value="slotProps.props.row.connection.name"
          />
        </span>

        <span
          v-else-if="slotProps.props.column.field == 'model.manufacturer.name'"
        >
          <MigasLink
            model="devices/manufacturers"
            :pk="slotProps.props.row.model.manufacturer.id"
            :value="slotProps.props.row.model.manufacturer.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'total_computers'">
          {{ slotProps.props.row.total_computers }}
        </span>

        <span v-else>
          {{ slotProps.props.formattedRow[slotProps.props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
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

    const model = 'devices/devices'
    const detailRoute = 'device-detail'
    const addRoute = 'device-add'

    const title = ref($gettext('Devices'))

    const breadcrumbs = reactive([
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

    const columns = reactive([
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
          placeholder: $gettext('Filter'),
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
          placeholder: $gettext('Filter'),
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
          placeholder: $gettext('Filter'),
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
          columns.find(
            (x) => x.field === 'model.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/devices/manufacturers/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'model.manufacturer.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/devices/connections/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'connection.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await loadFilters()
    })

    return {
      title,
      breadcrumbs,
      columns,
      model,
      detailRoute,
      addRoute,
    }
  },
}
</script>
