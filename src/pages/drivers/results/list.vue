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
          {{ props.row.name.split('/').reverse()[0] }}
        </span>

        <span v-else-if="props.column.field == 'model.name'">
          <MigasLink
            model="devices/models"
            :pk="props.row.model.id"
            :value="props.row.model.name"
          />
        </span>

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name"
          />
        </span>

        <span v-else-if="props.column.field == 'capability.name'">
          <MigasLink
            model="devices/capabilities"
            :pk="props.row.capability.id"
            :value="props.row.capability.name"
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

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    TableResults,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Drivers List') })

    const routes = {
      add: 'driver-add',
      detail: 'driver-detail',
    }
    const model = 'devices/drivers'

    const title = ref($gettext('Drivers'))

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: title.value,
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
        label: $gettext('Driver'),
        field: 'name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('Filter'),
          trigger: 'enter',
        },
      },
      {
        field: 'model.id',
        hidden: true,
      },
      {
        label: $gettext('Model'),
        field: 'model.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
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
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
      {
        field: 'capability.id',
        hidden: true,
      },
      {
        label: $gettext('Capability'),
        field: 'capability.name',
        html: true,
        filterOptions: {
          enabled: true,
          placeholder: $gettext('All'),
          trigger: 'enter',
        },
      },
    ])

    const loadFilters = async () => {
      await api
        .get('/api/v1/token/devices/models/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'model.name',
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

      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'project.name',
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

      await api
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          columns.value.find(
            (x) => x.field === 'capability.name',
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

    return { routes, model, title, breadcrumbs, columns }
  },
}
</script>
