<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <div class="row">
      <h2 class="text-h3">Ordenadores</h2>
    </div>

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-6">
        <PieChart
          title="Ordenadores por proyecto"
          :data="pieData"
          :url="byProjectUrl"
          @getLink="goTo"
        />
      </div>

      <div class="col-6">
        <NestedPieChart
          title="Ordenadores productivos"
          :data="nestedPieData"
          :url="productiveUrl"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          title="Nuevos ordenadores / mes"
          :data="newMonthData"
          @getLink="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          title="Ordenadores físicos que entran al sistema por año"
          :data="entryYearData"
          @getLink="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'
import NestedPieChart from 'components/chart/NestedPie'
import StackedBarChart from 'components/chart/StackedBar'

export default {
  components: {
    Breadcrumbs,
    SearchFilter,
    PieChart,
    NestedPieChart,
    StackedBarChart
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
          text: 'Ordenadores',
          icon: 'mdi-desktop-classic'
        }
      ],
      pieData: {},
      nestedPieData: {},
      newMonthData: {},
      entryYearData: {},
      url: { name: 'computers-list' }
    }
  },
  computed: {
    byProjectUrl() {
      // FIXME
      return Object.assign(this.url, {
        query: { status_in: 'intended,reserved,unknown' }
      })
    },

    productiveUrl() {
      return Object.assign(this.url, {
        query: { status_in: 'intended,reserved,unknown' }
      })
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/computers/projects/')
      .then((response) => {
        console.log(response)
        this.pieData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/productive/platform/')
      .then((response) => {
        console.log(response)
        this.nestedPieData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/new/month/')
      .then((response) => {
        console.log(response)
        const series = []

        Object.entries(response.data.data).map(([key, val]) => {
          series.push({
            type: 'line',
            smooth: true,
            name: key,
            data: val
          })
        })
        this.newMonthData = {
          xData: response.data.x_labels,
          series
        }
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/entry/year/')
      .then((response) => {
        console.log(response)
        const series = []

        Object.entries(response.data.data).map(([key, val]) => {
          series.push({
            type: 'line',
            smooth: true,
            name: key,
            data: val
          })
        })
        this.entryYearData = {
          xData: response.data.x_labels,
          series
        }
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

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }
        if (params.data.machine) {
          Object.assign(query, { machine: params.data.machine })
        }
        console.log(query)
        this.$router.push(Object.assign(this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
