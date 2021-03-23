<template>
  <q-btn-dropdown ref="userAccount" flat stretch>
    <template #label>
      <q-icon name="mdi-account-cog" />
      <q-tooltip>
        <translate>User Account</translate>
      </q-tooltip>
    </template>
    <q-list>
      <q-item-label v-translate="{ name: user.username || '' }" header
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
            :loading="isLoadingDomain"
            @input="updateDomainPreference"
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
            :loading="isLoadingScope"
            @input="updateScopePreference"
          >
          </q-select>
        </q-item-section>
      </q-item>

      <q-item
        v-close-popup
        clickable
        :to="{ name: 'user-profile-change-password', params: { id: user.id } }"
      >
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
      scopePreference: { id: 0, name: this.$gettext('All').toLowerCase() },
      isLoadingDomain: false,
      isLoadingScope: false
    }
  },
  computed: {
    user() {
      return this.$store.getters['auth/user']
    }
  },
  async mounted() {
    this.isLoadingDomain = true
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
      .finally(() => (this.isLoadingDomain = false))

    const scopeParams = {
      user: this.user.id
    }
    if (this.user.domain_preference) {
      this.domainPreference = this.user.domain_preference
      scopeParams.domain__id = this.domainPreference.id
    }

    this.isLoadingScope = true
    await this.$axios
      .get(`/api/v1/token/scopes/`, scopeParams)
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
      .finally(() => (this.isLoadingScope = false))

    if (this.user.scope_preference && this.user.scope_preference.id)
      this.scopePreference = this.user.scope_preference
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    },

    async updateDomainPreference() {
      await this.updatePreferences({
        domain_preference: this.domainPreference.id
          ? this.domainPreference.id
          : null,
        scope_preference: null
      })
    },

    async updateScopePreference() {
      await this.updatePreferences({
        scope_preference: this.scopePreference.id
          ? this.scopePreference.id
          : null
      })
    },

    async updatePreferences(data) {
      await this.$axios
        .patch(`/api/v1/token/user-profiles/${this.user.id}/`, data)
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
