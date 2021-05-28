<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'model-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          :title="$gettext('Models / Manufacturer')"
          end-point="/api/v1/token/stats/devices/models/manufacturer/"
          :url="url"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Models / Project')"
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
      url: { name: 'models-list' },
      byProject: {}
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/devices/models/project/')
      .then((response) => {
        this.$set(this.byProject, 'xData', response.data.x_labels)
        this.$set(this.byProject, 'series', [
          {
            type: 'bar',
            data: response.data.data,
            name: this.$gettext('Models'),
            markLine: {
              data: [
                {
                  label: { show: true },
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
      if (params.data.manufacturer_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { manufacturer_id: params.data.manufacturer_id }
          })
        )
      }

      if (params.data.drivers__project__id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { drivers_project_id: params.data.drivers__project__id }
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
