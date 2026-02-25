<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #cell-created_at="{ props }">
        <DateView :value="props.row.created_at" />
      </template>

      <template #cell-checked="{ props }">
        <BooleanView :value="props.row.checked" />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import DateView from 'components/ui/DateView'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const model = 'notifications'
const moreFilters = ['createdAtRange']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Notifications'),
  $gettext('Notifications List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
    {
      label: $gettext('Date'),
      field: 'created_at',
    },
    {
      label: $gettext('Checked'),
      field: 'checked',
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
      label: $gettext('Message'),
      field: 'message',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
  ],
)
</script>
