<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
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

      <template #cell-created_at="{ props }">
        <DateView :value="props.row.created_at" />
      </template>

      <template #cell-status="{ props }">
        <q-icon
          :name="elementIcon(props.row.status)"
          class="vertical-middle q-mr-xs"
          size="sm"
        />
        <span class="vertical-middle">{{
          computerStatus(props.row.status)
        }}</span>
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
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'

import { appIcon, useElement } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const { elementIcon, computerStatus } = useElement()
const uiStore = useUiStore()

const model = 'status-logs'
const moreFilters = ['statusIn', 'createdAtRange']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Status Logs'),
  $gettext('Status Logs List'),
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
      label: $gettext('Status'),
      field: 'status',
      html: true,
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
    const response = await api.get('/api/v1/token/computers/status/')

    setFilterItems(
      'status',
      Object.entries(response.data.choices).map(([key, val]) => {
        return { value: key, text: val }
      }),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>
