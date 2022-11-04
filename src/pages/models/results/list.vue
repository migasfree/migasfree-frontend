<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
      :add-route="addRoute"
      :more-filters="moreFilters"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            model="devices/models"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'manufacturer.name'">
          <MigasLink
            model="devices/manufacturers"
            :pk="slotProps.props.row.manufacturer.id"
            :value="slotProps.props.row.manufacturer.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'device_type.name'">
          <MigasLink
            model="devices/types"
            :pk="slotProps.props.row.device_type.id"
            :value="slotProps.props.row.device_type.name"
          />
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

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Models List') })

    const model = 'devices/models'
    const detailRoute = 'model-detail'
    const addRoute = 'model-add'
    const moreFilters = ['project']

    const title = ref($gettext('Models'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Devices'),
        icon: 'mdi-printer-eye',
      },
      {
        text: title.value,
        icon: modelIcon(model),
        to: 'models-dashboard',
      },
      {
        text: $gettext('Results'),
        icon: 'mdi-table-large',
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
        field: 'manufacturer.id',
        hidden: true,
      },
      {
        label: $gettext('Manufacturer'),
        field: 'manufacturer.name',
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
        label: $gettext('Type'),
        field: 'device_type.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/devices/manufacturers/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'manufacturer.name'
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
        .get('/api/v1/token/devices/types/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'device_type.name'
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
      model,
      detailRoute,
      addRoute,
      moreFilters,
      title,
      breadcrumbs,
      columns,
    }
  },
}
</script>
