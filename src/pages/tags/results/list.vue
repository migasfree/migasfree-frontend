<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #cell-value="{ props }">
        <MigasLink
          :model="model"
          :pk="props.row.id"
          :value="attributeValue(props.row)"
          :tooltip="props.row.description"
        />
      </template>

      <template #cell-property_att="{ props }">
        <MigasLink
          model="stamps"
          :pk="props.row.property_att.id"
          :value="props.row.property_att.name || ''"
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

import { appIcon, useElement } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const { attributeValue } = useElement()
const uiStore = useUiStore()

const routes = {
  add: 'tag-add',
  detail: 'tag-detail',
}
const model = 'tags'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Tags'),
  $gettext('Tags List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
    {
      label: $gettext('Tag'),
      field: 'value',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Description'),
      field: 'description',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Stamp'),
      field: 'property_att',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Computers'),
      field: 'total_computers',
      type: 'number',
      sortable: false,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const response = await api.get('/api/v1/token/stamps/')

    setFilterItems(
      'property_att',
      response.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
