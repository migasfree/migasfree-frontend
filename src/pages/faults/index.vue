<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Faults / Month')"
          end-point="/api/v1/token/stats/faults/project/month/"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Faults / Faults Definitions')"
          end-point="/api/v1/token/stats/faults/definition/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Unchecked Faults')"
          end-point="/api/v1/token/stats/faults/unchecked/"
          :url="uncheckedFaultsUrl"
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
      title: this.$gettext('Faults'),
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
          text: this.$gettext('Faults'),
          icon: 'mdi-bomb'
        }
      ],
      url: { name: 'faults-list' }
    }
  },
  computed: {
    uncheckedFaultsUrl() {
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

        if (params.data.fault_definition_id) {
          Object.assign(query, {
            fault_definition_id: params.data.fault_definition_id
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
