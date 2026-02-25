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
          :icon="modelIcon('tags')"
          color="secondary"
          @click="
            $router.push({
              name: 'tag-add',
              query: { property_att: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Tag') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-name="{ props }">
        <MigasLink :model="model" :pk="props.row.id" :value="props.row.name" />
      </template>

      <template #cell-enabled="{ props }">
        <BooleanView :value="props.row.enabled" />
      </template>

      <template #cell-kind="{ props }">
        {{ kind[props.row.kind] }}
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const routes = {
  add: 'stamp-add',
  detail: 'stamp-detail',
}
const model = 'stamps'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Stamps'),
  $gettext('Stamps List'),
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
      label: $gettext('Prefix'),
      field: 'prefix',
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
      label: $gettext('Kind'),
      field: 'kind',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
  ],
)

const kind = ref({})

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const response = await api.get('/api/v1/token/properties/kind/')

    kind.value = response.data

    setFilterItems(
      'kind',
      Object.entries(response.data).map(([key, val]) => {
        return {
          value: key,
          text: val,
        }
      }),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
