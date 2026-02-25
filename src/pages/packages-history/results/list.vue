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

      <template #cell-package_fullname="{ props }">
        <MigasLink
          model="packages"
          :pk="props.row.package.id"
          :value="props.row.package.fullname"
        />
      </template>

      <template #cell-package_project_name="{ props }">
        <MigasLink
          model="projects"
          :pk="props.row.package.project.id"
          :value="props.row.package.project.name"
        />
      </template>

      <template #cell-install_date="{ props }">
        <DateView :value="props.row.install_date" />
      </template>

      <template #cell-uninstall_date="{ props }">
        <DateView :value="props.row.uninstall_date" />
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
const uiStore = useUiStore()
const { elementIcon } = useElement()

const model = 'packages-history'
const moreFilters = ['installDateRange', 'uninstallDateRange', 'uninstallDate']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Packages History'),
  $gettext('Packages History List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
    },
  ],
  [
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
      field: 'package.id',
      hidden: true,
    },
    {
      label: $gettext('Package'),
      field: 'package.fullname',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      field: 'package.project.id',
      hidden: true,
    },
    {
      label: $gettext('Project'),
      field: 'package.project.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Install Date'),
      field: 'install_date',
    },
    {
      label: $gettext('Uninstall Date'),
      field: 'uninstall_date',
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const response = await api.get('/api/v1/token/projects/')

    setFilterItems(
      'package.project.name',
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
