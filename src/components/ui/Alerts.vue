<template>
  <q-btn-dropdown v-if="isAlertsVisible" flat stretch @click="loadAlerts">
    <template #label>
      <q-icon name="mdi-bell" />
      <q-chip :label="totalAlerts" />
      <q-tooltip>
        <translate>Alerts</translate>
      </q-tooltip>
    </template>
    <q-list v-if="alerts">
      <q-item
        v-for="(item, index) in alerts"
        :key="index"
        v-close-popup
        clickable
        :to="resolveAlertLink(item.api)"
      >
        <q-item-section avatar>
          <q-icon :name="target(item.target)" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.msg }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-chip
            :label="item.result"
            :color="level(item.level)"
            text-color="white"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
export default {
  name: 'Alerts',
  data() {
    return {
      alerts: [],
      totalAlerts: 0
    }
  },
  computed: {
    loggedIn() {
      return this.$store.getters['auth/loggedIn']
    },
    isAlertsVisible() {
      return this.loggedIn && this.alerts.length > 0
    }
  },
  watch: {
    loggedIn(newValue, oldValue) {
      if (newValue) this.loadAlerts()
    }
  },
  async mounted() {
    if (this.loggedIn) {
      await this.loadAlerts()
    }
  },
  methods: {
    async loadAlerts() {
      await this.$axios
        .get('/api/v1/token/stats/alerts/')
        .then((response) => {
          this.alerts = response.data.filter(
            (item) => parseInt(item.result) > 0
          )
          this.totalAlerts = this.alerts.reduce(
            (accumulator, current) => accumulator + parseInt(current.result),
            0
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    target(value) {
      return value === 'computer' ? 'mdi-laptop' : 'mdi-cloud'
    },

    level(value) {
      if (value === 'critical') return 'negative'

      return value
    },

    resolveAlertLink(value) {
      let query = {}
      if ('query' in value) {
        Object.entries(value.query).forEach(([key, value]) => {
          if (typeof value === 'boolean') query[key] = value.toString()
          else query[key] = value
        })
      }

      if ('model' in value) {
        switch (value.model) {
          case 'errors':
            return { name: 'errors-list', query }
          case 'faults':
            return { name: 'faults-list', query }
          case 'notifications':
            return { name: 'notifications-list', query }
          case 'packages':
            return { name: 'packages-list', query }
          case 'deployments':
            return { name: 'deployments-list', query }
          case 'messages':
            return { name: 'messages-list', query }
        }
      }
      return value
    }
  }
}
</script>
