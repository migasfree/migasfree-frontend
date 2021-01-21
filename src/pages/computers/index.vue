<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-add-button="false" />

    <SearchFilter @search="search" />

    <div class="row">
      <div v-if="machineData.total" class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Computers / Machine')"
          :data="machineData"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div v-if="statusData.total" class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Subscribed Computers / Status')"
          :data="statusData"
          :url="statusUrl"
          @getLink="goTo"
        />
      </div>

      <div v-if="nestedPieData.total" class="col-4 col-md">
        <NestedPieChart
          :title="$gettext('Productive Computers')"
          :data="nestedPieData"
          :url="productiveUrl"
          @getLink="goTo"
        />
      </div>
    </div>

    <div
      v-if="'series' in newMonthData && newMonthData.series.length > 0"
      class="row"
    >
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('New Computers / Month')"
          :data="newMonthData"
          @getLink="goTo"
        />
      </div>
    </div>

    <div
      v-if="'xData' in entryYearData && entryYearData.xData.length > 0"
      class="row"
    >
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Physical computers entering the system per year')"
          :data="entryYearData"
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
import StackedBarChart from 'components/chart/StackedBar'

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
    NestedPieChart,
    StackedBarChart
  },
  data() {
    return {
      title: this.$gettext('Computers'),
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
          text: this.$gettext('Computers'),
          icon: 'mdi-desktop-classic'
        }
      ],
      machineData: {},
      statusData: {},
      nestedPieData: {},
      newMonthData: {},
      entryYearData: {},
      url: { name: 'computers-list' }
    }
  },
  computed: {
    statusUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown,in repair,available' }
      })
    },

    productiveUrl() {
      return Object.assign({}, this.url, {
        query: { status_in: 'intended,reserved,unknown' }
      })
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/stats/computers/machine/')
      .then((response) => {
        this.machineData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/status/')
      .then((response) => {
        this.statusData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/productive/platform/')
      .then((response) => {
        this.nestedPieData = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    await this.$axios
      .get('/api/v1/token/stats/computers/new/month/')
      .then((response) => {
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
      if (params.data.machine) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            machine: params.data.machine
          })
        })
      }

      if (params.data.status__in) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            status_in: params.data.status__in
          })
        })
      }

      if (params.data.project_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            project_id: params.data.project_id
          })
        })
      }

      if (params.data.platform_id) {
        this.$router.push({
          name: this.url.name,
          query: Object.assign(params.url.query, {
            platform_id: params.data.platform_id
          })
        })
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
