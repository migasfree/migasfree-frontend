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
      <template #cell-score="{ props }">
        <q-rating
          v-model="props.row.score"
          icon="star_border"
          icon-selected="star"
          readonly
        />
      </template>

      <template #cell-category_name="{ props }">
        <MigasLink
          model="catalog/categories"
          :pk="props.row.category.id"
          :value="props.row.category.name"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const routes = {
  add: 'app-add',
  detail: 'app-detail',
}
const model = 'catalog/apps'
const moreFilters = ['project']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Applications'),
  $gettext('Applications List'),
  [
    {
      text: $gettext('Release'),
      icon: appIcon('release'),
    },
  ],
  [
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
  ],
)

const { setFilterItems } = useFilterHelper(columns)

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
</script>
