<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="slotProps.props.row.computer.id"
            :value="slotProps.props.row.computer.__str__"
            :icon="elementIcon(slotProps.props.row.computer.status)"
            :tooltip="slotProps.props.row.computer.summary"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'created_at'">
          <DateView :value="slotProps.props.row.created_at" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'status'">
          <q-icon
            :name="elementIcon(slotProps.props.row.status)"
            class="vertical-middle q-mr-xs"
            size="sm"
          />
          <span class="vertical-middle">{{
            computerStatus(slotProps.props.row.status)
          }}</span>
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
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon, computerStatus } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Status Logs List') })

    const model = 'status-logs'
    const moreFilters = ['statusIn', 'createdAtRange']

    const title = ref($gettext('Status Logs'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: title.value,
        icon: modelIcon(model),
        to: 'status-logs-dashboard',
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
        label: $gettext('Date'),
        field: 'created_at',
      },
      {
        field: 'computer.id',
        hidden: true,
      },
      {
        field: 'computer.status',
        hidden: true,
      },
      {
        field: 'computer.summary',
        hidden: true,
      },
      {
        label: $gettext('Computer'),
        field: 'computer.__str__',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Status'),
        field: 'status',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/computers/status/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'status',
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data.choices,
          ).map(([key, val]) => {
            return {
              value: key,
              text: val,
            }
          })
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
      moreFilters,
      title,
      breadcrumbs,
      columns,
      elementIcon,
      computerStatus,
    }
  },
}
</script>
