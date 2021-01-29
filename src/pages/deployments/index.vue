<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :add-routes="[
        {
          title: $gettext('Internal Source'),
          route: 'internal-deployment-add'
        },
        {
          title: $gettext('External Source'),
          route: 'external-deployment-add'
        }
      ]"
    />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Enabled Deployments')"
          :data="enabledData"
          :url="enabledUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Deployments / Enabled')"
          :data="byEnabledData"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Deployments / Schedule')"
          :data="scheduleData"
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
    NestedPieChart
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
      enabledData: {},
      byEnabledData: {},
      scheduleData: {},
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
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/deployments/enabled/project/')
      .then((response) => {
        this.enabledData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/deployments/enabled/')
      .then((response) => {
        this.byEnabledData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/deployments/schedule/')
      .then((response) => {
        this.scheduleData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    goTo(params) {
      console.log(params)

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
