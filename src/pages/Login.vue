<template>
  <q-page class="flex bg-image flex-center">
    <q-card
      flat
      bordered
      :style="$q.screen.lt.sm ? { width: '70%' } : { width: '40%' }"
    >
      <q-card-section>
        <q-avatar
          size="120px"
          class="absolute-center shadow-10"
          :color="$q.dark.isActive ? 'blue-grey-9' : 'white'"
        >
          <img
            id="logo"
            src="../assets/migasfree-logo.svg"
            alt="migasfree logo"
            title="migasfree logo"
          />
        </q-avatar>
      </q-card-section>

      <q-card-section class="text-center">
        <div class="q-pt-xl text-subtitle2 text-grey-7">We ❤️ Change</div>
        <div class="q-pt-lg">
          <div class="col text-h6 ellipsis">
            {{ $gettext('Log in') }} @ migasfree<br />
            <q-chip
              v-if="organization"
              color="grey-4"
              text-color="black"
              size="lg"
              class="q-ml-sm"
            >
              <q-icon name="mdi-bank" left />
              {{ organization }}
              <q-tooltip>{{ $gettext('Organization') }}</q-tooltip>
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="login">
          <q-input
            v-model="model.username"
            autofocus
            lazy-rules
            outlined
            :label="$gettext('User')"
            :aria-label="$gettext('User')"
            :rules="[(val) => !!val || $gettext('* Required')]"
          >
            <template #prepend>
              <q-icon :name="modelIcon('users')" />
            </template>
          </q-input>

          <q-input
            id="password"
            v-model="model.password"
            lazy-rules
            outlined
            counter
            :label="$gettext('Password')"
            :aria-label="$gettext('Password')"
            :rules="[
              (val) => !!val || $gettext('* Required'),
              (val) =>
                val.length >= MIN_PASSWORD_LEN ||
                $gettextInterpolate(
                  $gettext('Please use minimum %{n} characters'),
                  {
                    n: MIN_PASSWORD_LEN,
                  },
                ),
            ]"
            :type="showPassword ? 'text' : 'password'"
          >
            <template #prepend>
              <q-icon name="mdi-lock" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click="showPassword = !showPassword"
              />
              <q-tooltip>{{ $gettext('Show / hide password') }}</q-tooltip>
            </template>
          </q-input>

          <div>
            <q-btn
              class="full-width"
              type="submit"
              color="primary"
              size="lg"
              :loading="loading"
              :disabled="!isValid"
              :label="
                isValid
                  ? $gettext('Log In')
                  : $gettext('Please enter your credentials')
              "
              :aria-disabled="!isValid"
              :aria-label="
                isValid
                  ? $gettext('Log In')
                  : $gettext('Please enter your credentials')
              "
            />
          </div>
        </q-form>

        <q-toolbar class="q-pa-md">
          <q-btn-dropdown ref="changeLanguage" flat stretch>
            <template #label>
              <q-icon :name="appIcon('language')" />
              <q-tooltip>
                {{ $gettext('Change App Language') }}
              </q-tooltip>
            </template>
            <q-list>
              <q-item
                v-for="(language, key) in $language.available"
                :key="key"
                :active="key === $language.current"
                clickable
                @click="changeAppLanguage(key)"
              >
                {{ language }}
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-space />

          <ToggleDarkMode />
        </q-toolbar>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'
import { gettext } from 'boot/gettext'
import { MIN_PASSWORD_LEN } from 'config/app.conf'

import ToggleDarkMode from 'components/ui/ToggleDarkMode'

import { appIcon, modelIcon } from 'composables/element'

export default {
  name: 'Login',
  components: { ToggleDarkMode },
  setup() {
    const $q = useQuasar()
    const { $gettext } = useGettext()
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const uiStore = useUiStore()

    useMeta({ title: $gettext('Log In') })

    const loading = ref(false)
    const showPassword = ref(false)
    const model = reactive({ username: '', password: '' })
    const changeLanguage = ref(null)

    const { server } = storeToRefs(authStore)

    const isValid = computed(() => {
      return (
        model.username.trim() !== '' && model.password.length > MIN_PASSWORD_LEN
      )
    })

    const organization = computed(() => {
      return server.value?.organization || ''
    })

    const login = async () => {
      loading.value = true
      authStore.reset()
      await authStore
        .login(model)
        .then(() => {
          if (route.query.nextUrl != null) {
            router.push(route.query.nextUrl)
          } else {
            router.push({ name: 'home' })
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    }

    const changeAppLanguage = (key) => {
      if (gettext.current !== key) {
        gettext.current = key
        $q.cookies.set('language', key)
      }
      changeLanguage.value.hide()
    }

    onMounted(async () => {
      await authStore.getServerInfo()
    })

    return {
      MIN_PASSWORD_LEN,
      loading,
      organization,
      showPassword,
      model,
      changeLanguage,
      isValid,
      login,
      changeAppLanguage,
      appIcon,
      modelIcon,
    }
  },
}
</script>

<style scoped>
#logo {
  width: 60px;
  height: 90px;
  object-fit: contain;
}

@media (max-width: 1024px) {
  .q-card {
    width: 60% !important;
    padding: 16px;
  }
}
</style>
