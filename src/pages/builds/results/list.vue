<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <!-- Custom rendering for Release parent link -->
      <template #cell-release="{ props }">
        <MigasLink
          v-if="props.row.release"
          model="mgi/release"
          :pk="props.row.release"
          :value="`${$gettext('Release')} #${props.row.release}`"
        />
      </template>

      <!-- Custom rendering for Flavour link -->
      <template #cell-flavour="{ props }">
        <MigasLink
          v-if="props.row.flavour"
          model="mgi/flavour"
          :pk="props.row.flavour"
          :value="`${$gettext('Flavour')} #${props.row.flavour}`"
        />
      </template>

      <!-- Custom rendering for Status badge -->
      <template #cell-status="{ props }">
        <q-chip
          :color="getStatusColor(props.row.status)"
          text-color="white"
          :icon="getStatusIcon(props.row.status)"
          class="text-weight-bold text-uppercase text-caption q-px-sm"
        >
          {{ getStatusLabel(props.row.status) }}
        </q-chip>
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  detail: 'build-detail',
}
const model = 'mgi/build'

const getStatusColor = (status) => {
  const colors = {
    queued: 'orange-7',
    running: 'blue-8',
    completed: 'green-8',
    failed: 'red-8',
  }
  return colors[status] || 'grey-7'
}

const getStatusIcon = (status) => {
  const icons = {
    queued: 'mdi-clock-outline',
    running: 'mdi-sync',
    completed: 'mdi-check-circle-outline',
    failed: 'mdi-alert-circle-outline',
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    queued: $gettext('Queued'),
    running: $gettext('Running'),
    completed: $gettext('Completed'),
    failed: $gettext('Failed'),
  }
  return labels[status] || status
}

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Builds'),
  $gettext('MGI Builds'),
  [
    {
      text: $gettext('Golden Images'),
      icon: appIcon('golden-images'),
    },
  ],
  [
    {
      label: $gettext('Release'),
      field: 'release',
      sortable: true,
    },
    {
      label: $gettext('Flavour'),
      field: 'flavour',
      sortable: true,
    },
    {
      label: $gettext('Status'),
      field: 'status',
      sortable: true,
    },
    {
      label: $gettext('Started At'),
      field: 'started_at',
      sortable: true,
    },
    {
      label: $gettext('Finished At'),
      field: 'finished_at',
      sortable: true,
    },
  ],
)
</script>
