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

      <template #fields="{ props }">
        <span v-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
          />
        </span>

        <span v-else-if="props.column.field == 'enabled'">
          <BooleanView :value="props.row.enabled" />
        </span>

        <span v-else-if="props.column.field == 'kind'">
          {{ kind[props.row.kind] }}
        </span>

        <span
          v-else-if="props.column.field == 'language' && languages.length > 0"
        >
          {{ languages[props.row.language].name }}
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </TableResults>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    MigasLink,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    useMeta({ title: $gettext('Formulas List') })

    const kind = ref({})
    const languages = ref([])

    const routes = {
      add: 'formula-add',
      detail: 'formula-detail',
    }
    const model = 'formulas'
    const columnParams = reactive({ columnFilters: { sort: 'client' } })

    const title = ref($gettext('Formulas'))

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
        text: $gettext('Formulas'),
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
    ])

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

    return {
      title,
      breadcrumbs,
      columns,
      routes,
      model,
      columnParams,
      kind,
      languages,
      modelIcon,
    }
  },
}
</script>
