<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          ><q-tooltip>{{ $gettext('Menu') }}</q-tooltip>
        </q-btn>

        <q-btn
          stretch
          flat
          label="migasfree"
          :to="{ name: 'home' }"
          no-caps
          size="22px"
        >
          <q-avatar class="q-pl-sm" size="22px">
            <img src="../assets/mini-logo.svg" alt="migasfree logo" />
          </q-avatar>
          <q-tooltip>{{ $gettext('Dashboard') }}</q-tooltip>
        </q-btn>

        <SearchBox />

        <q-space />

        <ToggleDarkMode />

        <Alerts />

        <UserAccount v-if="loggedIn" ref="userAccount" />
        <q-btn
          v-else
          flat
          stretch
          text-color="white"
          icon="mdi-account-arrow-right"
          :to="{ name: 'login' }"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <AppMenu />
    </q-drawer>

    <q-page-container>
      <q-banner v-if="hasDomainOrScopePreference" class="bg-warning text-black">
        <template #avatar>
          <q-icon name="mdi-alert-outline" />
        </template>
        {{
          $gettext(
            'You have established a domain or a scope in the preferences'
          )
        }}
        <q-chip
          v-if="domainPreference"
          class="q-ml-md"
          color="info"
          icon="mdi-web"
          removable
          @remove="removeDomainPreference"
        >
          <q-tooltip><translate>Domain</translate></q-tooltip
          >{{ domainPreference }}</q-chip
        >
        <q-chip
          v-if="scopePreference"
          class="q-ml-md"
          color="info"
          icon="mdi-eye-outline"
          removable
          @remove="removeScopePreference"
        >
          <q-tooltip><translate>Scope</translate></q-tooltip
          >{{ scopePreference }}</q-chip
        >
      </q-banner>

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
import Alerts from 'components/ui/Alerts'
import SearchBox from 'components/ui/SearchBox'
import UserAccount from 'components/ui/UserAccount'
import ToggleDarkMode from 'components/ui/ToggleDarkMode'

export default {
  name: 'MainLayout',
  meta: {
    titleTemplate: (title) => `${title} | Migasfree`,
  },
  components: {
    AppMenu,
    AppFooter,
    Alerts,
    SearchBox,
    UserAccount,
    ToggleDarkMode,
  },
  data() {
    return {
      leftDrawerOpen: false,
    }
  },
  computed: {
    loggedIn() {
      return this.$store.getters['auth/loggedIn']
    },

    hasDomainOrScopePreference() {
      const user = this.$store.getters['auth/user']

      return user.domain_preference !== null || user.scope_preference !== null
    },

    domainPreference() {
      const user = this.$store.getters['auth/user']

      return user.domain_preference ? user.domain_preference.name : null
    },

    scopePreference() {
      const user = this.$store.getters['auth/user']

      return user.scope_preference ? user.scope_preference.name : null
    },
  },
  methods: {
    async removeDomainPreference() {
      await this.$refs.userAccount.updatePreferences({
        domain_preference: null,
      })
    },

    async removeScopePreference() {
      await this.$refs.userAccount.updatePreferences({
        scope_preference: null,
      })
    },
  },
}
</script>
