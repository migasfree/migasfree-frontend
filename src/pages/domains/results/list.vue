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
      </template>

      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
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

    useMeta({ title: $gettext('Domains List') })

    const title = ref($gettext('Domains'))

    const routes = {
      add: 'domain-add',
      detail: 'domain-detail',
    }
    const model = 'domains'

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
        text: $gettext('Domains'),
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
    ])

    const postRemove = (id) => {
      authStore.deleteDomain(id)
    }

    return { title, breadcrumbs, columns, routes, model, modelIcon, postRemove }
  },
}
</script>
