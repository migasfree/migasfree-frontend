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
      <template #header-actions>
        <div class="row no-wrap items-center gap-md">
          <q-toggle
            v-model="isAutoRefreshActive"
            :icon="isAutoRefreshActive ? 'mdi-autorenew' : 'mdi-sync-off'"
            color="primary"
            class="text-weight-bold"
            :label="isAutoRefreshActive ? '' : $gettext('Auto-refresh')"
            @update:model-value="handleAutoRefreshChange"
          >
            <q-tooltip class="glass-tooltip">
              {{ $gettext('Automatically refresh list') }}
            </q-tooltip>
          </q-toggle>

          <q-badge
            v-if="isAutoRefreshActive"
            outline
            color="primary"
            class="q-pa-sm"
          >
            <q-icon name="mdi-timer-outline" class="q-mr-xs" />
            {{ interpolate($gettext('Refresh in %{n}s'), { n: countdown }) }}
          </q-badge>
        </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext, interpolate } = useGettext()
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
  if (tableResults.value) {
    await tableResults.value.loadItems()
  }
}

// Auto-refresh logic
const isAutoRefreshActive = ref(false)
const countdown = ref(10)
let refreshInterval = null

const startAutoRefresh = () => {
  if (refreshInterval) return
  countdown.value = 10
  refreshInterval = setInterval(async () => {
    countdown.value--
    if (countdown.value <= 0) {
      if (!loading.value) {
        await updateItems()
      }
      countdown.value = 10
    }
  }, 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const handleAutoRefreshChange = (value) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
    countdown.value = 10
  }
}

onMounted(async () => {
  await loadFilters()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>
