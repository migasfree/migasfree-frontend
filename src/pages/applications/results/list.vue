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
            :model="model"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'score'">
          <q-rating
            v-model="slotProps.props.row.score"
            icon="star_border"
            icon-selected="star"
            readonly
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

    const model = 'catalog/apps'
    const detailRoute = 'app-detail'
    const addRoute = 'app-add'
    const moreFilters = ['project']

    const title = ref($gettext('Applications'))

    const breadcrumbs = reactive([
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
        label: $gettext('Score'),
        field: 'score',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
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
          placeholder: $gettext('Filter'),
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
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/catalog/apps/levels')
        .then((response) => {
          columns.find(
            (x) => x.field === 'level.name'
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data
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

      await api
        .get('/api/v1/token/catalog/categories')
        .then((response) => {
          columns.find(
            (x) => x.field === 'category.name'
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

      columns.find(
        (x) => x.field === 'score'
      ).filterOptions.filterDropdownItems = ['1', '2', '3', '4', '5']
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
