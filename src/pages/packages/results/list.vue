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
          v-if="props.row.store.id"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('information')"
          color="secondary"
          @click="
            $router.push({
              name: 'package-information',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Package Information') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="props.row.url"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('download')"
          color="secondary"
          type="a"
          :href="`${server}${props.row.url}`"
          ><q-tooltip>{{ $gettext('Download') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-fullname="{ props }">
        <MigasLink
          :model="model"
          :pk="props.row.id"
          :value="props.row.fullname"
        />
      </template>

      <template #cell-project_name="{ props }">
        <MigasLink
          model="projects"
          :pk="props.row.project.id"
          :value="props.row.project.name"
        />
      </template>

      <template #cell-store_name="{ props }">
        <MigasLink
          v-if="props.row.store.id > 0"
          model="stores"
          :pk="props.row.store.id"
          :value="props.row.store.name"
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
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const uiStore = useUiStore()
const { $gettext } = useGettext()

const routes = {
  add: 'package-add',
  detail: 'package-detail',
}
const model = 'packages'
const moreFilters = ['platform']
const server = uiStore.server

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Packages'),
  $gettext('Packages List'),
  [
    {
      text: $gettext('Release'),
      icon: appIcon('release'),
    },
  ],
  [
    {
      label: $gettext('Package'),
      field: 'fullname',
      html: true,
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
      field: 'store.id',
      hidden: true,
    },
    {
      label: $gettext('Store'),
      field: 'store.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      field: 'url',
      hidden: true,
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [projectsResponse, storesResponse] = await Promise.all([
      api.get('/api/v1/token/projects/'),
      api.get('/api/v1/token/stores/'),
    ])

    setFilterItems(
      'project.name',
      projectsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'store.name',
      storesResponse.data.results.map((item) => ({
        value: item.id,
        text: `${item.name} (${item.project.name})`,
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
