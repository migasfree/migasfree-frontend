<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'app-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-md-6 col-sm-6 col-xs-12">
        <PieChart
          :title="$gettext('Applications / Category')"
          end-point="/api/v1/token/stats/applications/category/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-md-6 col-sm-6 col-xs-12">
        <PieChart
          :title="$gettext('Applications / Level')"
          end-point="/api/v1/token/stats/applications/level/"
          :url="url"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Applications / Project')"
          :initial-data="byProject"
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
import StackedBarChart from 'components/chart/StackedBar'

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
    PieChart,
    StackedBarChart
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
      url: { name: 'apps-list' },
      byProject: {}
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/applications/project/')
      .then((response) => {
        this.$set(this.byProject, 'xData', response.data.x_labels)
        this.$set(this.byProject, 'series', [
          {
            type: 'bar',
            data: response.data.data,
            name: this.$gettext('Applications'),
            markLine: {
              label: {
                show: true,
                formatter: '{b}: {c}',
                color: this.$q.dark.isActive ? '#fff' : '#333'
              },
              data: [
                {
                  name: this.$gettext('Total'),
                  yAxis: response.data.total
                }
              ]
            }
          }
        ])
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  },
  methods: {
    goTo(params) {
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

      if (params.data.packages_by_project__project__id) {
        this.$router.push(
          Object.assign(this.url, {
            query: {
              packages_by_project_project_id:
                params.data.packages_by_project__project__id
            }
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
