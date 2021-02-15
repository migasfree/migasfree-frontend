<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="[{ route: 'device-add' }]" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Connection')"
          end-point="/api/v1/token/stats/devices/connection/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Model')"
          end-point="/api/v1/token/stats/devices/model/"
          :url="url"
          @getLink="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Manufacturer')"
          end-point="/api/v1/token/stats/devices/manufacturer/"
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
      title: this.$gettext('Devices'),
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
          text: this.$gettext('Devices'),
          icon: 'mdi-printer'
        }
      ],
      url: { name: 'devices-list' }
    }
  },
  methods: {
    goTo(params) {
      if (params.data.connection_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { connection_id: params.data.connection_id }
          })
        )
      }

      if (params.data.model_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { model_id: params.data.model_id }
          })
        )
      }

      if (params.data.manufacturer_id) {
        this.$router.push(
          Object.assign(this.url, {
            query: { manufacturer_id: params.data.manufacturer_id }
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
