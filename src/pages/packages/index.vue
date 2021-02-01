<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'package-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <NestedPieChart
          :title="$gettext('Packages / Store')"
          :data="byStore"
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
      title: this.$gettext('Packages'),
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
          text: this.$gettext('Packages'),
          icon: 'mdi-package-variant'
        }
      ],
      byStore: {},
      byProject: {},
      url: { name: 'packages-list' }
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/packages/store/')
      .then((response) => {
        this.byStore = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    goTo(params) {
      console.log(params)
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.project_id) {
          Object.assign(query, {
            project_id: params.data.project_id
          })
        }

        if (params.data.store_id) {
          Object.assign(query, {
            store_id: params.data.store_id
          })
        }

        console.log(params.url.name, query)
        this.$router.push({ name: params.url.name, query })
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
