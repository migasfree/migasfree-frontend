<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResults"
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <!-- Custom rendering for ID link -->
      <template #cell-id="{ props }">
        <MigasLink
          model="mgi/build"
          :pk="props.row.id"
          :value="props.row.__str__"
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

      <!-- Custom rendering for Started At date -->
      <template #cell-started_at="{ props }">
        <DateView :value="props.row.started_at" />
      </template>

      <!-- Custom rendering for Finished At date -->
      <template #cell-finished_at="{ props }">
        <DateView :value="props.row.finished_at" />
      </template>

      <!-- Custom rendering for actions -->
      <template #actions="{ props }">
        <q-btn
          v-if="props.row.uri"
          flat
          round
          size="sm"
          color="secondary"
          :icon="appIcon('download')"
          type="a"
          :href="props.row.uri"
          target="_blank"
          class="q-mr-sm"
          @click.stop
        >
          <q-tooltip>{{ $gettext('Download Image') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          size="sm"
          color="primary"
          :icon="appIcon('doc')"
          class="q-mr-sm"
          @click.stop="downloadLogs(props.row.id)"
        >
          <q-tooltip>{{ $gettext('Download Logs') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-if="props.row.status === 'completed' && !props.row.published"
          flat
          round
          size="sm"
          color="positive"
          :icon="appIcon('publish')"
          class="q-mr-sm"
          @click.stop="togglePublish(props.row)"
        >
          <q-tooltip>{{ $gettext('Publish') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-if="props.row.status === 'completed' && props.row.published"
          flat
          round
          size="sm"
          color="negative"
          :icon="appIcon('unpublish')"
          class="q-mr-sm"
          @click.stop="togglePublish(props.row)"
        >
          <q-tooltip>{{ $gettext('Unpublish') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-if="isFinishedStatus(props.row.status)"
          flat
          round
          size="sm"
          color="negative"
          :icon="appIcon('delete')"
          @click.stop="confirmRemove(props.row.id)"
        >
          <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
        </q-btn>
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'
import { useListConfig } from 'composables/listConfig'
import { api } from 'boot/axios'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'
import { useUiStore } from 'stores/ui'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()
const uiStore = useUiStore()
const $q = useQuasar()

const tableResults = ref(null)

const isFinishedStatus = (status) => {
  if (!status) return false
  const s = status.toLowerCase()
  return ['completed', 'failed', 'cancelled', 'error'].includes(s)
}

const confirmRemove = (buildId) => {
  $q.dialog({
    message: $gettext('Are you sure you want to remove this item?'),
    ok: {
      color: 'negative',
      label: $gettext('Delete'),
      icon: appIcon('delete'),
    },
    cancel: {
      flat: true,
      label: $gettext('Cancel'),
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/api/v1/token/mgi/build/${buildId}/`)
      uiStore.notifySuccess($gettext('Item deleted!'))
      tableResults.value.loadItems()
    } catch (error) {
      uiStore.notifyError(error)
    }
  })
}

const togglePublish = (row) => {
  const isPublishing = !row.published
  const message = isPublishing
    ? $gettext('Are you sure you want to publish this build image?')
    : $gettext('Are you sure you want to unpublish this build image?')

  $q.dialog({
    message,
    ok: {
      color: isPublishing ? 'positive' : 'negative',
      label: isPublishing ? $gettext('Publish') : $gettext('Unpublish'),
    },
    cancel: {
      flat: true,
      label: $gettext('Cancel'),
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const url = `/api/v1/token/mgi/build/${row.id}/${isPublishing ? 'publish' : 'unpublish'}/`
      await api.post(url)
      uiStore.notifySuccess(
        isPublishing
          ? $gettext('Build published successfully!')
          : $gettext('Build unpublished successfully!'),
      )
      tableResults.value.loadItems()
    } catch (error) {
      uiStore.notifyError(error)
    }
  })
}

const downloadLogs = async (buildId) => {
  try {
    const { data } = await api.get(`/api/v1/token/mgi/build/${buildId}/`)
    if (!data.log) {
      uiStore.notifyWarning($gettext('No logs available for this build.'))
      return
    }
    const blob = new Blob([data.log], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `build_${buildId}_log.txt`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const routes = {
  detail: 'build-detail',
}
const model = 'mgi/build'

const getStatusColor = (status) => {
  if (!status) return 'grey-7'
  const s = status.toLowerCase()
  const colors = {
    queued: 'orange-7',
    running: 'blue-8',
    completed: 'green-8',
    failed: 'red-8',
    error: 'red-8',
  }
  return colors[s] || 'grey-7'
}

const getStatusIcon = (status) => {
  if (!status) return 'mdi-help-circle'
  const s = status.toLowerCase()
  const icons = {
    queued: 'mdi-clock-outline',
    running: 'mdi-sync',
    completed: 'mdi-check-circle-outline',
    failed: 'mdi-alert-circle-outline',
    error: 'mdi-alert-circle-outline',
  }
  return icons[s] || 'mdi-help-circle'
}

const getStatusLabel = (status) => {
  if (!status) return ''
  const s = status.toLowerCase()
  const labels = {
    queued: $gettext('Queued'),
    running: $gettext('Running'),
    completed: $gettext('Completed'),
    failed: $gettext('Failed'),
    error: $gettext('Failed'),
  }
  return labels[s] || status
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
      label: 'ID',
      field: 'id',
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
