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
        <span v-if="props.column.field == 'value'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="attributeValue(props.row)"
            :tooltip="props.row.description"
          />
        </span>

        <span v-else-if="props.column.field == 'property_att'">
          <MigasLink
            model="stamps"
            :pk="props.row.property_att.id"
            :value="props.row.property_att.name || ''"
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
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { attributeValue } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Tags List') })

    const routes = {
      add: 'tag-add',
      detail: 'tag-detail',
    }
    const model = 'tags'

    const title = ref($gettext('Tags'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: title.value,
        icon: modelIcon(model),
        to: 'tags-dashboard',
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
        label: $gettext('Tag'),
        field: 'value',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Description'),
        field: 'description',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Stamp'),
        field: 'property_att',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Computers'),
        field: 'total_computers',
        type: 'number',
        sortable: false,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
    ])

    const { setFilterItems } = useFilterHelper(columns)

    const loadFilters = async () => {
      try {
        const response = await api.get('/api/v1/token/stamps/')

        setFilterItems(
          'property_att',
          response.data.results.map(({ id, name }) => ({
            value: id,
            text: name,
          })),
        )
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return { routes, model, title, breadcrumbs, columns, attributeValue }
  },
}
</script>
