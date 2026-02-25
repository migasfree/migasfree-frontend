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
      <template #actions="{ props }">
        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('scopes')"
          color="secondary"
          @click="
            $router.push({
              name: 'scope-add',
              query: { domain: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Scope') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('deployments')"
          color="secondary"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { domain: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('user-profiles')"
          color="secondary"
          @click="
            $router.push({
              name: 'user-profile-add',
              query: { domains: props.row.id },
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
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'

import { appIcon } from 'composables/element'

const authStore = useAuthStore()
const { $gettext } = useGettext()

const routes = {
  add: 'domain-add',
  detail: 'domain-detail',
}
const model = 'domains'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Domains'),
  $gettext('Domains List'),
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

const postRemove = (id) => {
  authStore.deleteDomain(id)
}
</script>
