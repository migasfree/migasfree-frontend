<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :more-filters="moreFilters"
    >
      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else-if="props.column.field == 'score'">
          <q-rating
            v-model="props.row.score"
            icon="star_border"
            icon-selected="star"
            readonly
          />
        </span>

        <span v-else-if="props.column.field == 'category.name'">
          <MigasLink
            model="catalog/categories"
            :pk="props.row.category.id"
            :value="props.row.category.name"
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

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Applications List') })

    const routes = {
      add: 'app-add',
      detail: 'app-detail',
    }
    const model = 'catalog/apps'
    const moreFilters = ['project']

    const title = ref($gettext('Applications'))

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
        text: $gettext('Applications'),
        icon: modelIcon(model),
        to: 'apps-dashboard',
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
        label: $gettext('Score'),
        field: 'score',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'level.id',
        hidden: true,
      },
      {
        label: $gettext('Level'),
        field: 'level.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'category.id',
        hidden: true,
      },
      {
        label: $gettext('Category'),
        field: 'category.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const setFilterItems = (field, items) => {
      const col = columns.value.find((x) => x.field === field)
      if (col) col.filterOptions.filterDropdownItems = items
    }

    const loadFilters = async () => {
      try {
        const [levelsResponse, categoriesResponse] = await Promise.all([
          api.get('/api/v1/token/catalog/apps/levels'),
          api.get('/api/v1/token/catalog/categories'),
        ])

        setFilterItems(
          'level.name',
          Object.entries(levelsResponse.data).map(([key, val]) => ({
            value: key,
            text: val,
          })),
        )

        setFilterItems(
          'category.name',
          categoriesResponse.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )

        setFilterItems('score', ['1', '2', '3', '4', '5'])
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return {
      routes,
      model,
      moreFilters,
      title,
      breadcrumbs,
      columns,
    }
  },
}
</script>
