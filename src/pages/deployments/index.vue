<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'deployment-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Enabled Deployments')"
          end-point="/api/v1/token/stats/deployments/enabled/project/"
          :url="enabledUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Enabled')"
          end-point="/api/v1/token/stats/deployments/enabled/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Schedule')"
          end-point="/api/v1/token/stats/deployments/schedule/"
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
import _merge from 'lodash/merge'

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
    PieChart
  },
  data() {
    return {
      title: this.$gettext('Deployments'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery'
        },
        {
          text: this.$gettext('Deployments'),
          icon: 'mdi-rocket-launch'
        }
      ],
      url: { name: 'deployments-list' }
    }
  },
  computed: {
    enabledUrl() {
      return Object.assign({}, this.url, {
        query: { enabled: true }
      })
    }
  },
  methods: {
    goTo(params) {
      let query = params.url.query || {}

      if (params.data.project_id) {
        query = _merge(query, { project_id: params.data.project_id })
      }

      if ('schedule' in params.data) {
        query = _merge(query, { schedule: params.data.schedule })
      }

      if (params.data.enabled) {
        query = _merge(query, { enabled: params.data.enabled })
      }

      this.$router.push({
        name: this.url.name,
        query
      })
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
