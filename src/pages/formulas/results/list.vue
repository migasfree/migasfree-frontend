<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :column-params="columnParams"
    >
      <template #actions="{ props }">
        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('singularities')"
          color="secondary"
          @click="
            $router.push({
              name: 'singularity-add',
              query: { property_att: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Singularity') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-enabled="{ props }">
        <BooleanView :value="props.row.enabled" />
      </template>

      <template #cell-kind="{ props }">
        {{ kind[props.row.kind] }}
      </template>

      <template #cell-language="{ props }">
        {{ languages.find((l) => l.id === props.row.language)?.name }}
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const uiStore = useUiStore()
const { $gettext } = useGettext()

const kind = ref({})
const languages = ref([])

const routes = {
  add: 'formula-add',
  detail: 'formula-detail',
}
const model = 'formulas'
const columnParams = reactive({ columnFilters: { sort: 'client' } })

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Formulas'),
  $gettext('Formulas List'),
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
    {
      label: $gettext('Language'),
      field: 'language',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [kindResponse, languagesResponse] = await Promise.all([
      api.get('/api/v1/token/properties/kind/'),
      api.get('/api/v1/public/languages/'),
    ])

    kind.value = kindResponse.data

    setFilterItems(
      'kind',
      Object.entries(kindResponse.data).map(([key, val]) => ({
        value: key,
        text: val,
      })),
    )

    const entries = Object.entries(languagesResponse.data)

    entries.forEach(([key, val]) => {
      languages.value.push({
        id: parseInt(key),
        name: val,
      })
    })

    setFilterItems(
      'language',
      entries.map(([key, val]) => ({
        value: parseInt(key),
        text: val,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
