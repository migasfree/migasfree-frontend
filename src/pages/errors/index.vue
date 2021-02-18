<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Errors / Month')"
          end-point="/api/v1/token/stats/errors/project/month/"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Errors / Project / Status')"
          end-point="/api/v1/token/stats/errors/status/project/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Unchecked Errors')"
          end-point="/api/v1/token/stats/errors/unchecked/"
          :url="uncheckedErrorsUrl"
          :critical="true"
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
      title: this.$gettext('Errors'),
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
          text: this.$gettext('Errors'),
          icon: 'mdi-bug'
        }
      ],
      url: { name: 'errors-list' }
    }
  },
  computed: {
    uncheckedErrorsUrl() {
      return Object.assign({}, this.url, { query: { checked: false } })
    }
  },
  methods: {
    goTo(params) {
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

        this.$router.push(Object.assign({}, this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
