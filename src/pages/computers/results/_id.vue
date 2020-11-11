<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    {{ element }}
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'

export default {
  components: {
    Breadcrumbs
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
          to: 'computers-dashboard'
        },
        {
          text: 'Resultados',
          to: 'computers-list'
        },
        {
          text: 'Id'
        }
      ],
      element: {}
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.element = response.data
        this.breadcrumbs[4].text = this.element.name
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  }
}
</script>
