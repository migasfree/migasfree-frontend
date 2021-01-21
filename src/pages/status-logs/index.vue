<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-add-button="false" />

    <SearchFilter @search="search" />

    <div v-if="statusLogsStatus.total" class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Status Logs / Month')"
          :data="statusLogsMonth"
          @getLink="goTo"
        />
      </div>
    </div>

    <div v-if="statusLogsStatus.total" class="row">
      <div class="col-12">
        <NestedPieChart
          :title="$gettext('Status Logs / Status')"
          :data="statusLogsStatus"
          :url="url"
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
  meta() {
    return {
      title: this.title
    }
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
      title: this.$gettext('Status Logs'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Status Logs'),
          icon: 'mdi-flag-variant'
        }
      ],
      statusLogsMonth: {},
      statusLogsStatus: {},
      url: { name: 'status-logs-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/status-logs/month/')
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
        this.statusLogsMonth = {
          xData: response.data.x_labels,
          series
        }
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/status-logs/status/')
      .then((response) => {
        this.statusLogsStatus = response.data
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

        if (params.data.status) {
          Object.assign(query, {
            status_in: params.data.status
          })
        }

        if (
          !('query' in params.url) &&
          params.data.status_in &&
          !('status' in params.data)
        ) {
          Object.assign(query, {
            status_in: params.data.status_in
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
