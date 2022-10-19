<template>
  <q-btn-dropdown ref="userAccount" flat stretch>
    <template #label>
      <q-icon :name="modelIcon('user-profiles')" />
      <q-tooltip>
        <translate>User Account</translate>
      </q-tooltip>
    </template>
    <q-list>
      <q-item>
        <q-tooltip><translate>User</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon name="mdi-account" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ user.username }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="organization">
        <q-tooltip><translate>Organization</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon name="mdi-bank" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ organization }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item>
        <q-tooltip><translate>Change App Language</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon name="mdi-earth" />
        </q-item-section>

        <q-item-section>
          <q-select
            v-model="currentLanguage"
            standout
            :options="languages"
            option-value="label"
            option-label="value"
            :dense="true"
            :options-dense="true"
            @update:model-value="changeAppLanguage"
          />
        </q-item-section>
      </q-item>

      <q-item>
        <q-tooltip><translate>Change Domain</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon :name="modelIcon('domains')" />
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
            @update:model-value="updateDomainPreference"
          />
        </q-item-section>
      </q-item>

      <q-item>
        <q-tooltip><translate>Change Scope</translate></q-tooltip>

        <q-item-section avatar>
          <q-icon :name="modelIcon('scopes')" />
        </q-item-section>

        <q-item-section>
          <q-select
            v-model="scopePreference"
            standout
            :options="filteredScopes"
            option-value="id"
            option-label="name"
            :dense="true"
            :options-dense="true"
            @update:model-value="updateScopePreference"
          />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'
import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'

import { modelIcon } from 'composables/element'

export default {
  name: 'UserAccount',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { $gettext } = useGettext()
    const authStore = useAuthStore()
    const uiStore = useUiStore()

    const userAccount = ref(null)
    const user = ref(authStore.user)
    const organization = ref(authStore.server.organization)
    const languages = ref([])
    const currentLanguage = ref(gettext.available[gettext.current])
    const domainPreference = ref(
      authStore.user.domain_preference || {
        id: 0,
        name: $gettext('All').toUpperCase(),
      }
    )
    const scopePreference = ref(
      authStore.user.scope_preference || {
        id: 0,
        name: $gettext('All').toLowerCase(),
      }
    )

    const logout = () => {
      authStore.logout().then(() => {
        router.push({ name: 'login' })
      })
    }

    const changeAppLanguage = () => {
      if (gettext.current !== currentLanguage.value.label) {
        gettext.current = currentLanguage.value.label
        $q.cookies.set('language', currentLanguage.value.label)
      }

      window.location.reload(true)
    }

    const updateDomainPreference = async () => {
      await updatePreferences({
        domain_preference: domainPreference.value.id
          ? domainPreference.value.id
          : null,
        scope_preference: null,
      })
    }

    const updateScopePreference = async () => {
      await updatePreferences({
        scope_preference: scopePreference.value.id
          ? scopePreference.value.id
          : null,
      })
      if (scopePreference.value.id) {
        authStore.loadScopes()
      }
    }

    const updatePreferences = async (data) => {
      await api
        .patch(`/api/v1/token/user-profiles/${authStore.user.id}/`, data)
        .then((response) => {
          uiStore.notifySuccess($gettext('Preferences changed!'))

          authStore.setUser(response.data)
          userAccount.value.hide()

          window.location.reload(true)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    authStore.$subscribe((mutation, state) => {
      user.value = authStore.user

      if (authStore.user.domain_preference)
        domainPreference.value = authStore.user.domain_preference

      if (authStore.user.scope_preference && authStore.user.scope_preference.id)
        scopePreference.value = authStore.user.scope_preference
    })

    onMounted(async () => {
      Object.entries(gettext.available).map(([label, value]) => {
        languages.value.push({ label, value })
      })
    })

    return {
      userAccount,
      languages,
      currentLanguage,
      domains: authStore.domains,
      domainPreference,
      scopePreference,
      user,
      organization,
      filteredScopes: authStore.filteredScopes,
      logout,
      changeAppLanguage,
      updateDomainPreference,
      updateScopePreference,
      updatePreferences,
      modelIcon,
    }
  },
}
</script>
