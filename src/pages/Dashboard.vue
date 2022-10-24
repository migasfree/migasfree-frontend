<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <div class="row">
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

    <div class="row">
      <div class="col-12">
        <q-list
          id="events-history"
          class="q-ma-sm q-pa-none rounded-borders shadow-1"
          bordered
        >
          <q-expansion-item @show="loadEventsHistory">
            <template #header>
              <q-item-section>
                <div class="text-h5">
                  <translate :translate-params="{ number: lastHours }"
                    >History of events in the last %{ number } hours</translate
                  >
                </div>
              </q-item-section>
            </template>

            <q-card>
              <q-card-section>
                <div v-if="loading" class="text-center">
                  <q-spinner-dots color="primary" size="3em" />
                </div>

                <StackedBarChart
                  v-show="!loading"
                  title=""
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
                      />

                      <q-btn
                        icon="mdi-refresh"
                        class="q-ma-sm"
                        :disabled="loading"
                        :loading="loading"
                        :label="$gettext('Update')"
                        @click="updateEventsHistory"
                      />
                    </q-card-section>
                  </template>
                </StackedBarChart>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>

    <div class="row">
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
                icon="mdi-refresh"
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

import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'
import MonthInput from 'components/ui/MonthInput'

export default defineComponent({
  name: 'Dashboard',
  components: { Breadcrumbs, Header, PieChart, StackedBarChart, MonthInput },
  setup() {
    const { $gettext } = useGettext()
    const router = useRouter()
    const uiStore = useUiStore()

    const title = $gettext('Dashboard')
    useMeta({ title })

    const breadcrumbs = [
      {
        text: title,
        icon: 'mdi-home',
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

    const lastHours = ref(72)
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
      await api
        .get('/api/v1/token/projects')
        .then((response) => {
          projects.value = response.data.results
          loadMonthlySyncs()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const loadMonthlySyncs = async () => {
      monthlySyncs.series = []

      loadingMonthlySyncs.value = true
      await api
        .get('/api/v1/token/stats/syncs/monthly/', {
          params: { begin: begin.value, end: end.value },
        })
        .then((response) => {
          monthlySyncs.xData = response.data.x_labels
          Object.entries(response.data.data).map(([key, val]) => {
            monthlySyncs.series.push({
              type: 'line',
              smooth: true,
              name: 'Total',
              data: val,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loadingMonthlySyncs.value = false
        })

      projects.value.forEach((item) => {
        api
          .get('/api/v1/token/stats/syncs/monthly/', {
            params: { begin: begin.value, end: end.value, project_id: item.id },
          })
          .then((response) => {
            Object.entries(response.data.data).map(([key, val]) => {
              monthlySyncs.series.push({
                type: 'line',
                smooth: true,
                name: item.name,
                data: val,
              })
            })
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      })
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

      const syncs = await api
        .get('/api/v1/token/stats/syncs/history/', { params: { begin } })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      const errors = await api
        .get('/api/v1/token/stats/errors/history/', { params: { begin } })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      const faults = await api
        .get('/api/v1/token/stats/faults/history/', { params: { begin } })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      const migrations = await api
        .get('/api/v1/token/stats/migrations/history/', { params: { begin } })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      const statusLogs = await api
        .get('/api/v1/token/stats/status-logs/history/', { params: { begin } })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      eventsHistory.xData = syncs.data.x_labels
      eventsHistory.series = [
        {
          type: 'line',
          smooth: true,
          name: Object.keys(syncs.data.data)[0],
          data: Object.values(syncs.data.data)[0],
        },
        {
          type: 'line',
          smooth: true,
          name: Object.keys(errors.data.data)[0],
          data: Object.values(errors.data.data)[0],
        },
        {
          type: 'line',
          smooth: true,
          name: Object.keys(faults.data.data)[0],
          data: Object.values(faults.data.data)[0],
        },
        {
          type: 'line',
          smooth: true,
          name: Object.keys(migrations.data.data)[0],
          data: Object.values(migrations.data.data)[0],
        },
        {
          type: 'line',
          smooth: true,
          name: Object.keys(statusLogs.data.data)[0],
          data: Object.values(statusLogs.data.data)[0],
        },
      ]

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
      const pluralize = require('pluralize')
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
      switch (model) {
        case 'synchronizations':
          return 'syncs-list'
        case 'statuslogs':
          return 'status-logs-list'
        default:
          return `${model}-list`
      }
    }

    onMounted(async () => {
      await loadProjects()
    })

    return {
      title,
      breadcrumbs,
      productiveComputersTitle,
      uncheckedErrorsTitle,
      uncheckedFaultsTitle,
      dailySyncsTitle,
      monthlySyncs,
      monthlySyncsTitle,
      projects,
      loading,
      loadingMonthlySyncs,
      lastHours,
      begin,
      end,
      eventsHistory,
      productiveUrl,
      uncheckedErrorsUrl,
      uncheckedFaultsUrl,
      loadProjects,
      updateMonthlySyncs,
      updateEventsHistory,
      loadEventsHistory,
      goTo,
    }
  },
})
</script>
