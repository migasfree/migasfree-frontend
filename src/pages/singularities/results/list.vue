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

        <span v-else-if="props.column.field == 'property_att'">
          <MigasLink
            model="formulas"
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
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

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

    useMeta({ title: $gettext('Singularities List') })

    const routes = {
      add: 'singularity-add',
      detail: 'singularity-detail',
    }
    const model = 'singularities'

    const title = ref($gettext('Singularities'))

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
        text: $gettext('Singularities'),
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
        label: $gettext('Formula'),
        field: 'property_att',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Priority'),
        field: 'priority',
        type: 'number',
        filterOptions: {
          enabled: true,
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/formulas/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'property_att',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            ({ id, name }) => ({
              value: id,
              text: name,
            }),
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
      routes,
      model,
    }
  },
}
</script>
