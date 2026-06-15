<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <!-- Performance Metrics Cards -->
    <div v-if="metrics" class="row q-col-gutter-md q-pb-md">
      <div class="col-12 col-sm-4">
        <q-card flat bordered class="q-pa-md text-center bg-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-8">
              {{ $gettext('Completed Builds') }}
            </div>
            <div class="text-h4 text-weight-bold text-primary">
              {{ metrics.total_completed }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered class="q-pa-md text-center bg-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-8">
              {{ $gettext('Average Duration') }}
            </div>
            <div class="text-h4 text-weight-bold text-secondary">
              {{ formatDuration(metrics.avg_duration) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card flat bordered class="q-pa-md text-center bg-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-8">
              {{ $gettext('Average Image Size') }}
            </div>
            <div class="text-h4 text-weight-bold text-accent">
              {{ formatSize(metrics.avg_size) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Metrics By Build Type Table -->
    <div
      v-if="metrics && metrics.by_build_type && metrics.by_build_type.length"
      class="row q-pb-md"
    >
      <div class="col-12">
        <q-card flat bordered class="bg-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              {{ $gettext('Metrics by Build Type') }}
            </div>
            <q-markup-table flat bordered dense>
              <thead>
                <tr>
                  <th class="text-left">{{ $gettext('Build Type') }}</th>
                  <th class="text-right">{{ $gettext('Completed') }}</th>
                  <th class="text-right">{{ $gettext('Avg Duration') }}</th>
                  <th class="text-right">{{ $gettext('Avg Size') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in metrics.by_build_type"
                  :key="item.build_type"
                >
                  <td class="text-left text-weight-medium">{{ item.name }}</td>
                  <td class="text-right">{{ item.completed_count }}</td>
                  <td class="text-right">
                    {{ formatDuration(item.avg_duration) }}
                  </td>
                  <td class="text-right">{{ formatSize(item.avg_size) }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-pb-md">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('MGI Builds / Month')"
          end-point="/api/v1/token/stats/mgi/builds/month/"
          month-selector
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <PieChart
          :title="$gettext('MGI Builds / Status')"
          end-point="/api/v1/token/stats/mgi/build-status/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'
import _merge from 'lodash/merge'

import { api } from 'boot/axios'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'

import { appIcon, modelIcon } from 'composables/element'

const router = useRouter()
const { $gettext } = useGettext()

const titleIcon = modelIcon('mgi/build')
const title = $gettext('Builds')
useMeta({ title })

const searchText = ref('')
const metrics = ref(null)

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Golden Images'),
    icon: appIcon('golden-images'),
  },
  {
    text: title,
    icon: titleIcon,
  },
])

const url = { name: 'builds-list' }

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  if (!seconds) return '0s'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.round(seconds % 60)
  let result = ''
  if (hrs > 0) result += `${hrs}h `
  if (mins > 0) result += `${mins}m `
  if (secs > 0 || result === '') result += `${secs}s`
  return result.trim()
}

onMounted(async () => {
  try {
    const { data } = await api.get('/api/v1/token/stats/mgi/build-metrics/')
    metrics.value = data
  } catch {
    // Ignore error
  }
})

const goTo = (params) => {
  let query = params.url ? params.url.query || {} : {}

  if (params.data.project_id) {
    query = _merge(query, { project_id: params.data.project_id })
  }

  if (params.data.status) {
    query = _merge(query, { status: params.data.status })
  }

  if (params.data.created_at__lt) {
    query = _merge(query, {
      started_at__gte: params.data.created_at__gte,
      started_at__lt: params.data.created_at__lt,
    })
  }

  router.push({
    name: url.name,
    query,
  })
}

const search = (value) => {
  router.push(Object.assign({}, url, { query: { search: value } }))
}
</script>
