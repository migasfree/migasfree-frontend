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
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('events')"
          color="secondary"
          @click="
            $router.push({
              name: 'computer-events',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Events') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('simulate')"
          color="secondary"
          @click="
            $router.push({
              name: 'computer-simulate',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{
            $gettext('Simulate synchronization')
          }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          icon="mdi-card-account-details-outline"
          color="secondary"
          @click="
            $router.push({
              name: 'computer-label',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Identification') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-name="{ props }">
        <MigasLink
          :model="model"
          :pk="props.row.id"
          :icon="elementIcon(props.row.status)"
          :value="props.row.__str__ || ''"
          :tooltip="props.row.summary"
        />
      </template>

      <template #cell-project_name="{ props }">
        <MigasLink
          model="projects"
          :pk="props.row.project.id"
          :value="props.row.project.name || ''"
        />
      </template>

      <template #cell-sync_user_name="{ props }">
        <MigasLink
          v-if="props.row.sync_user"
          model="users"
          :pk="props.row.sync_user.id"
          :value="props.row.sync_user.__str__ || ''"
        />
      </template>

      <template #cell-product="{ props }">
        <q-btn
          no-caps
          dense
          color="secondary"
          :icon="productIcon(props.row.product_system)"
          :label="props.row.product || ''"
          @click="
            $router.push({
              name: 'computer-hardware',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip
            >{{ props.row.product_system }} ({{
              $gettext('Hardware Information')
            }})</q-tooltip
          ></q-btn
        >
      </template>

      <template #cell-sync_end_date="{ props }">
        <DateView :value="props.row.sync_end_date" />
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
const { elementIcon, productIcon } = useElement()
const uiStore = useUiStore()

const routes = {
  detail: 'computer-detail',
}
const model = 'computers'
const moreFilters = [
  'platform',
  'architecture',
  'serial',
  'mac',
  'uuid',
  'softwareInventory',
  'statusIn',
  'machine',
  'createdAtRange',
  'syncEndDateRange',
  'syncEndDate',
]

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Computers'),
  $gettext('Computers List'),
  [
    {
      text: $gettext('Data'),
      icon: appIcon('data'),
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
      field: '__str__',
      hidden: true,
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
      field: 'sync_user.id',
      hidden: true,
    },
    {
      label: $gettext('User'),
      field: 'sync_user.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Sync end Date'),
      field: 'sync_end_date',
    },
    {
      field: 'product_system',
      hidden: true,
    },
    {
      label: $gettext('Product'),
      field: 'product',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      field: 'summary',
      hidden: true,
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
