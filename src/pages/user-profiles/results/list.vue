<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #fields="{ props }">
        <span v-if="props.column.field == 'username'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.username"
          />
        </span>

        <span v-else-if="props.column.field == 'domain_preference'">
          <MigasLink
            model="domains"
            :pk="props.row.domain_preference.id"
            :value="props.row.domain_preference.name"
          />
        </span>

        <span v-else-if="props.column.field == 'is_active'">
          <BooleanView :value="props.row.is_active" />
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

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
    BooleanView,
  },
  setup() {
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('User Profiles List') })

    const routes = {
      add: 'user-profile-add',
      detail: 'user-profile-detail',
    }
    const model = 'user-profiles'

    const title = ref($gettext('User Profiles'))

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
        text: $gettext('User Profiles'),
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
        label: $gettext('Username'),
        field: 'username',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('First Name'),
        field: 'first_name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Last Name'),
        field: 'last_name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Enabled'),
        field: 'is_active',
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
        field: 'domain_preference.id',
        hidden: true,
      },
      {
        label: $gettext('Domain Preference'),
        field: 'domain_preference.name',
      },
    ])

    return { title, breadcrumbs, columns, routes, model }
  },
}
</script>
