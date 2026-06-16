<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #cell-user_name="{ props }">
        <MigasLink
          model="users"
          :pk="props.row.user.id"
          :value="props.row.user.__str__"
        />
      </template>

      <template #cell-created_at="{ props }">
        <DateView :value="props.row.created_at" />
        <DateDiff
          v-if="props.row.created_at && props.row.start_date"
          class="float-right"
          :begin="new Date(props.row.start_date)"
          :end="new Date(props.row.created_at)"
          :tooltip="$gettext('Duration')"
        />
      </template>

      <template #cell-start_date="{ props }">
        <DateView :value="props.row.start_date" />
      </template>

      <template #cell-pms_status_ok="{ props }">
        <BooleanView
          :value="props.row.pms_status_ok"
          :label="
            props.row.pms_status_ok ? $gettext('Ok') : $gettext('Incorrect')
          "
        />
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
import DateDiff from 'components/DateDiff'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const model = 'syncs'
const moreFilters = ['platform', 'createdAtRange', 'startDateRange']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Syncs'),
  $gettext('Syncs List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
    {
      label: $gettext('Start Date'),
      field: 'start_date',
    },
    {
      label: $gettext('End Date'),
      field: 'created_at',
    },
    {
      field: 'user.id',
      hidden: true,
    },
    {
      label: $gettext('User'),
      field: 'user.name',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
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
      label: $gettext('PMS Status Ok'),
      field: 'pms_status_ok',
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
      label: $gettext('Consumer'),
      field: 'consumer',
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
