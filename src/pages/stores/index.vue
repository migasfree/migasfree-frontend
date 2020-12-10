<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Almacenes" @new="$router.push({ name: 'store-add' })" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          title="Almacenes / Proyecto"
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
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'

export default {
  meta: {
    title: 'Stores'
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
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
          text: 'Liberación',
          icon: 'mdi-truck-delivery'
        },
        {
          text: 'Stores',
          icon: 'mdi-store-24-hour'
        }
      ],
      pieData: {},
      url: { name: 'stores-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/stores/project/')
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
      if (params.data.project_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { project_id: params.data.project_id }
          })
        )
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
