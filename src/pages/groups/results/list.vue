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
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('user-profiles')"
          color="secondary"
          @click="
            $router.push({
              name: 'user-profile-add',
              query: { groups: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add User Profile') }}</q-tooltip></q-btn
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
  add: 'group-add',
  detail: 'group-detail',
}
const model = 'accounts/groups'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Groups'),
  $gettext('Groups List'),
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
  ],
)
</script>
