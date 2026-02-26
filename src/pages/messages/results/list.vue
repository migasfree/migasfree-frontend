<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResults"
      :title="title"
      :columns="columns"
      :model="model"
      :more-filters="moreFilters"
    >
      <template #top>
        <q-btn
          :icon="appIcon('update')"
          class="q-my-md"
          :loading="loading"
          :disable="loading"
          :label="$gettext('Update')"
          @click="updateItems"
        />
      </template>

      <template #cell-user_name="{ props }">
        <MigasLink
          model="users"
          :pk="props.row.user.id"
          :value="props.row.user.name"
        />
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const tableResults = ref(null)

const model = 'messages'
const moreFilters = ['statusIn', 'createdAtRange']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Messages'),
  $gettext('Messages List'),
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
      field: 'user.id',
      hidden: true,
    },
    {
      label: $gettext('User'),
      field: 'user.name',
    },
    {
      label: $gettext('Message'),
      field: 'message',
    },
  ],
)

const loading = computed(() => {
  return tableResults.value !== null ? tableResults.value.isLoading : false
})

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const { data } = await api.get('/api/v1/token/projects/')

    setFilterItems(
      'project.name',
      data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const updateItems = async () => {
  await tableResults.value.loadItems()
}

onMounted(async () => {
  await loadFilters()
})
</script>
