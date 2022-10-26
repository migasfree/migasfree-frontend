<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
      :add-routes="addRoutes"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'platform.name'">
          <MigasLink
            model="platforms"
            :pk="slotProps.props.row.platform.id"
            :value="slotProps.props.row.platform.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'name'">
          <MigasLink
            model="projects"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span
          v-else-if="slotProps.props.column.field == 'auto_register_computers'"
        >
          <BooleanView :value="slotProps.props.row.auto_register_computers" />
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
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Projects List') })

    const model = ref('projects')
    const detailRoute = ref('project-detail')
    const addRoutes = reactive([{ route: 'project-add' }])

    const title = ref($gettext('Projects'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Configuration'),
        icon: 'mdi-cogs',
      },
      {
        text: $gettext('Projects'),
        icon: modelIcon(model.value),
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
        field: 'platform.id',
        hidden: true,
      },
      {
        label: $gettext('Platform'),
        field: 'platform.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Package Management System'),
        field: 'pms',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Auto register computers'),
        field: 'auto_register_computers',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
          filterDropdownItems: [
            { value: true, text: $gettext('Yes') },
            { value: false, text: $gettext('No') },
          ],
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/platforms/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'platform.name'
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

    return { model, detailRoute, addRoutes, title, breadcrumbs, columns }
  },
}
</script>
