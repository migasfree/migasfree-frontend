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
        />
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

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const configs = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/api/v1/token/mgi/config/')
    configs.value = data.results
  } catch {
    // Ignore error
  }
})

const getConfigValue = (configId) => {
  const conf = configs.value.find((c) => c.id === configId)
  if (!conf) return `#${configId}`
  const projectName =
    conf.project && typeof conf.project === 'object'
      ? conf.project.name
      : conf.project || ''
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
