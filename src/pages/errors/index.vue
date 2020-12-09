<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Errores" :has-add-button="false" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          title="Errores / Mes"
          :data="projectMonth"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-6 col-md">
        <NestedPieChart
          title="Errores / proyecto / estado"
          :data="statusProjects"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-6 col-md">
        <NestedPieChart
          title="Errores sin comprobar"
          :data="uncheckedErrors"
          :url="uncheckedErrorsUrl"
          @getLink="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import NestedPieChart from 'components/chart/NestedPie'
import StackedBarChart from 'components/chart/StackedBar'

export default {
  meta: {
    title: 'Errors'
  },
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    StackedBarChart,
    NestedPieChart
  },
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Errores',
          icon: 'mdi-bug'
        }
      ],
      projectMonth: {},
      uncheckedErrors: {},
      statusProjects: {},
      url: { name: 'errors-list' }
    }
  },
  computed: {
    uncheckedErrorsUrl() {
      return Object.assign({}, this.url, { query: { checked: false } })
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/errors/project/month/')
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
        this.projectMonth = {
          xData: response.data.x_labels,
          series
        }
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
      .get('/api/v1/token/stats/errors/status/project/')
      .then((response) => {
        this.statusProjects = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    goTo(params) {
      console.log(params)
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.project_id) {
          Object.assign(query, {
            project_id: params.data.project_id
          })
        }

        if (params.data.platform_id) {
          Object.assign(query, {
            platform_id: params.data.platform_id
          })
        }

        if (params.data.status) {
          Object.assign(query, {
            status_in: params.data.status
          })
        }

        if (
          !('query' in params.url) &&
          params.data.name &&
          !('status' in params.data)
        ) {
          Object.assign(query, {
            status_in: params.data.name
          })
        }
        console.log(params.url.name, query)
        this.$router.push({ name: params.url.name, query })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }

        console.log(query)
        this.$router.push(Object.assign({}, this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
