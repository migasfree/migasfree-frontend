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
      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else-if="props.column.field == 'domain.name'">
          <MigasLink
            v-if="props.row.domain"
            model="domains"
            :pk="props.row.domain.id"
            :value="props.row.domain.name"
          />
        </span>

        <span v-else-if="props.column.field == 'user.username'">
          <MigasLink
            model="user-profiles"
            :pk="props.row.user.id"
            :value="props.row.user.username"
          />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const authStore = useAuthStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Scopes List') })

    const title = ref($gettext('Scopes'))

    const routes = {
      add: 'scope-add',
      detail: 'scope-detail',
    }
    const model = 'scopes'

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Configuration'),
        icon: appIcon('configuration'),
      },
      {
        text: title.value,
        icon: modelIcon(model),
      },
      {
        text: $gettext('Results'),
        icon: appIcon('results'),
      },
    ])

    const columns = ref([
      {
        field: 'id',
        hidden: true,
      },
      {
        label: $gettext('Actions'),
        field: 'actions',
        html: true,
        sortable: false,
        globalSearchDisabled: true,
      },
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
    ])

    const postRemove = (id) => {
      authStore.deleteScope(id)
    }

    // created
    if (authStore.user.is_superuser) {
      columns.value.find((x) => x.field === 'user.username').hidden = false
    }

    return { title, breadcrumbs, columns, routes, model, postRemove }
  },
}
</script>
