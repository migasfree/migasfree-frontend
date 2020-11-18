<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <h2 class="text-h3">Atributos</h2>
    </div>

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          title="Atributos / Fórmula"
          :data="pieData"
          :url="url"
          @getLink="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'

export default {
  components: {
    Breadcrumbs,
    SearchFilter,
    PieChart
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
          text: 'Atributos',
          icon: 'mdi-pound'
        }
      ],
      pieData: {},
      url: '/attributes/results/?'
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/features/property/')
      .then((response) => {
        console.log(response)
        this.pieData = response.data
      })
      .catch((error) => {
        console.log(error)
        this.$store.dispatch(
          'ui/notifyError',
          error.response.data.detail || error.response.data
        )
      })
  },
  methods: {
    goTo(params) {
      console.log(params)
    },

    search(value) {
      this.$router.push(this.url + `search=${value}`)
    }
  }
}
</script>
