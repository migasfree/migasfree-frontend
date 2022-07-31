<template>
  <q-btn-dropdown ref="userAccount" flat stretch>
    <template #label>
      <q-icon :name="modelIcon('user-profiles')" />
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
          >
          </q-select>
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
          >
          </q-select>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

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
    const languages = reactive([])
    const currentLanguage = ref(gettext.available[gettext.current])
    const domainPreference = reactive({
      id: 0,
      name: $gettext('All').toUpperCase(),
    })
    const scopePreference = reactive({
      id: 0,
      name: $gettext('All').toLowerCase(),
    })

    Object.entries(gettext.available).map(([label, value]) => {
      languages.push({ label, value })
    })

    onMounted(async () => {
      if (authStore.user.domain_preference)
        domainPreference = authStore.user.domain_preference

      if (authStore.user.scope_preference && authStore.user.scope_preference.id)
        scopePreference = authStore.user.scope_preference
    })

    const logout = () => {
      authStore.logout().then(() => {
        router.push({ name: 'login' })
      })
    }

    const changeAppLanguage = () => {
      if (gettext.current !== currentLanguage.value.label) {
        gettext.current = currentLanguage.value.label
        $q.cookies.set('language', gettext.current)
      }
    }

    const updateDomainPreference = async () => {
      console.log('updateDomainPreference', domainPreference, authStore.domains)
      await updatePreferences({
        domain_preference: domainPreference.id ? domainPreference.id : null,
        scope_preference: null,
      })
    }

    const updateScopePreference = async () => {
      await updatePreferences({
        scope_preference: scopePreference.id ? scopePreference.id : null,
      })
      if (scopePreference.id) {
        authStore.loadScopes()
      }
    }

    const updatePreferences = async (data) => {
      console.log('updatePreferences', data)
      await api
        .patch(`/api/v1/token/user-profiles/${authStore.user.id}/`, data)
        .then((response) => {
          uiStore.notifySuccess($gettext('Preferences changed!'))

          authStore.setUser(response.data)
          userAccount.value.hide()

          // FIXME find more elegant way to refresh route
          router.go({
            path: router.path,
            query: {
              t: +new Date(),
            },
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    return {
      userAccount,
      languages,
      currentLanguage,
      domains: authStore.domains,
      domainPreference,
      scopePreference,
      user: authStore.user,
      filteredScopes: authStore.filteredScopes,
      logout,
      changeAppLanguage,
      updateDomainPreference,
      updateScopePreference,
      modelIcon,
    }
  },
}
</script>
