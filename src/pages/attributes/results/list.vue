<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :detail-route="detailRoute"
    >
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'value'">
          <MigasLink
            model="features"
            :pk="slotProps.props.row.id"
            :icon="elementIcon(slotProps.props.row.property_att.prefix)"
            :value="attributeValue(slotProps.props.row)"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'property_att'">
          <MigasLink
            model="formulas"
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

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon, attributeValue } = useElement()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Attributes List') })

    const model = 'features'
    const detailRoute = 'attribute-detail'

    const title = ref($gettext('Attributes'))

    const breadcrumbs = reactive([
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
        text: $gettext('Attributes'),
        icon: modelIcon(model),
        to: 'attributes-dashboard',
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
        label: $gettext('Attribute'),
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
        label: $gettext('Formula'),
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
        .get('/api/v1/token/formulas/')
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
      title,
      breadcrumbs,
      columns,
      model,
      detailRoute,
      elementIcon,
      attributeValue,
    }
  },
}
</script>
