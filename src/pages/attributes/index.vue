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
      url: { name: 'attributes-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/features/property/')
      .then((response) => {
        this.pieData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    goTo(params) {
      console.log(params)
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
