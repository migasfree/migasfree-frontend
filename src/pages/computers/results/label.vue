<template>
  <q-card id="label" flat bordered>
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img alt="Migasfree logo" src="~assets/migasfree-logo.svg" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ label.search }}</q-item-label>
          <q-item-label caption>
            {{ label.uuid }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="text-center">
        <q-item-section> Server: {{ server }} </q-item-section>
      </q-item>

      <q-separator inset />

      <q-item class="text-center">
        <q-item-section>
          {{ label.helpdesk }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
export default {
  data() {
    return {
      label: {},
      server: process.env.MIGASFREE_SERVER || 'http://localhost'
    }
  },
  async mounted() {
    await this.$axios
      .get(`/api/v1/token/computers/${this.$route.params.id}/label`)
      .then((response) => {
        this.label = response.data
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
  }
}
</script>

<style scoped>
#label {
  width: 35em;
  border: 1px solid #000 !important;
}
</style>
