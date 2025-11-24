<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #actions="{ props }">
        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('deployments')"
          color="secondary"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { project: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('devices/drivers')"
          color="secondary"
          @click="
            $router.push({
              name: 'driver-add',
              query: { project: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Driver') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields="{ props }">
        <span v-if="props.column.field == 'platform.name'">
          <MigasLink
            model="platforms"
            :pk="props.row.platform.id"
            :value="props.row.platform.name"
          />
        </span>

        <span v-else-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else-if="props.column.field == 'auto_register_computers'">
          <BooleanView :value="props.row.auto_register_computers" />
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
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

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

    const routes = {
      add: 'project-add',
      detail: 'project-detail',
    }
    const model = 'projects'

    const title = ref($gettext('Projects'))

    const breadcrumbs = ref([
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
        text: $gettext('Projects'),
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

    const { setFilterItems } = useFilterHelper(columns)

    const loadFilters = async () => {
      try {
        const [platformsResponse, pmsResponse] = await Promise.all([
          api.get('/api/v1/token/platforms/'),
          api.get('/api/v1/public/pms/'),
        ])

        setFilterItems(
          'platform.name',
          platformsResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )

        setFilterItems(
          'pms',
          Object.keys(pmsResponse.data).map((key) => ({
            value: key,
            text: key,
          })),
        )
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return { model, routes, title, breadcrumbs, columns, modelIcon }
  },
}
</script>
