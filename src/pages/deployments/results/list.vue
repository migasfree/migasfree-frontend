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
      <template #fields="slotProps">
        <span v-if="slotProps.props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="slotProps.props.row.id"
            :value="slotProps.props.row.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="slotProps.props.row.project.id"
            :value="slotProps.props.row.project.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'domain.name'">
          <MigasLink
            v-if="slotProps.props.row.domain"
            model="domains"
            :pk="slotProps.props.row.domain.id"
            :value="slotProps.props.row.domain.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'schedule.name'">
          <MigasLink
            v-if="slotProps.props.row.schedule"
            model="schedules"
            :pk="slotProps.props.row.schedule.id"
            :value="slotProps.props.row.schedule.name"
          />
        </span>

        <span v-else-if="slotProps.props.column.field == 'enabled'">
          <BooleanView :value="slotProps.props.row.enabled" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'start_date'">
          <DateView :value="slotProps.props.row.start_date" />
        </span>

        <span v-else-if="slotProps.props.column.field == 'source'">
          {{ resolveSource(slotProps.props.row.source) }}
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
import BooleanView from 'components/ui/BooleanView'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    BooleanView,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Deployments List') })

    const routes = {
      add: 'deployment-add',
      detail: 'deployment-detail',
    }
    const model = 'deployments'
    const moreFilters = ['schedule']

    const title = ref($gettext('Deployments'))

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: $gettext('Deployments'),
        icon: modelIcon(model),
        to: 'deployments-dashboard',
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
        field: 'project.id',
        hidden: true,
      },
      {
        label: $gettext('Project'),
        field: 'project.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: 'domain.id',
        hidden: true,
      },
      {
        label: $gettext('Domain'),
        field: 'domain.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        label: $gettext('Source'),
        field: 'source',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
          filterDropdownItems: [
            { value: 'I', text: $gettext('Internal') },
            { value: 'E', text: $gettext('External') },
          ],
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
        label: $gettext('Start Date'),
        field: 'start_date',
      },
      {
        field: 'schedule.id',
        hidden: true,
      },
      {
        label: $gettext('Schedule'),
        field: 'schedule.name',
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'project.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            },
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/domains/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'domain.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            },
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/schedules/')
        .then((response) => {
          columns.find(
            (x) => x.field === 'schedule.name',
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            },
          )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const resolveSource = (value) => {
      switch (value) {
        case 'I':
          return $gettext('Internal')
        case 'E':
          return $gettext('External')
        default:
          return ''
      }
    }

    onMounted(async () => {
      await loadFilters()
    })

    return {
      routes,
      model,
      moreFilters,
      title,
      breadcrumbs,
      columns,
      resolveSource,
    }
  },
}
</script>
