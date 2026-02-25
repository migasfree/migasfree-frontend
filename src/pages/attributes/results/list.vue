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
          :icon="elementIcon(props.row.property_att.prefix)"
          :value="attributeValue(props.row)"
          :tooltip="props.row.description"
        />
      </template>

      <template #cell-property_att="{ props }">
        <MigasLink
          model="formulas"
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
const { elementIcon, attributeValue } = useElement()
const uiStore = useUiStore()

const routes = {
  detail: 'attribute-detail',
}
const model = 'features'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Attributes'),
  $gettext('Attributes List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
    {
      label: $gettext('Attribute'),
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
      label: $gettext('Formula'),
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
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const response = await api.get('/api/v1/token/formulas/')

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
