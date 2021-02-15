<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'tag-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          :title="$gettext('Tags / Stamps')"
          end-point="/api/v1/token/stats/tags/category/"
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
      title: this.$gettext('Tags'),
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
          text: this.$gettext('Tags'),
          icon: 'mdi-tag'
        }
      ],
      url: { name: 'tags-list' }
    }
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
    }
  }
}
</script>
