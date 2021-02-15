<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'app-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Applications / Category')"
          end-point="/api/v1/token/stats/applications/category/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Applications / Level')"
          end-point="/api/v1/token/stats/applications/level/"
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
      title: this.$gettext('Applications'),
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
          text: this.$gettext('Applications'),
          icon: 'mdi-apps'
        }
      ],
      url: { name: 'apps-list' }
    }
  },
  methods: {
    goTo(params) {
      console.log(params)
      if (params.data.category) {
        this.$router.push(
          Object.assign(this.url, {
            query: { category: params.data.category }
          })
        )
      }

      if (params.data.level) {
        this.$router.push(
          Object.assign(this.url, {
            query: { level: params.data.level }
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
