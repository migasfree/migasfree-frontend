<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
      :add-route="addRoute"
      @post-remove="postRemove"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            model="scopes"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'domain.name'">
          <MigasLink
            v-if="slotProps.props.row.domain"
            model="domains"
            :pk="slotProps.props.row.domain.id"
            :value="slotProps.props.row.domain.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'user.username'">
          <MigasLink
            model="user-profiles"
            :pk="slotProps.props.row.user.id"
            :value="slotProps.props.row.user.username"
          />
        </span>

        <span v-else>
          {{ slotProps.props.formattedRow[slotProps.props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue'
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

    const model = 'scopes'
    const detailRoute = 'scope-detail'
    const addRoute = 'scope-add'

    const breadcrumbs = reactive([
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

    const columns = reactive([
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
      columns.find((x) => x.field === 'user.username').hidden = false
    }

    return {
      title,
      breadcrumbs,
      columns,
      model,
      detailRoute,
      addRoute,
      postRemove,
    }
  },
}
</script>
