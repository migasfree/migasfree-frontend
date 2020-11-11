<template>
  <q-page padding>
    <q-breadcrumbs>
      <q-breadcrumbs-el
        v-for="(item, index) in breadcrumbs"
        :key="index"
        :icon="item.icon"
        :to="item.href"
        :label="item.text"
      />
    </q-breadcrumbs>

    {{ element }}
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          href: '/',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Ordenadores',
          href: '/computer',
        },
        {
          text: 'Resultados',
          href: '/computer/results'
        },
        {
          text: 'Id',
          disabled: true,
        },
      ],
      element: {},
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/`)
      .then((response) => {
        console.log(response)
        this.item = response.data
        this.breadcrumbs[4].text = this.item.name
      })
      .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
      })
  },
}
</script>
