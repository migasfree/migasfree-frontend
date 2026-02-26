<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >

      <template #cell-description="{ props }">
        <Truncate
          v-if="props.row.description"
          v-model="props.row.description"
          :formatted="false"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import Truncate from 'components/ui/Truncate'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  add: 'attribute-set-add',
  detail: 'attribute-set-detail',
}
const model = 'attribute-sets'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Attribute Sets'),
  $gettext('Attribute Sets List'),
  [
    {
      text: $gettext('Configuration'),
      icon: appIcon('configuration'),
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
      label: $gettext('Description'),
      field: 'description',
    },
  ],
)
</script>
