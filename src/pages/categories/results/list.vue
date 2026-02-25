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
          v-if="model === 'catalog/categories'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('catalog/apps')"
          color="secondary"
          @click="
            $router.push({
              name: 'app-add',
              query: { category: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Application') }}</q-tooltip></q-btn
        >
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  add: 'category-add',
  detail: 'category-detail',
}
const model = 'catalog/categories'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Application Categories'),
  $gettext('Application Categories List'),
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
  ],
)
</script>
