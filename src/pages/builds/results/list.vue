<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
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
          :value="getBuildLinkValue(props.row)"
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
          @click.stop="downloadLogs(props.row.id)"
        >
          <q-tooltip>{{ $gettext('Download Logs') }}</q-tooltip>
        </q-btn>
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
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

const configs = ref([])
const releases = ref([])
const flavours = ref([])
const projects = ref([])

onMounted(async () => {
  try {
    const [releasesResponse, flavoursResponse, configsResponse, projectsResponse] = await Promise.all([
      api.get('/api/v1/token/mgi/release/'),
      api.get('/api/v1/token/mgi/flavour/'),
      api.get('/api/v1/token/mgi/config/'),
      api.get('/api/v1/token/projects/'),
    ])
    releases.value = releasesResponse.data.results
    flavours.value = flavoursResponse.data.results
    configs.value = configsResponse.data.results
    projects.value = projectsResponse.data.results
  } catch {
    // Ignore error
  }
})

const getReleaseValue = (releaseId) => {
  const rel = releases.value.find((r) => r.id === releaseId)
  return rel ? rel.name : `#${releaseId}`
}

const getFlavourValue = (flavourId) => {
  const fla = flavours.value.find((f) => f.id === flavourId)
  return fla ? fla.name : `#${flavourId}`
}

const getProjectName = (releaseId) => {
  const rel = releases.value.find((r) => r.id === releaseId)
  if (!rel || !rel.config) return ''
  const conf = configs.value.find((c) => c.id === rel.config)
  if (!conf || !conf.project) return ''
  const p = projects.value.find((pr) => pr.id === conf.project)
  return p ? p.name : ''
}

const getBuildLinkValue = (row) => {
  const projectName = getProjectName(row.release)
  const releaseName = getReleaseValue(row.release)
  const flavourName = getFlavourValue(row.flavour)
  return `${projectName} ${releaseName} ${flavourName}`.trim().replace(/\s+/g, ' ')
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
