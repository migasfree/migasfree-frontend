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
        <span v-if="slotProps.props.column.field == '__str__'">
          <MigasLink
            model="devices/logical"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.__str__"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'device.name'">
          <MigasLink
            model="devices/devices"
            :pk="slotProps.props.row.device.id"
            :value="slotProps.props.row.device.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'capability.name'">
          <MigasLink
            model="devices/capabilities"
            :pk="slotProps.props.row.capability.id"
            :value="slotProps.props.row.capability.name"
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

    useMeta({ title: $gettext('Logical Devices List') })

    const model = 'devices/logical'
    const detailRoute = 'logical-device-detail'
    const addRoute = 'logical-device-add'
    const moreFilters = ['model']

    const title = ref($gettext('Logical Devices'))

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
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Alternative Capability Name'),
        field: 'alternative_capability_name',
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'capability.name'
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
