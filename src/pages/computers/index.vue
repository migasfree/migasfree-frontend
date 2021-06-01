<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Computers / Machine')"
          end-point="/api/v1/token/stats/computers/machine/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Subscribed Computers / Status')"
          end-point="/api/v1/token/stats/computers/status/"
          :url="statusUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Productive Computers')"
          end-point="/api/v1/token/stats/computers/productive/platform/"
          :url="productiveUrl"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('New Computers / Month')"
          end-point="/api/v1/token/stats/computers/new/month/"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Physical computers entering the system per year')"
          end-point="/api/v1/token/stats/computers/entry/year/"
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
    PieChart,
    StackedBarChart
  },
  data() {
    return {
      title: this.$gettext('Computers'),
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
          text: this.$gettext('Computers'),
          icon: 'mdi-desktop-classic'
        }
      ],
      url: { name: 'computers-list' }
    }
  },
  computed: {
    statusUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown,in repair,available' }
      })
    },

    productiveUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown' }
      })
    }
  },
  methods: {
    goTo(params) {
      let query = {}

      if ('url' in params && 'query' in params.url) query = params.url.query

      if (params.data.machine) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(query, {
            machine: params.data.machine
          })
        })
      }

      if (params.data.status_in) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(query, {
            status_in: params.data.status_in
          })
        })
      }

      if (params.data.project_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(query, {
            project_id: params.data.project_id
          })
        })
      }

      if (params.data.platform_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(query, {
            platform_id: params.data.platform_id
          })
        })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }
        if (params.data.machine) {
          Object.assign(query, { machine: params.data.machine })
        }

        this.$router.push(Object.assign(this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
