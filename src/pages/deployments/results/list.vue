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
      <template #actions="{ props }">
        <q-btn
          v-if="props.row.source === 'I'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('regenerate')"
          color="primary"
          @click="regenerateMetadata(props.row.id)"
          ><q-tooltip>{{ $gettext('Regenerate Metadata') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-start_date="{ props }">
        <DateView :value="props.row.start_date" />
        <q-icon v-if="props.row.auto_restart" name="mdi-repeat" size="sm">
          <q-tooltip>{{ $gettext('Auto Restart') }}</q-tooltip>
        </q-icon>
      </template>

      <template #cell-source="{ props }">
        {{ resolveSource(props.row.source) }}
        <q-icon
          v-if="props.row.source === 'E' && props.row.frozen"
          name="mdi-fridge"
          size="sm"
          ><q-tooltip>{{ $gettext('Frozen') }}</q-tooltip></q-icon
        >
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import DateView from 'components/ui/DateView'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const routes = {
  add: 'deployment-add',
  detail: 'deployment-detail',
}
const model = 'deployments'
const moreFilters = ['platform', 'schedule']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Deployments'),
  $gettext('Deployments List'),
  [
    {
      text: $gettext('Release'),
      icon: appIcon('release'),
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
      field: 'domain.id',
      hidden: true,
    },
    {
      label: $gettext('Domain'),
      field: 'domain.name',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
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
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [projectsResponse, domainsResponse, schedulesResponse] =
      await Promise.all([
        api.get('/api/v1/token/projects/'),
        api.get('/api/v1/token/domains/'),
        api.get('/api/v1/token/schedules/'),
      ])

    setFilterItems(
      'project.name',
      projectsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'domain.name',
      domainsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'schedule.name',
      schedulesResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const resolveSource = (value) =>
  ({
    I: $gettext('Internal'),
    E: $gettext('External'),
  })[value] ?? ''

const regenerateMetadata = async (id) => {
  try {
    const { data } = await api.get(
      `/api/v1/token/${model}/internal-sources/${id}/metadata/`,
    )
    uiStore.notifySuccess(data.detail)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
