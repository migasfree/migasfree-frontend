<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'enabled'">
          <BooleanView :value="slotProps.props.row.enabled" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'kind'">
          {{ kind[slotProps.props.row.kind] }}
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

import { appIcon, modelIcon } from 'composables/element'

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

    useMeta({ title: $gettext('Stamps List') })

    const routes = {
      add: 'stamp-add',
      detail: 'stamp-detail',
    }
    const model = 'stamps'

    const title = ref($gettext('Stamps'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Configuration'),
        icon: appIcon('configuration'),
      },
      {
        text: $gettext('Stamps'),
        icon: modelIcon(model),
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
        label: $gettext('Prefix'),
        field: 'prefix',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Enabled'),
        field: 'enabled',
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
      {
        label: $gettext('Kind'),
        field: 'kind',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const kind = reactive({})

    const loadFilters = async () => {
      await api
        .get(`/api/v1/token/properties/kind`)
        .then((response) => {
          Object.assign(kind, response.data)
          columns.find(
            (x) => x.field === 'kind',
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data,
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

    return { breadcrumbs, title, model, routes, columns, kind }
  },
}
</script>
