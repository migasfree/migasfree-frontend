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
          @click="toggleLeftDrawer"
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
            <img src="../assets/migasfree-logo-mini.svg" alt="migasfree logo" />
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
import { defineComponent, ref, computed } from 'vue'
import { useMeta } from 'quasar'

import AppMenu from 'components/ui/AppMenu'
import AppFooter from 'components/ui/AppFooter'
import Alerts from 'components/ui/Alerts'
import SearchBox from 'components/ui/SearchBox'
import UserAccount from 'components/ui/UserAccount'
import ToggleDarkMode from 'components/ui/ToggleDarkMode'

import { useAuthStore } from 'stores/auth'

export default defineComponent({
  name: 'MainLayout',

  components: {
    AppMenu,
    Alerts,
    AppFooter,
    SearchBox,
    UserAccount,
    ToggleDarkMode,
  },

  setup() {
    const authStore = useAuthStore()

    const leftDrawerOpen = ref(false)
    const userAccount = ref(null)

    useMeta({
      titleTemplate: (title) => `${title} | Migasfree`,
    })

    const hasDomainOrScopePreference = computed(() => {
      if ('domain_preference' in authStore.user)
        return (
          authStore.user.domain_preference !== null ||
          authStore.user.scope_preference !== null
        )

      return false
    })

    const domainPreference = computed(() => {
      return authStore.user.domain_preference
        ? authStore.user.domain_preference.name
        : null
    })

    const scopePreference = computed(() => {
      return authStore.user.scope_preference
        ? authStore.user.scope_preference.name
        : null
    })

    const removeDomainPreference = async () => {
      await userAccount.value.updatePreferences({
        domain_preference: null,
      })
    }

    const removeScopePreference = async () => {
      await userAccount.value.updatePreferences({
        scope_preference: null,
      })
    }

    return {
      leftDrawerOpen,
      userAccount,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      loggedIn: authStore.loggedIn,
      hasDomainOrScopePreference,
      domainPreference,
      scopePreference,
      removeDomainPreference,
      removeScopePreference,
    }
  },
})
</script>
