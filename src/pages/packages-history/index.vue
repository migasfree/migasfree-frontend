<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Packages / Project')"
          end-point="/api/v1/token/stats/packages-history/project/"
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
      title: this.$gettext('Packages History'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Packages History'),
          icon: 'mdi-history'
        }
      ],
      url: { name: 'packages-history-list' }
    }
  },
  methods: {
    goTo(params) {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.package_project_id) {
          Object.assign(query, {
            package_project_id: params.data.package_project_id
          })
        }

        this.$router.push({ name: params.url.name, query })
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
