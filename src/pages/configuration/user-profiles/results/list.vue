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
          :icon="appIcon('password')"
          color="primary"
          @click="
            $router.push({
              name: 'user-profile-change-password',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Change Password') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="isSuperUser"
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('scopes')"
          color="secondary"
          @click="
            $router.push({
              name: 'scope-add',
              query: { user: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Scope') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-username="{ props }">
        <MigasLink
          :model="model"
          :pk="props.row.id"
          :value="props.row.username"
        />
      </template>

      <template #cell-domain_preference_name="{ props }">
        <MigasLink
          v-if="props.row.domain_preference"
          model="domains"
          :pk="props.row.domain_preference.id"
          :value="props.row.domain_preference.name"
        />
      </template>

      <template #cell-is_active="{ props }">
        <BooleanView :value="props.row.is_active" />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()
const authStore = useAuthStore()

const isSuperUser = computed(() => authStore.user.is_superuser)

const routes = {
  add: 'user-profile-add',
  detail: 'user-profile-detail',
}
const model = 'user-profiles'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('User Profiles'),
  $gettext('User Profiles List'),
  [
    {
      text: $gettext('Configuration'),
      icon: appIcon('configuration'),
    },
  ],
  [
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
  ],
)
</script>
