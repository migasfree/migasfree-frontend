<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :more-filters="moreFilters"
    >
      <template #fields="{ props }">
        <span v-if="props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="props.row.computer.id"
            :value="props.row.computer.__str__"
            :icon="elementIcon(props.row.computer.status)"
            :tooltip="props.row.computer.summary"
          />
        </span>

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
          />
        </span>

        <span v-else-if="props.column.field == 'created_at'">
          <DateView :value="props.row.created_at" />
        </span>

        <span v-else-if="props.column.field == 'description'">
          <Truncate v-model="props.row.description" />
        </span>

        <span v-else-if="props.column.field == 'checked'">
          <BooleanView :value="props.row.checked" />
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
import DateView from 'components/ui/DateView'
import Truncate from 'components/ui/Truncate'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    DateView,
    Truncate,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const { elementIcon } = useElement()

    useMeta({ title: $gettext('Errors List') })

    const routes = {
      detail: 'error-detail',
    }
    const model = 'errors'
    const moreFilters = ['platform', 'statusIn', 'createdAtRange']

    const title = ref($gettext('Errors'))

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
        to: 'errors-dashboard',
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
        label: $gettext('Date'),
        field: 'created_at',
      },
      {
        field: 'computer.id',
        hidden: true,
      },
      {
        field: 'computer.status',
        hidden: true,
      },
      {
        field: 'computer.summary',
        hidden: true,
      },
      {
        label: $gettext('Computer'),
        field: 'computer.__str__',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: 'project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'project.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Checked'),
        field: 'checked',
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
        label: $gettext('Description'),
        field: 'description',
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
        const response = await api.get('/api/v1/token/projects/')

        setFilterItems(
          'project.name',
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

    return {
      model,
      routes,
      moreFilters,
      title,
      breadcrumbs,
      columns,
      elementIcon,
    }
  },
}
</script>
