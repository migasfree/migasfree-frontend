<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <!-- Custom rendering for Config parent link -->
      <template #cell-config="{ props }">
        <MigasLink
          v-if="props.row.config"
          model="mgi/config"
          :pk="props.row.config"
          :value="getConfigValue(props.row.config)"
          :tooltip="`${$gettext('Project')} (${$gettext('Template ID')})`"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'
import { useSmartRequest } from 'composables/smartRequest'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()
const { smartRequest } = useSmartRequest()

const configs = ref([])
const projects = ref([])

onMounted(async () => {
  try {
    const [configsRes, projectsRes] = await Promise.all([
      smartRequest('/api/v1/token/mgi/config/'),
      smartRequest('/api/v1/token/projects/'),
    ])
    configs.value = configsRes.data.results
    projects.value = projectsRes.data.results
  } catch {
    // Ignore error
  }
})

const getConfigValue = (configId) => {
  const conf = configs.value.find((c) => c.id === configId)
  if (!conf) return `#${configId}`
  const p = projects.value.find((pr) => pr.id === conf.project)
  const projectName = p ? p.name : ''
  return projectName ? `${projectName} (${conf.template_id})` : conf.template_id
}

const routes = {
  add: 'release-add',
  detail: 'release-detail',
}
const model = 'mgi/release'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Releases'),
  $gettext('Releases'),
  [
    {
      text: $gettext('Golden Images'),
      icon: appIcon('golden-images'),
    },
  ],
  [
    {
      label: $gettext('Name'),
      field: 'name',
      sortable: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Config'),
      field: 'config',
      sortable: true,
    },
    {
      label: $gettext('Created At'),
      field: 'created_at',
      sortable: true,
    },
    {
      label: $gettext('Description'),
      field: 'description',
      sortable: false,
    },
  ],
)
</script>
