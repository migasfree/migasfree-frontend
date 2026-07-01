<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResultsRef"
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
      :more-filters="moreFilters"
    >
      <template #header-actions>
        <q-btn
          class="q-ma-xs"
          color="secondary"
          :icon="appIcon('copy')"
          @click="openCopyModal"
        >
          <q-tooltip>{{ $gettext('Copy Package Sets') }}</q-tooltip>
        </q-btn>
      </template>
    </TableResults>

    <!-- Copy Package Sets Dialog -->
    <CopyProjectDialog
      v-model="showCopyModal"
      :icon="modelIcon('package-sets')"
      :title="$gettext('Copy Package Sets to Project')"
      :items-label="$gettext('Package Sets to Copy')"
      :get-items="getPackageSetsToCopy"
      :copy-item="copyPackageSet"
      :parse-item-result="parsePackageSetResult"
      @copied="onPackageSetsCopied"
    >
      <template #item-extra="{ item }">
        <span v-if="item.store" class="text-caption text-grey-6 q-ml-sm">
          ({{ item.store }})
        </span>
      </template>
    </CopyProjectDialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { useSmartRequest } from 'composables/smartRequest'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import CopyProjectDialog from 'components/ui/CopyProjectDialog'

import { appIcon, modelIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'
import { useCopyPackageSets } from 'composables/copyPackageSets'

const uiStore = useUiStore()
const { $gettext } = useGettext()
const { smartRequest } = useSmartRequest()

const tableResultsRef = ref(null)
const { showCopyModal, openCopyModal, getPackageSetsToCopy, copyPackageSet } =
  useCopyPackageSets()

const parsePackageSetResult = (result) => {
  if (result && result.created === false) {
    return {
      success: false,
      skipped: true,
      skippedName: result.skipped_name || '',
    }
  }
  return { success: true, skipped: false, skippedName: null }
}

const onPackageSetsCopied = () => {
  tableResultsRef.value?.loadItems()
}

const routes = {
  add: 'package-set-add',
  detail: 'package-set-detail',
}
const model = 'package-sets'
const moreFilters = ['platform']

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Package Sets'),
  $gettext('Package Sets List'),
  [
    {
      text: $gettext('Release'),
      icon: appIcon('release'),
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
      label: $gettext('Description'),
      field: 'description',
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [projectsResponse, storesResponse] = await Promise.all([
      smartRequest('/api/v1/token/projects/'),
      smartRequest('/api/v1/token/stores/'),
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
