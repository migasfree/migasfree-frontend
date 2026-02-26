<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >

      <template #cell-exclusive="{ props }">
        <BooleanView :value="props.row.exclusive" />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  add: 'policy-add',
  detail: 'policy-detail',
}
const model = 'catalog/policies'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Policies'),
  $gettext('Policies List'),
  [
    {
      text: $gettext('Catalog'),
      icon: appIcon('catalog'),
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
      label: $gettext('Exclusive'),
      field: 'exclusive',
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
      label: $gettext('Priority'),
      field: 'priority',
    },
  ],
)
</script>
