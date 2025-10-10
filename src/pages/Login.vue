<template>
  <q-page class="flex bg-image flex-center">
    <q-card flat :style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }">
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

      <q-card-section>
        <div class="text-center q-pt-lg">
          <div class="col text-h6 ellipsis">
            {{ $gettext('Log in') }} @ migasfree
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
            :rules="[(val) => !!val || $gettext('* Required')]"
          >
            <template #label>
              {{ $gettext('User') }}
            </template>

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
            <template #label>
              {{ $gettext('Password') }}
            </template>

            <template #prepend>
              <q-icon name="mdi-lock" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn
              class="full-width"
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="!isValid"
              :aria-disabled="!isValid"
              :aria-label="
                isValid
                  ? $gettext('Log In')
                  : $gettext('Please enter your credentials')
              "
              >{{ $gettext('Log In') }}</q-btn
            >
          </div>
        </q-form>

        <q-toolbar class="q-pa-md">
          <q-btn-dropdown ref="changeLanguage" flat stretch>
            <template #label>
              <q-icon name="mdi-earth" />
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
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'
import { gettext } from 'boot/gettext'
import { MIN_PASSWORD_LEN } from 'config/app.conf'

import ToggleDarkMode from 'components/ui/ToggleDarkMode'

import { modelIcon } from 'composables/element'

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

    const isValid = computed(() => {
      return (
        model.username.trim() !== '' && model.password.length > MIN_PASSWORD_LEN
      )
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

    return {
      MIN_PASSWORD_LEN,
      loading,
      showPassword,
      model,
      changeLanguage,
      isValid,
      login,
      changeAppLanguage,
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
</style>
