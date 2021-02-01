<template>
  <div class="q-pa-md q-gutter-sm">
    <q-circular-progress
      show-value
      class="text-positive q-ma-md"
      :value="data.data.schedule.percent"
      size="70px"
      :thickness="0.1"
      color="positive"
      track-color="grey-3"
    >
      <q-tooltip
        >{{ $gettext('Start') }}: {{ data.data.schedule.begin_date }}<br />{{
          $gettext('End')
        }}: {{ data.data.schedule.end_date }}</q-tooltip
      >
      <q-icon name="mdi-calendar-start" class="q-mr-xs" />
      {{ data.data.schedule.percent }} %
    </q-circular-progress>

    <q-circular-progress
      show-value
      color="positive"
      track-color="grey-3"
      size="70px"
      :thickness="0.1"
      :min="0"
      :max="data.data.computers.assigned"
      :value="data.data.computers.ok + data.data.computers.error"
    >
      <q-icon name="mdi-desktop-classic" class="q-mr-xs" />
      {{ data.data.computers.ok + data.data.computers.error }}/{{
        data.data.computers.assigned
      }}
      <q-tooltip
        >{{ $gettext('OK Computers') }}: {{ data.data.computers.ok }}<br />{{
          $gettext('Computers with any error')
        }}: {{ data.data.computers.error }}</q-tooltip
      >
    </q-circular-progress>
    <q-btn
      v-if="data.data.computers.assigned"
      round
      size="25px"
      icon="mdi-desktop-classic"
      color="primary"
      :disabled="loading"
      :loading="loading"
      @click="goToComputers"
      ><q-tooltip>{{ $gettext('View assigned Computers') }}</q-tooltip></q-btn
    >
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    data: {
      type: Object,
      required: true
    },
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    goToComputers() {
      if (this.id > 0) {
        this.loading = true
        this.$axios
          .get(`/api/v1/token/stats/deployments/${this.id}/computers/assigned/`)
          .then((response) => {
            this.$router.push({
              name: 'computers-list',
              query: { id_in: response.data.join(',') }
            })
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>
