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

        <span v-else-if="slotProps.props.column.field == 'package.fullname'">
          <MigasLink
            model="packages"
            :pk="slotProps.props.row.package.id"
            :value="slotProps.props.row.package.fullname"
          />
        </span>

        <span
          v-else-if="slotProps.props.column.field == 'package.project.name'"
        >
          <MigasLink
            model="projects"
            :pk="slotProps.props.row.package.project.id"
            :value="slotProps.props.row.package.project.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'install_date'">
          <DateView :value="slotProps.props.row.install_date" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'uninstall_date'">
          <DateView :value="slotProps.props.row.uninstall_date" />
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

import { modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const { elementIcon } = useElement()

    useMeta({ title: $gettext('Packages History List') })

    const model = ref('packages-history')
    const moreFilters = [
      'installDateRange',
      'uninstallDateRange',
      'uninstallDate',
    ]

    const title = ref($gettext('Packages History'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: title.value,
        icon: modelIcon(model.value),
        to: 'packages-history-dashboard',
      },
      {
        text: $gettext('Results'),
      },
    ])

    const columns = reactive([
      {
        field: 'id',
        hidden: true,
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
        field: 'package.id',
        hidden: true,
      },
      {
        label: $gettext('Package'),
        field: 'package.fullname',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'package.project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'package.project.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Install Date'),
        field: 'install_date',
      },
      {
        label: $gettext('Uninstall Date'),
        field: 'uninstall_date',
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'package.project.name'
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
      moreFilters,
      elementIcon,
    }
  },
}
</script>
