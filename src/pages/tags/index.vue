<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Etiquetas" @new="addElement" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          title="Etiquetas / Categorías de etiquetas"
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
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Etiquetas',
          icon: 'mdi-tag'
        }
      ],
      pieData: {},
      url: { name: 'tags-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/tags/category/')
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
      if (params.data.property_att_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { property_id: params.data.property_att_id }
          })
        )
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    },

    addElement() {
      this.$router.push({ name: 'tag-detail' })
    }
  }
}
</script>
