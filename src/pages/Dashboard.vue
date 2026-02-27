<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <div class="row q-col-gutter-md q-pb-md">
      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="productiveComputersTitle"
          end-point="/api/v1/token/stats/computers/productive/platform/"
          :url="productiveUrl"
          @get-link="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="uncheckedErrorsTitle"
          end-point="/api/v1/token/stats/errors/unchecked/"
          :url="uncheckedErrorsUrl"
          :critical="true"
          @get-link="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="uncheckedFaultsTitle"
          end-point="/api/v1/token/stats/faults/unchecked/"
          :url="uncheckedFaultsUrl"
          :critical="true"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row q-pb-md">
      <div class="col-12">
        <q-card id="events-history">
          <q-expansion-item
            header-class="q-card__section q-pb-none"
            @show="loadEventsHistory"
          >
            <template #header>
              <q-item-section>
                <div class="text-h5 q-my-sm">
                  {{
                    $gettext(
                      'History of events in the last %{ number } hours',
                      { number: lastHours },
                    )
                  }}
                </div>
              </q-item-section>
            </template>

            <div v-if="loading" class="text-center">
              <q-spinner-dots color="primary" size="3em" />
            </div>

            <StackedBarChart
              v-show="!loading"
              :title="$gettext('Events History')"
              :show-title="false"
              borderless
              :initial-data="eventsHistory"
              @get-link="goTo"
            >
              <template #selector>
                <q-card-section
                  class="row justify-center items-center q-py-sm q-gutter-sm"
                >
                  <q-input
                    v-model.number="lastHours"
                    type="number"
                    outlined
                    dense
                    hide-bottom-space
                    class="hours-input"
                    :label="$gettext('Last Hours')"
                    min="1"
                    max="720"
                    :rules="[
                      (val) => val > 0 || $gettext('Must be positive'),
                      (val) =>
                        val <= 720 || $gettext('Max 720 hours (30 days)'),
                    ]"
                    @keydown.enter="updateEventsHistory"
                  >
                    <template #prepend>
                      <q-icon name="mdi-clock-outline" />
                    </template>
                  </q-input>

                  <q-btn
                    color="primary"
                    class="update-btn"
                    :icon="appIcon('update')"
                    :disabled="loading"
                    :loading="loading"
                    :label="$gettext('Update')"
                    @click="updateEventsHistory"
                  />
                </q-card-section>
              </template>
            </StackedBarChart>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <div class="row q-pb-md">
      <div class="col-12">
        <StackedBarChart
          :title="dailySyncsTitle"
          end-point="/api/v1/token/stats/syncs/daily/"
          day-selector
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div v-if="loadingMonthlySyncs" class="text-center">
          <q-spinner-dots color="primary" size="3em" />
        </div>
        <StackedBarChart
          v-show="!loadingMonthlySyncs"
          id="monthly-syncs"
          :title="monthlySyncsTitle"
          :initial-data="monthlySyncs"
          @get-link="goTo"
        >
          <template #selector>
            <q-card-section
              class="row justify-center items-center q-py-none q-gutter-sm"
            >
              <MonthInput
                v-model="begin"
                outlined
                dense
                hide-bottom-space
                :label="$gettext('Initial Month')"
              />

              <MonthInput
                v-model="end"
                outlined
                dense
                hide-bottom-space
                :label="$gettext('Final Month')"
              />

              <q-btn
                color="primary"
                class="update-btn"
                :icon="appIcon('update')"
                :disabled="loadingMonthlySyncs"
                :loading="loadingMonthlySyncs"
                :label="$gettext('Update')"
                @click="updateMonthlySyncs"
              />
            </q-card-section>
          </template>
        </StackedBarChart>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRouter } from 'vue-router'
import { useMeta } from 'quasar'
import pluralize from 'pluralize-esm'

import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'
import { EVENTS_HISTORY_HOURS } from 'config/app.conf'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'
import MonthInput from 'components/ui/MonthInput'

import { appIcon } from 'composables/element'

