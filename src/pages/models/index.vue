<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'model-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          :title="$gettext('Models / Manufacturer')"
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
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    PieChart
  },
  data() {
    return {
      title: this.$gettext('Models'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer-eye'
        },
        {
          text: this.$gettext('Models'),
          icon: 'mdi-shape'
        }
      ],
      pieData: {},
      url: { name: 'models-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/devices/models/manufacturer/')
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
      if (params.data.manufacturer_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { manufacturer_id: params.data.manufacturer_id }
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
