<template>
  <q-btn-dropdown ref="userAccount" flat stretch>
    <template #label>
      <q-icon name="mdi-account-cog" />
      <q-tooltip>
        <translate>User Account</translate>
      </q-tooltip>
    </template>
    <q-list>
      <q-item-label v-translate="{ name: username }" header
        >User: %{ name }</q-item-label
      >
      <q-separator />

      <q-item>
        <q-tooltip><translate>Change Domain</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon name="mdi-earth" />
        </q-item-section>

        <q-item-section>
          <q-select
            v-model="domainPreference"
            standout
            :options="domains"
            option-value="id"
            option-label="name"
            :dense="true"
            :options-dense="true"
            @input="updatePreferences"
          >
          </q-select>
        </q-item-section>
      </q-item>

      <q-item>
        <q-tooltip><translate>Change Scope</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon name="mdi-eye-outline" />
        </q-item-section>

        <q-item-section>
          <q-select
            v-model="scopePreference"
            standout
            :options="scopes"
            option-value="id"
            option-label="name"
            :dense="true"
            :options-dense="true"
            @input="updatePreferences"
          >
          </q-select>
        </q-item-section>
      </q-item>

      <q-item v-close-popup clickable to="#">
        <q-item-section avatar>
          <q-icon name="mdi-account-key" />
        </q-item-section>
        <q-item-section>
          <q-item-label v-translate>Change Password</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-close-popup clickable @click="logout">
        <q-item-section avatar>
          <q-icon name="mdi-power-standby" />
        </q-item-section>
        <q-item-section>
          <q-item-label v-translate>Logout</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
export default {
  name: 'UserAccount',
  data() {
    return {
      domains: [{ id: 0, name: this.$gettext('All').toUpperCase() }],
      scopes: [{ id: 0, name: this.$gettext('All').toLowerCase() }],
      domainPreference: { id: 0, name: this.$gettext('All').toUpperCase() },
      scopePreference: { id: 0, name: this.$gettext('All').toLowerCase() }
    }
  },
  computed: {
    username() {
      const user = this.$store.getters['auth/user']
      if (user.username) return user.username

      return ''
    }
  },
  async mounted() {
    await this.$axios
      .get('/api/v1/token/domains/')
      .then((response) => {
        Object.entries(response.data.results).map(([index, item]) => {
          this.domains.push({
            id: item.id,
            name: item.name
          })
        })
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    const user = this.$store.getters['auth/user']
    if (user.domain_preference) this.domainPreference = user.domain_preference

    await this.$axios
      .get(`/api/v1/token/scopes/?user=${user.id}`)
      .then((response) => {
        Object.entries(response.data.results).map(([index, item]) => {
          this.scopes.push({
            id: item.id,
            name: item.name
          })
        })
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })

    if (user.scope_preference) this.scopePreference = user.scope_preference
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    },

    async updatePreferences() {
      const user = this.$store.getters['auth/user']
      await this.$axios
        .patch(`/api/v1/token/user-profiles/${user.id}/`, {
          domain_preference: this.domainPreference.id
            ? this.domainPreference.id
            : null,
          scope_preference: this.scopePreference.id
            ? this.scopePreference.id
            : null
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Preferences changed!')
          )

          this.$store.commit('auth/setUser', response.data)
          this.$refs.userAccount.hide()

          // FIXME find more elegant way to refresh route
          this.$router.go({
            path: this.$router.path,
            query: {
              t: +new Date()
            }
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
