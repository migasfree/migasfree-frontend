<template>
  <q-layout view="hHh Lpr lFf" :data-theme="theme">
    <!-- APP HEADER -->
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          :aria-label="$gettext('Menu')"
          @click="toggleLeftDrawer"
        >
          <q-tooltip>{{ $gettext('Toggle Menu') }}</q-tooltip>
        </q-btn>

        <!-- Brand Logo / Dashboard Link -->
        <q-btn
          stretch
          flat
          no-caps
          :to="{ name: 'home' }"
          class="q-mx-xs brand-toolbar-btn q-px-sm"
        >
          <div class="row items-center no-wrap">
            <span class="brand-text q-mr-sm text-white gt-xs">migasfree</span>
            <img
              src="../assets/migasfree-logo.svg"
              alt="migasfree"
              class="toolbar-logo"
            />
            <span
              v-if="organization"
              class="org-text q-ml-sm text-white gt-min-sm"
            >
              {{ organization }}
            </span>
          </div>
          <q-tooltip>
            {{ $gettext('Dashboard') }}
            <template v-if="organization">[{{ organization }}]</template>
          </q-tooltip>
        </q-btn>

        <!-- Search Box (Hidden on very small screens) -->
        <div class="col q-px-md toolbar-search-container gt-xs">
          <SearchBox />
        </div>

        <q-space />

        <!-- Actions Toolbar -->
        <div class="row items-center q-gutter-x-xs no-wrap">
          <q-btn
            flat
            round
            dense
            icon="mdi-magnify"
            class="lt-sm"
            :aria-label="$gettext('Search')"
          />

          <ToggleFullScreen class="gt-sm" />
          <ToggleDarkMode />

          <Alerts />

          <UserAccount v-if="loggedIn" ref="userAccountRef" />
          <q-btn
            v-else
            flat
            stretch
            text-color="white"
            icon="mdi-account-arrow-right"
            :to="{ name: 'login' }"
            :aria-label="$gettext('Log In')"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- LEFT DRAWER (SIDEBAR) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      mini-to-overlay
      bordered
      class="bg-card"
      @mouseenter="debounceMini(false)"
      @mouseleave="debounceMini(true)"
      @focusin="debounceMini(false)"
      @focusout="debounceMini(true)"
    >
      <AppMenu :mini="miniState" />
    </q-drawer>

    <!-- PAGE CONTAINER -->
    <q-page-container class="bg-body">
      <q-scroll-observer @scroll="onScroll" />

      <!-- Preferences Banner (Glassmorphism Redesign) -->
      <transition
        appear
        enter-active-class="animated fadeInDown"
        leave-active-class="animated fadeOutUp"
      >
        <div
          v-if="hasPreference"
          class="pref-banner glass-panel row items-center q-mx-lg q-mt-md"
        >
          <div class="pref-banner-icon-box flex-center">
            <q-icon :name="appIcon('warning')" size="20px" aria-hidden="true" />
          </div>

          <div class="pref-banner-content col q-px-md">
            {{
              $gettext(
                'You have established a domain or a scope in the preferences',
              )
            }}
          </div>

          <div class="pref-banner-actions row q-gutter-x-sm q-px-md">
            <q-chip
              v-if="domainPreference"
              outline
              dense
              color="warning"
              class="pref-chip"
              :icon="modelIcon('domains')"
              removable
              @remove="removePreference('domain_preference')"
            >
              <q-tooltip>{{ $gettext('Domain') }}</q-tooltip>
              <span class="text-weight-bold">{{ domainPreference }}</span>
            </q-chip>

            <q-chip
              v-if="scopePreference"
              outline
              dense
              color="warning"
              class="pref-chip"
              :icon="modelIcon('scopes')"
              removable
              @remove="removePreference('scope_preference')"
            >
              <q-tooltip>{{ $gettext('Scope') }}</q-tooltip>
              <span class="text-weight-bold">{{ scopePreference }}</span>
            </q-chip>
          </div>
        </div>
      </transition>

      <router-view />

      <!-- SCROLLERS -->
      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
        class="fab-scroller"
      >
        <q-btn
          fab
          icon="mdi-chevron-up"
          color="primary"
          :aria-label="$gettext('Scroll to top')"
        />
      </q-page-scroller>

      <q-page-scroller
        position="bottom-right"
        reverse
        :scroll-offset="20"
        :offset="[18, 18]"
        class="fab-scroller"
      >
        <q-btn
          v-show="scrollPosition < 150"
          fab
          icon="mdi-chevron-down"
          color="primary"
          :aria-label="$gettext('Scroll to bottom')"
        />
      </q-page-scroller>
    </q-page-container>

    <!-- FOOTER -->
    <AppFooter />
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMeta, debounce } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { appIcon, modelIcon } from 'composables/element'

