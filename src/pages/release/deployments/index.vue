<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :icon="titleIcon"
      :add-route="addRoute"
      :has-export-button="false"
    >
      <template #actions>
        <q-btn color="secondary" :icon="appIcon('copy')" @click="openCopyModal">
          <q-tooltip>{{ $gettext('Copy Deployments') }}</q-tooltip>
        </q-btn>
      </template>
    </Header>

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-col-gutter-md q-pb-md">
      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Enabled Deployments')"
          end-point="/api/v1/token/stats/deployments/enabled/project/"
          :url="enabledUrl"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Enabled')"
          end-point="/api/v1/token/stats/deployments/enabled/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Schedule')"
          end-point="/api/v1/token/stats/deployments/schedule/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>

    <!-- Copy Deployments Dialog -->
    <CopyProjectDialog
      v-model="showCopyModal"
      :icon="titleIcon"
      :title="$gettext('Copy Deployments to Project')"
      :items-label="$gettext('Deployments to Copy')"
      :get-items="getDeploymentsToCopy"
      :copy-item="copyDeployment"
      :parse-item-result="parseDeploymentResult"
      @copied="onDeploymentsCopied"
    >
      <template #item-extra="{ item }">
        <q-badge
          v-if="item.enabled"
          color="green-1"
          text-color="green-8"
          class="q-ml-sm text-weight-bold"
          label="enabled"
        />
        <q-badge
          v-else
          color="red-1"
          text-color="red-8"
          class="q-ml-sm text-weight-bold"
          label="disabled"
        />
      </template>
    </CopyProjectDialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'
import _merge from 'lodash/merge'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'
import CopyProjectDialog from 'components/ui/CopyProjectDialog'

import { appIcon, modelIcon } from 'composables/element'
import { useCopyDeployments } from 'composables/copyDeployments'

const router = useRouter()
const { $gettext } = useGettext()

const titleIcon = modelIcon('deployments')
const title = $gettext('Deployments')
useMeta({ title })

const { showCopyModal, openCopyModal, getDeploymentsToCopy, copyDeployment } =
  useCopyDeployments()

const parseDeploymentResult = (result) => {
  if (result && result.created === false) {
    return {
      success: false,
      skipped: true,
      skippedName: result.skipped_name || '',
    }
  }
  return { success: true, skipped: false, skippedName: null }
}

const onDeploymentsCopied = () => {
  // Stats auto-refresh on next poll; no manual reload needed for pie charts
}

const searchText = ref('')
const addRoute = 'deployment-add'

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Release'),
    icon: appIcon('release'),
  },
  {
    text: title,
    icon: titleIcon,
  },
])

const url = { name: 'deployments-list' }

const enabledUrl = computed(() => {
  return Object.assign({}, url, {
    query: { enabled: true },
  })
})

const goTo = (params) => {
  let query = params.url.query || {}

  if (params.data.project_id) {
    query = _merge(query, { project_id: params.data.project_id })
  }

  if ('schedule' in params.data) {
    query = _merge(query, { schedule: params.data.schedule })
  }

  if (params.data.enabled) {
    query = _merge(query, { enabled: params.data.enabled })
  }

  router.push({
    name: url.name,
    query,
  })
}

const search = (value) => {
  router.push(Object.assign(url, { query: { search: value } }))
}
</script>
