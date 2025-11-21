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
        <q-list
          id="events-history"
          :class="[
            'q-card q-card--flat no-shadow',
            $q.dark.isActive ? 'q-card--dark q-dark' : '',
          ]"
          bordered
        >
          <q-expansion-item @show="loadEventsHistory">
            <template #header>
              <q-item-section>
                <div class="text-h5 q-py-sm">
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
                <q-card-section class="row justify-center q-py-none">
                  <q-input
                    v-model="lastHours"
                    type="number"
                    class="q-ma-sm"
                    outlined
                    dense
                    :label="$gettext('Last Hours')"
                    @keydown.enter="updateEventsHistory"
                  />

                  <q-btn
                    :icon="appIcon('update')"
                    class="q-ma-sm"
                    :disabled="loading"
                    :loading="loading"
                    :label="$gettext('Update')"
                    @click="updateEventsHistory"
                  />
                </q-card-section>
              </template>
            </StackedBarChart>
          </q-expansion-item>
        </q-list>
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
            <q-card-section class="row justify-center q-py-none">
              <MonthInput
                v-model="begin"
                class="q-ma-sm"
                :label="$gettext('Initial Month')"
              />

              <MonthInput
                v-model="end"
                class="q-ma-sm"
                :label="$gettext('Final Month')"
              />

              <q-btn
                :icon="appIcon('update')"
                class="q-ma-sm"
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

    const loadProjects = async () => {
      try {
        const response = await api.get('/api/v1/token/projects')
        projects.value = response.data.results
        loadMonthlySyncs()
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadMonthlySyncs = async () => {
      monthlySyncs.series = []
      loadingMonthlySyncs.value = true

      try {
        const baseParams = { begin: begin.value, end: end.value }

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

        // Run project requests in parallel
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
      Object.assign(eventsHistory, { series: [], xData: [] })
      loadEventsHistory()
    }

    const updateMonthlySyncs = () => {
      loadMonthlySyncs()
      uiStore.scrollToElement(document.getElementById('monthly-syncs'))
    }

    const goTo = (params) => {
      // console.log('goTo **********', params)
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
