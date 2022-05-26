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
          <q-tooltip>{{ $gettext('Dashboard') }}</q-tooltip>
        </q-btn>

        <SearchBox />

        <q-space />

        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
          @click="toggleDarkMode"
        >
          <q-tooltip>{{
            $q.dark.isActive
              ? $gettext('Switch to Light mode')
              : $gettext('Switch to Dark mode')
          }}</q-tooltip>
        </q-btn>

        <Alerts />

        <UserAccount v-if="loggedIn" />
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

export default {
  name: 'MainLayout',
  meta: {
    titleTemplate: (title) => `${title} | Migasfree`,
  },
  components: { AppMenu, AppFooter, Alerts, SearchBox, UserAccount },
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
  },
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle()
      this.$q.cookies.set('darkMode', this.$q.dark.isActive, { expires: '30d' })
    },
  },
}
</script>
