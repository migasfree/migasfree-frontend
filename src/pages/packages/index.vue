<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Paquetes" @new="$router.push({ name: 'package-add' })" />

    <SearchFilter @search="search" />

    <div class="row">
      <div class="col-12">
        <PieChart
          title="Paquetes / Almacén"
          :data="byStore"
          :url="url"
          @getLink="goTo"
        />
      </div>
    </div>

    <!-- div class="row">
      <div class="col-12">
        <PieChart
          title="Paquetes / Proyecto"
          :data="byProject"
          :url="url"
          @getLink="goTo"
        />
      </div>
    </div -->
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'

export default {
  meta: {
    title: 'Packages'
  },
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    PieChart
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
          text: 'Liberación',
          icon: 'mdi-truck-delivery'
        },
        {
          text: 'Paquetes',
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

    /* await this.$axios
      .get('/api/v1/token/stats/packages/project/')
      .then((response) => {
        this.byProject = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      }) */
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

        console.log(params.url.name, query)
        this.$router.push({ name: params.url.name, query })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }

        console.log(query)
        this.$router.push(Object.assign({}, this.url, { query }))
      }
    },

    search(value) {
      this.$router.push(Object.assign(this.url, { query: { search: value } }))
    }
  }
}
</script>
