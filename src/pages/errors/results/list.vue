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
      <template #cell-computer___str__="{ props }">
        <MigasLink
          model="computers"
          :pk="props.row.computer.id"
          :value="props.row.computer.__str__"
          :icon="elementIcon(props.row.computer.status)"
          :tooltip="props.row.computer.summary"
        />
      </template>

      <template #cell-project_name="{ props }">
        <MigasLink
          model="projects"
          :pk="props.row.project.id"
          :value="props.row.project.name || ''"
        />
      </template>

      <template #cell-created_at="{ props }">
        <DateView :value="props.row.created_at" />
      </template>

      <template #cell-synchronization_start_date="{ props }">
        <DateView
          v-if="props.row.synchronization"
          :value="props.row.synchronization.start_date"
        />
      </template>

      <template #cell-description="{ props }">
        <Truncate v-model="props.row.description" />
      </template>

      <template #cell-checked="{ props }">
        <BooleanView :value="props.row.checked" />
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
import Truncate from 'components/ui/Truncate'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'
import BooleanView from 'components/ui/BooleanView'

import { appIcon, useElement } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()
const { elementIcon } = useElement()

const routes = {
  detail: 'error-detail',
}
const model = 'errors'
const moreFilters = ['platform', 'statusIn', 'createdAtRange']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Errors'),
  $gettext('Errors List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
    {
      label: $gettext('Date'),
      field: 'created_at',
    },
    {
      label: $gettext('Synchronization'),
      field: 'synchronization.start_date',
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
  ],
)

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
</script>
