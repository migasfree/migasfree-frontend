<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" @new="$router.push({ name: 'deployment-add' })" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Enabled Deployments')"
          :data="enabledData"
          :url="url"
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
    /* statusUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown,in repair,available' }
      })
    },

    productiveUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown' }
      })
    } */
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
      if (params.data.machine) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            machine: params.data.machine
          })
        })
      }

      if (params.data.status__in) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            status_in: params.data.status__in
          })
        })
      }

      if (params.data.project_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            project_id: params.data.project_id
          })
        })
      }

      if (params.data.platform_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
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
        console.log(query)
        this.$router.push(Object.assign(this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
