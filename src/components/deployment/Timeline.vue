<template>
  <div class="q-pa-md q-gutter-sm">
    <q-circular-progress
      v-if="showing.schedule"
      show-value
      class="text-positive q-ma-md"
      :value="showing.schedule.percent"
      size="70px"
      :thickness="0.1"
      color="positive"
      track-color="grey-3"
    >
      <q-tooltip
        >{{ $gettext('Start') }}: {{ showing.schedule.begin_date }}<br />{{
          $gettext('End')
        }}: {{ showing.schedule.end_date }}</q-tooltip
      >
      <q-icon name="mdi-calendar-start" class="q-mr-xs" />
      {{ showing.schedule.percent }} %
    </q-circular-progress>

    <q-circular-progress
      show-value
      class="q-ma-md"
      color="positive"
      track-color="grey-3"
      size="70px"
      :thickness="0.1"
      :min="0"
      :max="showing.computers.assigned"
      :value="showing.computers.ok + showing.computers.error"
    >
      <q-icon name="mdi-desktop-classic" class="q-mr-xs" />
      {{ showing.computers.ok + showing.computers.error }}/<q-btn
        flat
        padding="xs"
        color="primary"
        :label="showing.computers.assigned"
        :disabled="loading"
        :loading="loading"
        @click="goToComputers"
        ><q-tooltip anchor="top middle" self="bottom middle">{{
          $gettext('View assigned Computers')
        }}</q-tooltip></q-btn
      >
      <q-tooltip
        >{{ $gettext('OK Computers') }}: {{ showing.computers.ok }}<br />{{
          $gettext('Computers with any error')
        }}: {{ showing.computers.error }}</q-tooltip
      >
    </q-circular-progress>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    value: {
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
      loading: false,
      showing: this.value
    }
  },
  watch: {
    value: {
      handler: function(val, oldVal) {
        this.showing = val
      },
      deep: true
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
