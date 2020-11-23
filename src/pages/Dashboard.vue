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
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import NestedPieChart from 'components/chart/NestedPie'

export default {
  components: { Breadcrumbs, Header, NestedPieChart },
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
      uncheckedFaults: {}
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
  },
  methods: {
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
