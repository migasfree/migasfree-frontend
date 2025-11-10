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

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name"
          />
        </span>

        <span v-else-if="props.column.field == 'store.name'">
          <MigasLink
            v-if="props.row.store.id > 0"
            model="stores"
            :pk="props.row.store.id"
            :value="props.row.store.name"
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
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Package Sets List') })

    const routes = {
      add: 'package-set-add',
      detail: 'package-set-detail',
    }
    const model = 'package-sets'

    const title = ref($gettext('Package Sets'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: $gettext('Package Sets'),
        icon: modelIcon(model),
        to: 'packages-list',
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
        field: 'project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'project.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'store.id',
        hidden: true,
      },
      {
        label: $gettext('Store'),
        field: 'store.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Description'),
        field: 'description',
      },
    ])

    const { setFilterItems } = useFilterHelper(columns)

    const loadFilters = async () => {
      try {
        const [projectsResponse, storesResponse] = await Promise.all([
          api.get('/api/v1/token/projects/'),
          api.get('/api/v1/token/stores/'),
        ])

        setFilterItems(
          'project.name',
          projectsResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )

        setFilterItems(
          'store.name',
          storesResponse.data.results.map((item) => ({
            value: item.id,
            text: `${item.name} (${item.project.name})`,
          })),
        )
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return { title, breadcrumbs, columns, routes, model }
  },
}
</script>