export default defineComponent({
  name: 'Dashboard',

  components: { Breadcrumbs, Header, PieChart, StackedBarChart, MonthInput },

  setup() {
    const { $gettext } = useGettext()
    const router = useRouter()
    const uiStore = useUiStore()

    const titleIcon = appIcon('home')
    const title = $gettext('Dashboard')
    useMeta({ title })

    const breadcrumbs = [
      {
        text: title,
        icon: titleIcon,
      },
    ]

    const productiveComputersTitle = $gettext('Productive Computers')
    const uncheckedErrorsTitle = $gettext('Unchecked Errors')
    const uncheckedFaultsTitle = $gettext('Unchecked Faults')
    const dailySyncsTitle = $gettext('Synchronized single computers / day')
    const monthlySyncs = reactive({})
    const monthlySyncsTitle = $gettext('Synchronized single computers / month')
    const projects = ref([])
    const loading = ref(false)
    const loadingMonthlySyncs = ref(false)
    const eventsHistory = reactive({})

    const lastHours = ref(EVENTS_HISTORY_HOURS)
    const begin = ref('')
    const end = ref('')

    const productiveUrl = computed(() => {
      return {
        name: 'computers-list',
        query: { status_in: 'intended,reserved,unknown' },
      }
    })

    const uncheckedErrorsUrl = computed(() => {
      return {
        name: 'errors-list',
        query: { checked: false },
      }
    })

    const uncheckedFaultsUrl = computed(() => {
      return {
        name: 'faults-list',
        query: { checked: false },
      }
    })

    // Fetches the list of all available projects and triggers monthly syncs load
    const loadProjects = async () => {
      try {
        const response = await api.get('/api/v1/token/projects')
        projects.value = response.data.results
        loadMonthlySyncs()
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    // Loads monthly synchronization statistics for all projects.
    // Executes requests in parallel for better performance.
    const loadMonthlySyncs = async () => {
      monthlySyncs.series = []
      loadingMonthlySyncs.value = true

      try {
        const baseParams = { begin: begin.value, end: end.value }

        // Fetch global total first to set x-axis labels
        const baseResponse = await api.get(
          '/api/v1/token/stats/syncs/monthly/',
          {
            params: baseParams,
          },
        )
        monthlySyncs.xData = baseResponse.data.x_labels
        for (const [, val] of Object.entries(baseResponse.data.data)) {
          monthlySyncs.series.push({
            type: 'line',
            smooth: true,
            name: 'Total',
            data: val,
          })
        }

        // Run detailed project requests in parallel
        const projectPromises = projects.value.map((item) =>
          api
            .get('/api/v1/token/stats/syncs/monthly/', {
              params: { ...baseParams, project_id: item.id },
            })
            .then((resp) => ({ item, data: resp.data.data })),
        )
        const projectResults = await Promise.all(projectPromises)

        for (const { item, data } of projectResults) {
          for (const [, val] of Object.entries(data)) {
            monthlySyncs.series.push({
              type: 'line',
              smooth: true,
              name: item.name,
              data: val,
            })
          }
        }
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loadingMonthlySyncs.value = false
      }
    }

    const calculateBeginDate = () => {
      if (lastHours.value <= 0) return ''

      let date = new Date()
      date.setHours(date.getHours() - lastHours.value)

      return `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}T${date.getHours()}`
    }

    // Aggregates history data from multiple endpoints (syncs, errors, faults, etc.)
    // Transforms the data into a series format compatible with StackedBarChart.
    const loadEventsHistory = async () => {
      const begin = calculateBeginDate()
      loading.value = true

      const endpoints = [
        { url: '/api/v1/token/stats/syncs/history/', key: 'syncs' },
        { url: '/api/v1/token/stats/errors/history/', key: 'errors' },
        { url: '/api/v1/token/stats/faults/history/', key: 'faults' },
        { url: '/api/v1/token/stats/migrations/history/', key: 'migrations' },
        { url: '/api/v1/token/stats/status-logs/history/', key: 'statusLogs' },
      ]

      // Run all requests in parallel
      const results = await Promise.all(
        endpoints.map(async ({ url, key }) => {
          try {
            const resp = await api.get(url, { params: { begin } })
            return { key, data: resp.data }
          } catch (error) {
            uiStore.notifyError(error)
            return { key, data: null }
          }
        }),
      )

      // Extract the x‑axis labels from the first successful response
      const firstSuccess = results.find((r) => r.data?.x_labels)
      eventsHistory.xData = firstSuccess?.data?.x_labels ?? []

      // Build the series array dynamically
      eventsHistory.series = results.map((r) => ({
        type: 'line',
        smooth: true,
        name: r.data ? Object.keys(r.data.data)[0] : '',
        data: r.data ? Object.values(r.data.data)[0] : [],
      }))

      loading.value = false
      uiStore.scrollToElement(document.getElementById('events-history'))
    }

    const updateEventsHistory = () => {
      if (!lastHours.value || lastHours.value < 1) lastHours.value = 1
      if (lastHours.value > 720) lastHours.value = 720

      Object.assign(eventsHistory, { series: [], xData: [] })
      loadEventsHistory()
    }

    const updateMonthlySyncs = () => {
      loadMonthlySyncs()
      uiStore.scrollToElement(document.getElementById('monthly-syncs'))
    }

    // Handles chart click navigation.
    // Resolves destination routes and builds query parameters based on chart data context.
    const goTo = (params) => {
      let query = {}

      if (params.data.project_id) {
        query = Object.assign(query, {
          project_id: params.data.project_id,
        })
      }

      if (params.data.platform_id) {
        query = Object.assign(query, {
          platform_id: params.data.platform_id,
        })
      }

      if (params.data.created_at__lt) {
        Object.assign(query, {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt,
        })
      }

      if ('url' in params) {
        router.push({
          name: params.url.name,
          query: Object.assign(params.url.query || {}, query),
        })
      }

      if ('model' in params.data) {
        router.push({
          name: resolveRoute(pluralize.plural(params.data.model)),
          query,
        })
      }
    }

    const resolveRoute = (model) => {
      const specialRoutes = {
        synchronizations: 'syncs-list',
        statuslogs: 'status-logs-list',
      }

      return specialRoutes[model] ?? `${model}-list`
    }

    onMounted(async () => {
      await loadProjects()
    })

    return {
      title,
      titleIcon,
      breadcrumbs,
      productiveComputersTitle,
      uncheckedErrorsTitle,
      uncheckedFaultsTitle,
      dailySyncsTitle,
      monthlySyncs,
      monthlySyncsTitle,
      loading,
      loadingMonthlySyncs,
      lastHours,
      begin,
      end,
      eventsHistory,
      productiveUrl,
      uncheckedErrorsUrl,
      uncheckedFaultsUrl,
      updateMonthlySyncs,
      updateEventsHistory,
      loadEventsHistory,
      goTo,
      appIcon,
    }
  },
})
</script>

<style scoped>
.hours-input {
  width: 180px;
}

.update-btn {
  height: 40px;
}
</style>
