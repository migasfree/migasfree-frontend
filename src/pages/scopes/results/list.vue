<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      @post-remove="postRemove"
    >
      <template #cell-user_username="{ props }">
        <MigasLink
          model="user-profiles"
          :pk="props.row.user.id"
          :value="props.row.user.username"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'

const authStore = useAuthStore()
const { $gettext } = useGettext()

const routes = {
  add: 'scope-add',
  detail: 'scope-detail',
}
const model = 'scopes'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Scopes'),
  $gettext('Scopes List'),
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
      field: 'domain.id',
      hidden: true,
    },
    {
      label: $gettext('Domain'),
      field: 'domain.name',
      html: true,
    },
    {
      label: $gettext('User Profile'),
      field: 'user.username',
      hidden: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
  ],
)

const postRemove = (id) => {
  authStore.deleteScope(id)
}

onMounted(() => {
  if (authStore.user.is_superuser) {
    const userColumn = columns.value.find((x) => x.field === 'user.username')
    if (userColumn) {
      userColumn.hidden = false
    }
  }
})
</script>
