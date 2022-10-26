<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
      :add-routes="addRoutes"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'value'">
          <MigasLink
            model="tags"
            :pk="slotProps.props.row.id"
            :value="attributeValue(slotProps.props.row)"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'property_att'">
          <MigasLink
            model="stamps"
            :pk="slotProps.props.row.property_att.id"
            :value="slotProps.props.row.property_att.name || ''"
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
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { modelIcon, useElement } from 'composables/element'

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

    const model = ref('tags')
    const detailRoute = ref('tag-detail')
    const addRoutes = reactive([{ route: 'tag-add' }])

    const title = ref($gettext('Tags'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: title.value,
        icon: modelIcon(model.value),
        to: 'tags-dashboard',
      },
      {
        text: $gettext('Results'),
        icon: 'mdi-table-large',
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
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/stamps/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'property_att'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    onMounted(async () => {
      await loadFilters()
    })

    return {
      model,
      detailRoute,
      addRoutes,
      title,
      breadcrumbs,
      columns,
      attributeValue,
    }
  },
}
</script>
