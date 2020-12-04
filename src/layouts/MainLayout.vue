<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-brown-7">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-btn stretch flat label="migasfree" to="/" no-caps size="22px" />

        <SearchBox />

        <q-space />

        <q-btn-dropdown v-if="isAlertsVisible" flat stretch>
          <template #label>
            <q-icon name="mdi-bell" />
            <q-chip :label="totalAlerts" />
            <q-tooltip>
              Alertas
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

        <q-btn-dropdown v-if="loggedIn" flat stretch>
          <template #label>
            <q-icon name="mdi-account" />
            <q-tooltip>
              Cuenta de usuario
            </q-tooltip>
          </template>
          <q-list>
            <q-item-label header>Usuario: {{ username }}</q-item-label>
            <q-separator />
            <q-item v-close-popup clickable to="#">
              <q-item-section avatar>
                <q-icon name="mdi-account-key" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cambiar contraseña</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="logout">
              <q-item-section avatar>
                <q-icon name="mdi-power-standby" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Terminar sesión</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          v-else
          flat
          stretch
          text-color="white"
          icon="mdi-account-arrow-right"
          to="/login"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <AppMenu />
    </q-drawer>

    <q-page-container>
      <router-view />

      <q-page-scroller
        position="bottom-right"
        :offset="[10, 10]"
        :scroll-offset="300"
      >
        <q-btn fab icon="mdi-chevron-up" color="primary" />
      </q-page-scroller>
    </q-page-container>

    <AppFooter />
  </q-layout>
</template>

<script>
import AppMenu from 'components/ui/AppMenu'
import AppFooter from 'components/ui/AppFooter'
import SearchBox from 'components/ui/SearchBox'

export default {
  name: 'MainLayout',
  meta: {
    titleTemplate: (title) => `${title} | Migasfree`
  },
  components: { AppMenu, AppFooter, SearchBox },
  data() {
    return {
      leftDrawerOpen: false,
      alerts: [],
      totalAlerts: 0
    }
  },
  computed: {
    username() {
      const user = this.$store.getters['auth/user']
      if (user.username) return user.username

      return ''
    },
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
    if (this.loggedIn) await this.loadAlerts()
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    },

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
      if (value.startsWith('{')) {
        const parsedValue = JSON.parse(value)
        if ('model' in parsedValue) {
          switch (parsedValue.model) {
            case 'errors':
              return { name: 'errors-list', query: parsedValue.query }
            case 'faults':
              return { name: 'faults-list', query: parsedValue.query }
          }
        }
      }
      return value
    }
  }
}
</script>
