<template>
  <q-layout view="hHh Lpr lFf">
    <q-header>
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
          <q-avatar>
            <img
              id="logo"
              src="../assets/migasfree-logo.svg"
              alt="migasfree logo"
            />
          </q-avatar>
          <q-tooltip
            >{{ $gettext('Dashboard') }}
            <template v-if="organization"
              >[{{ organization }}]</template
            ></q-tooltip
          >
        </q-btn>

        <SearchBox />

        <q-space />

        <ToggleFullScreen />

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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      mini-to-overlay
      bordered
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <AppMenu />
    </q-drawer>

    <q-page-container>
      <q-banner v-if="hasDomainOrScopePreference" class="bg-warning text-black">
        <template #avatar>
          <q-icon name="mdi-alert-outline" />
        </template>
        {{
          $gettext(
            'You have established a domain or a scope in the preferences',
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
          <q-tooltip>{{ $gettext('Domain') }}</q-tooltip
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
          <q-tooltip>{{ $gettext('Scope') }}</q-tooltip
          >{{ scopePreference }}</q-chip
        >
      </q-banner>

      <router-view />

      <q-page-scroller
        position="bottom-right"
        reverse
        :offset="[10, 10]"
        :scroll-offset="0"
      >
        <q-btn fab icon="mdi-chevron-down" color="primary" />
      </q-page-scroller>

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
import { defineComponent, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMeta } from 'quasar'

import AppMenu from 'components/ui/AppMenu'
import AppFooter from 'components/ui/AppFooter'
import Alerts from 'components/ui/Alerts'
import SearchBox from 'components/ui/SearchBox'
import UserAccount from 'components/ui/UserAccount'
import ToggleDarkMode from 'components/ui/ToggleDarkMode'
import ToggleFullScreen from 'components/ui/ToggleFullScreen'

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
    ToggleFullScreen,
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const leftDrawerOpen = ref(false)
    const miniState = ref(true)
    const userAccount = ref(null)

    const { loggedIn, user, server } = storeToRefs(authStore)

    useMeta({
      titleTemplate: (title) => `${title} | Migasfree`,
    })

    const hasDomainOrScopePreference = computed(() => {
      if ('domain_preference' in user.value)
        return (
          user.value.domain_preference !== null ||
          user.value.scope_preference !== null
        )

      return false
    })

    const domainPreference = computed(() => {
      return user.value.domain_preference
        ? user.value.domain_preference.name
        : null
    })

    const scopePreference = computed(() => {
      return user.value.scope_preference
        ? user.value.scope_preference.name
        : null
    })

    const organization = computed(() => {
      return server.value.organization
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

    watch(organization, (newVal) => {
      if (newVal !== undefined)
        useMeta({
          titleTemplate: (title) => `${title} | Migasfree @ ${newVal}`,
        })
    })

    watch(loggedIn, (newValue) => {
      if (!newValue) router.push({ name: 'login' })
    })

    return {
      leftDrawerOpen,
      miniState,
      userAccount,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      loggedIn,
      organization,
      hasDomainOrScopePreference,
      domainPreference,
      scopePreference,
      removeDomainPreference,
      removeScopePreference,
    }
  },
})
</script>

<style scoped>
#logo {
  width: 24px;
}
</style>
