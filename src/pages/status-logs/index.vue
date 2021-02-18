<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Status Logs / Month')"
          end-point="/api/v1/token/stats/status-logs/month/"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Status Logs / Status')"
          end-point="/api/v1/token/stats/status-logs/status/"
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
import PieChart from 'components/chart/Pie'
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
    PieChart
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
      url: { name: 'status-logs-list' }
    }
  },
  methods: {
    goTo(params) {
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

        this.$router.push({ name: params.url.name, query })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        }

        this.$router.push(Object.assign({}, this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