import Alerts from 'components/ui/Alerts.vue'
import UserAccount from 'components/ui/UserAccount.vue'
import SearchBox from 'components/ui/SearchBox.vue'
import AppFooter from 'components/ui/AppFooter.vue'
import AppMenu from 'components/ui/AppMenu.vue'
import ToggleDarkMode from 'components/ui/ToggleDarkMode.vue'
import ToggleFullScreen from 'components/ui/ToggleFullScreen.vue'

defineOptions({ name: 'MainLayout' })

const router = useRouter()
const authStore = useAuthStore()

const { loggedIn, user, server, domains, scopes } = storeToRefs(authStore)

const leftDrawerOpen = ref(false)
const miniState = ref(true)
const userAccountRef = ref(null)
const scrollPosition = ref(0)
const theme = ref(localStorage.getItem('theme') || 'light')

const onScroll = (info) => {
  scrollPosition.value = info.position?.top ?? info.position ?? 0
}

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const debounceMini = debounce((val) => {
  miniState.value = val
}, 200)

// --- Computeds ---

const organization = computed(() => server.value?.organization || '')
const domainPreference = computed(() => {
  const pref = user.value?.domain_preference
  if (!pref) return null
  if (typeof pref === 'object') return pref.name
  return domains.value.find((d) => d.id === pref)?.name || null
})

const scopePreference = computed(() => {
  const pref = user.value?.scope_preference
  if (!pref) return null
  if (typeof pref === 'object') return pref.name
  return scopes.value.find((s) => s.id === pref)?.name || null
})
const hasPreference = computed(
  () => domainPreference.value || scopePreference.value,
)

// --- Actions ---

const removePreference = async (key) => {
  if (userAccountRef.value) {
    await userAccountRef.value.updatePreferences({ [key]: null })
  }
}

// --- Meta & Watchers ---

useMeta(() => ({
  titleTemplate: (title) =>
    `${title} | Migasfree${organization.value ? ` @ ${organization.value}` : ''}`,
}))

watch(loggedIn, (newValue) => {
  if (!newValue) router.push({ name: 'login' })
})

// --- Lifecycle ---

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  document.body.setAttribute('data-theme', theme.value)

  window.addEventListener('theme-changed', (e) => {
    theme.value = e.detail
    document.documentElement.setAttribute('data-theme', theme.value)
    document.body.setAttribute('data-theme', theme.value)
  })
})

onBeforeUnmount(() => {
  debounceMini.cancel()
})
</script>

<style scoped>
/* Preferences Banner */
.pref-banner {
  min-height: 48px;
  padding: 4px;
  border-left: 4px solid var(--warning);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  font-size: 0.9rem;
  overflow: hidden;
  z-index: 10;
}

.pref-banner-icon-box {
  width: 40px;
  height: 40px;
  background: var(--warning-surface);
  color: var(--warning);
  border-radius: 10px;
  margin-left: 2px;
}

.pref-banner-content {
  color: var(--text-warning);
  font-weight: 600;
}

.pref-chip {
  background: rgba(var(--brand-tertiary-rgb), 0.05) !important;
  border-width: 1.5px !important;
  transition: all 0.3s ease;
}

.pref-chip:hover {
  background: rgba(var(--brand-tertiary-rgb), 0.1) !important;
}

.brand-toolbar-btn {
  opacity: 0.9;
  transition: opacity 0.2s;
}
.brand-toolbar-btn:hover {
  opacity: 1;
}

.brand-text {
  font-weight: 300;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.org-text {
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
}

.toolbar-search-container {
  max-width: 600px;
  margin: 0 auto;
}

.fab-scroller {
  z-index: 9998;
}

.toolbar-logo {
  height: 24px;
  width: auto;
}
</style>
