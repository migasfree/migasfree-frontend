<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Cuadro de mando" :has-add-button="false" />

    <div class="row">
      <div class="col-md">
        <NestedPieChart
          title="Ordenadores productivos"
          :data="productiveComputers"
          :url="productiveUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-md">
        <NestedPieChart
          title="Errores sin comprobar"
          :data="uncheckedErrors"
          :url="uncheckedErrorsUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-md">
        <NestedPieChart
          title="Fallas sin comprobar"
          :data="uncheckedFaults"
          :url="uncheckedFaultsUrl"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-card class="q-ma-sm">
          <q-expansion-item @show="loadEventsHistory">
            <template v-slot:header>
              <q-item-section>
                <div class="text-h5">
                  Histórico de sucesos en las últimas 72 horas
                </div>
              </q-item-section>
            </template>

            <div v-if="loading" class="text-center">
              <q-spinner-dots color="primary" size="3em" />
            </div>
            <StackedBarChart title="" :data="eventsHistory" />
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          title="Ordenadores únicos sincronizados / día"
          :data="dailySyncs"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          title="Ordenadores únicos sincronizados / mes"
          :data="monthlySyncs"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import NestedPieChart from 'components/chart/NestedPie'
import StackedBarChart from 'components/chart/StackedBar'

export default {
  components: { Breadcrumbs, Header, NestedPieChart, StackedBarChart },
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          icon: 'mdi-home'
        }
      ],
      productiveComputers: {},
      uncheckedErrors: {},
      uncheckedFaults: {},
      dailySyncs: {},
      monthlySyncs: {},
      projects: [],
      loading: false,
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
    await this.$axios
      .get('/api/v1/token/stats/computers/productive/platform/')
      .then((response) => {
        this.productiveComputers = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/errors/unchecked/')
      .then((response) => {
        this.uncheckedErrors = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/faults/unchecked/')
      .then((response) => {
        this.uncheckedFaults = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/syncs/daily/')
      .then((response) => {
        const series = []

        Object.entries(response.data.data).map(([key, val]) => {
          series.push({
            type: 'line',
            smooth: true,
            name: key,
            data: val
          })
        })
        this.dailySyncs = {
          xData: response.data.x_labels,
          series
        }
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

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
        console.log(this.eventsHistory)

        this.loading = false
      }
    },

    goTo(params) {
      console.log(params)

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

      this.$router.push({
        name: params.url.name,
        query: Object.assign(params.url.query || {}, query)
      })
    }
  }
}
</script>
