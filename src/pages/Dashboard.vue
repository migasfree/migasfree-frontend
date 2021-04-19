<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <div class="row">
      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="productiveComputersTitle"
          end-point="/api/v1/token/stats/computers/productive/platform/"
          :url="productiveUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="uncheckedErrorsTitle"
          end-point="/api/v1/token/stats/errors/unchecked/"
          :url="uncheckedErrorsUrl"
          :critical="true"
          @getLink="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="uncheckedFaultsTitle"
          end-point="/api/v1/token/stats/faults/unchecked/"
          :url="uncheckedFaultsUrl"
          :critical="true"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-list id="events-history" class="q-ma-sm rounded-borders" bordered>
          <q-expansion-item @show="loadEventsHistory">
            <template #header>
              <q-item-section>
                <div class="text-h5">
                  <translate>History of events in the last 72 hours</translate>
                </div>
              </q-item-section>
            </template>

            <q-card>
              <div v-if="loading" class="text-center">
                <q-spinner-dots color="primary" size="3em" />
              </div>
              <StackedBarChart
                v-show="!loading"
                title=""
                :initial-data="eventsHistory"
                @getLink="goTo"
              />

              <q-card-actions align="right">
                <q-btn
                  icon="mdi-refresh"
                  :disabled="loading"
                  :loading="loading"
                  :label="$gettext('Update')"
                  @click="updateEventsHistory"
                />
              </q-card-actions>
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
          :title="monthlySyncsTitle"
          :initial-data="monthlySyncs"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: { Breadcrumbs, Header, PieChart, StackedBarChart },
  data() {
    const title = this.$gettext('Dashboard')

    return {
      title,
      breadcrumbs: [
        {
          text: title,
          icon: 'mdi-home'
        }
      ],
      productiveComputersTitle: this.$gettext('Productive Computers'),
      uncheckedErrorsTitle: this.$gettext('Unchecked Errors'),
      uncheckedFaultsTitle: this.$gettext('Unchecked Faults'),
      dailySyncsTitle: this.$gettext('Synchronized single computers / day'),
      monthlySyncs: {},
      monthlySyncsTitle: this.$gettext('Synchronized single computers / month'),
      projects: [],
      loading: false,
      loadingMonthlySyncs: false,
      eventsHistory: {}
    }
  },
  computed: {
    productiveUrl() {
      return {
        name: 'computers-list',
        query: { status_in: 'intended,reserved,unknown' }
      }
    },

    uncheckedErrorsUrl() {
      return {
        name: 'errors-list',
        query: { checked: false }
      }
    },

    uncheckedFaultsUrl() {
      return {
        name: 'faults-list',
        query: { checked: false }
      }
    }
  },
  async mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      await this.$axios
        .get('/api/v1/token/projects')
        .then((response) => {
          this.projects = response.data.results
          this.loadMonthlySyncs()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadMonthlySyncs() {
      this.$set(this.monthlySyncs, 'series', [])

      this.loadingMonthlySyncs = true
      await this.$axios
        .get('/api/v1/token/stats/syncs/monthly/')
        .then((response) => {
          this.$set(this.monthlySyncs, 'xData', response.data.x_labels)
          Object.entries(response.data.data).map(([key, val]) => {
            this.monthlySyncs.series.push({
              type: 'line',
              smooth: true,
              name: 'Total',
              data: val
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => {
          this.loadingMonthlySyncs = false
        })

      this.projects.forEach((item) => {
        this.$axios
          .get(`/api/v1/token/stats/syncs/monthly/?project_id=${item.id}`)
          .then((response) => {
            Object.entries(response.data.data).map(([key, val]) => {
              this.monthlySyncs.series.push({
                type: 'line',
                smooth: true,
                name: item.name,
                data: val
              })
            })
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      })
    },

    async loadEventsHistory() {
      if (Object.keys(this.eventsHistory).length === 0) {
        this.loading = true
        const syncs = await this.$axios
          .get('/api/v1/token/stats/syncs/history/')
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        const errors = await this.$axios
          .get('/api/v1/token/stats/errors/history/')
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        const faults = await this.$axios
          .get('/api/v1/token/stats/faults/history/')
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        const migrations = await this.$axios
          .get('/api/v1/token/stats/migrations/history/')
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        const statusLogs = await this.$axios
          .get('/api/v1/token/stats/status-logs/history/')
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })

        this.$set(this.eventsHistory, 'xData', syncs.data.x_labels)
        this.$set(this.eventsHistory, 'series', [
          {
            type: 'line',
            smooth: true,
            name: Object.keys(syncs.data.data)[0],
            data: Object.values(syncs.data.data)[0]
          },
          {
            type: 'line',
            smooth: true,
            name: Object.keys(errors.data.data)[0],
            data: Object.values(errors.data.data)[0]
          },
          {
            type: 'line',
            smooth: true,
            name: Object.keys(faults.data.data)[0],
            data: Object.values(faults.data.data)[0]
          },
          {
            type: 'line',
            smooth: true,
            name: Object.keys(migrations.data.data)[0],
            data: Object.values(migrations.data.data)[0]
          },
          {
            type: 'line',
            smooth: true,
            name: Object.keys(statusLogs.data.data)[0],
            data: Object.values(statusLogs.data.data)[0]
          }
        ])

        this.loading = false
      }
      this.$store.dispatch(
        'ui/scrollToElement',
        document.getElementById('events-history')
      )
    },

    updateEventsHistory() {
      this.eventsHistory = {}
      this.loadEventsHistory()
    },

    goTo(params) {
      let query = {}

      if (params.data.project_id) {
        query = Object.assign(query, {
          project_id: params.data.project_id
        })
      }

      if (params.data.platform_id) {
        query = Object.assign(query, {
          platform_id: params.data.platform_id
        })
      }

      if (params.data.created_at__lt) {
        Object.assign(query, {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        })
      }

      if ('url' in params) {
        this.$router.push({
          name: params.url.name,
          query: Object.assign(params.url.query || {}, query)
        })
      }

      if ('model' in params.data) {
        this.$router.push({
          name: this.resolveRoute(this.$pluralize.plural(params.data.model)),
          query
        })
      }
    },

    resolveRoute(model) {
      switch (model) {
        case 'synchronizations':
          return 'syncs-list'
        case 'statuslogs':
          return 'status-logs-list'
        default:
          return `${model}-list`
      }
    }
  }
}
</script>
