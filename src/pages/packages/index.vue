<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'package-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Packages / Store')"
          end-point="/api/v1/token/stats/packages/store/"
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
    Header,
    SearchFilter,
    PieChart
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
      url: { name: 'packages-list' }
    }
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
