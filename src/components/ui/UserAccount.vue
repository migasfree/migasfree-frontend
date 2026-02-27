<template>
  <q-btn-dropdown
    ref="userAccount"
    flat
    no-caps
    dense
    class="app-user-dropdown"
    content-class="app-user-menu"
    dropdown-icon="expand_more"
    :aria-label="$gettext('User account menu')"
  >
    <template #label>
      <div class="user-pill">
        <q-avatar size="24px" text-color="white" class="user-avatar-icon">
          <q-icon name="mdi-account" size="18px" aria-hidden="true" />
        </q-avatar>
        <span class="username-text gt-xs">{{ user.username }}</span>
      </div>
    </template>

    <q-list>
      <!-- User Header -->
      <div class="user-header">
        <q-avatar size="48px" class="user-avatar-large">
          <q-icon :name="modelIcon('users')" size="32px" aria-hidden="true" />
        </q-avatar>
        <div class="user-info">
          <div class="user-name">{{ user.username }}</div>
          <div class="user-role">{{ $gettext('User') }}</div>
        </div>
        <q-btn
          flat
          round
          dense
          color="primary"
          icon="mdi-account-edit"
          :to="{ name: 'user-profile-detail', params: { id: user.id } }"
        >
          <q-tooltip>{{ $gettext('Profile') }}</q-tooltip>
        </q-btn>
      </div>

      <q-separator class="menu-separator" />

      <!-- Organization -->
      <template v-if="organization">
        <q-item class="info-item">
          <q-item-section avatar>
            <q-icon
              :name="appIcon('organization')"
              size="20px"
              class="opacity-70"
              aria-hidden="true"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-caption text-uppercase ls-1 opacity-50">
              {{ $gettext('Organization') }}
            </q-item-label>
            <q-item-label
              class="text-subtitle2 text-weight-bold menu-info-value"
            >
              {{ organization }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="menu-separator" />
      </template>

      <!-- Preferences -->
      <div class="section-title text-weight-bold opacity-50">
        {{ $gettext('Preferences') }}
      </div>

      <!-- Language -->
      <q-item class="pref-item">
        <q-tooltip>{{ $gettext('Change App Language') }}</q-tooltip>
        <q-item-section avatar>
          <q-icon :name="appIcon('language')" size="20px" aria-hidden="true" />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="currentLanguage"
            :options="languages"
            v-bind="selectBaseProps"
            @update:model-value="changeAppLanguage"
          >
            <template #selected-item="scope">
              <span class="text-weight-bold">{{ scope.opt.label }}</span>
            </template>
          </q-select>
        </q-item-section>
      </q-item>

      <!-- Domain -->
      <q-item class="pref-item">
        <q-tooltip>{{ $gettext('Change Domain') }}</q-tooltip>
        <q-item-section avatar>
          <q-icon :name="modelIcon('domains')" size="20px" aria-hidden="true" />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="domainPreference"
            :options="domains"
            v-bind="selectBaseProps"
            option-value="id"
            option-label="name"
            @update:model-value="updateDomainPreference"
          />
        </q-item-section>
      </q-item>

      <!-- Scope -->
      <q-item class="pref-item">
        <q-tooltip>{{ $gettext('Change Scope') }}</q-tooltip>
        <q-item-section avatar>
          <q-icon :name="modelIcon('scopes')" size="20px" aria-hidden="true" />
        </q-item-section>
        <q-item-section>
          <q-select
            v-model="scopePreference"
            :options="filteredScopes"
            v-bind="selectBaseProps"
            option-value="id"
            option-label="name"
            @update:model-value="updateScopePreference"
          />
        </q-item-section>
      </q-item>

      <q-separator class="menu-separator" />

      <!-- Actions -->
      <q-item
        v-close-popup
        clickable
        class="action-item"
        :to="{ name: 'user-profile-change-password', params: { id: user.id } }"
      >
        <q-item-section avatar>
          <q-icon :name="appIcon('password')" size="20px" aria-hidden="true" />
        </q-item-section>
        <q-item-section>{{ $gettext('Change Password') }}</q-item-section>
      </q-item>

      <q-item v-close-popup clickable class="logout-item" @click="logout">
        <q-item-section avatar>
          <q-icon
            :name="appIcon('logout')"
            size="20px"
            color="negative"
            aria-hidden="true"
          />
        </q-item-section>
        <q-item-section class="text-negative text-weight-bold">
          {{ $gettext('Logout') }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'
import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'

import { appIcon, modelIcon } from 'composables/element'

const $q = useQuasar()
const router = useRouter()
const { $gettext } = useGettext()
const authStore = useAuthStore()
const uiStore = useUiStore()

const userAccount = ref(null)
const { user } = storeToRefs(authStore)
const currentLanguage = ref(gettext.current)

const defaultPreference = (pref, fallbackName) =>
  pref || { id: 0, name: fallbackName }

const domainPreference = ref(
  defaultPreference(
    user.value.domain_preference,
    $gettext('All').toUpperCase(),
  ),
)
const scopePreference = ref(
  defaultPreference(user.value.scope_preference, $gettext('All').toLowerCase()),
)

// Shared props for all preference q-selects
const selectBaseProps = {
  dense: true,
  borderless: true,
  emitValue: true,
  mapOptions: true,
  class: 'pref-select',
  popupContentClass: 'app-select-menu',
}

const languages = computed(() =>
  Object.entries(gettext.available).map(([value, label]) => ({ label, value })),
)

const organization = computed(() => authStore.server.organization)
const domains = computed(() => authStore.domains)
const filteredScopes = computed(() => authStore.filteredScopes)

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}

const changeAppLanguage = (val) => {
  if (gettext.current !== val) {
    gettext.current = val
    $q.cookies.set('language', val)
    window.location.reload(true)
  }
}

const updatePreferences = async (payload, postAction) => {
  try {
    const { data } = await api.patch(
      `/api/v1/token/user-profiles/${user.value.id}/`,
      payload,
    )
    uiStore.notifySuccess($gettext('Preferences changed!'))
    authStore.setUser(data)
    userAccount.value.hide()
    if (postAction) postAction()
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const updateDomainPreference = (val) =>
  updatePreferences({
    domain_preference: (typeof val === 'object' ? val?.id : val) || null,
    scope_preference: null,
  })

const updateScopePreference = (val) => {
  const scopeId = (typeof val === 'object' ? val?.id : val) || null
  updatePreferences({ scope_preference: scopeId }, () => {
    if (scopeId) authStore.loadScopes()
  })
}

defineExpose({ updatePreferences })

// Sync local refs when store user changes
watch(
  () => user.value?.domain_preference,
  (val) => {
    domainPreference.value = defaultPreference(
      val,
      $gettext('All').toUpperCase(),
    )
  },
  { deep: true },
)

watch(
  () => user.value?.scope_preference,
  (val) => {
    scopePreference.value = defaultPreference(
      val,
      $gettext('All').toLowerCase(),
    )
  },
  { deep: true },
)
</script>

<style scoped>
.app-user-dropdown {
  margin: 0 4px;
}

/* User Pill (toolbar trigger) */
.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px 4px 6px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 32px;
  transition: all 0.3s ease;
  color: white;
}

.app-user-dropdown:hover .user-pill {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.username-text {
  font-size: 0.85rem;
  font-weight: 600;
}

.user-avatar-icon {
  background: rgba(255, 255, 255, 0.15) !important;
}

.user-avatar-large {
  background: var(--neutral-100) !important;
  color: var(--brand-primary) !important;
}

/* Menu content */
.user-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.user-role {
  font-size: 0.8rem;
  opacity: 0.6;
}

.menu-separator {
  margin: 8px 16px;
  opacity: 0.5;
}

.section-title {
  padding: 12px 24px 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-item {
  padding: 8px 24px;
  min-height: 48px;
}

.pref-item {
  padding: 4px 24px;
}

.pref-select {
  font-size: 0.9rem;
  font-weight: 600;
}

.action-item,
.logout-item {
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.9rem;
}

.action-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.logout-item:hover {
  background: var(--error-surface) !important;
}

:deep(.q-btn-dropdown__arrow) {
  margin-left: 2px;
  opacity: 0.7;
}

/* --- Dark Mode --- */
[data-theme='dark'] .user-avatar-large {
  background: rgba(255, 255, 255, 0.1) !important;
  color: var(--text-main) !important;
}

[data-theme='dark'] .menu-info-value {
  color: var(--text-main);
}

[data-theme='dark'] .action-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>

<style>
/* Portal styles (teleported menus outside scoped boundary) */
.app-user-menu {
  background: rgba(var(--bg-card-rgb), 0.9) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 16px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  margin-top: 8px !important;
  min-width: 280px !important;
  color: var(--text-main);
  padding: 8px 0 !important;
}

/* Fix padding for label-less selects inside the user menu */
.app-user-menu .q-field__native,
.app-user-menu .q-field__input {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.app-user-menu .q-field__control {
  min-height: 32px !important;
}

/* Select dropdown popup */
.app-select-menu {
  background: rgba(var(--bg-card-rgb), 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px !important;
  border: 1px solid var(--border);
  color: var(--text-main);
}

.app-select-menu .q-item {
  font-weight: 500;
}

.app-select-menu .q-item--active {
  color: var(--brand-primary) !important;
  background: var(--neutral-100) !important;
}

/* Dark Mode: Portals */
[data-theme='dark'] .app-select-menu .q-item--active {
  color: var(--brand-tertiary) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}
</style>
