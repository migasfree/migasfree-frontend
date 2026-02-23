<template>
  <q-page class="login-redesign flex flex-center" :data-theme="theme">
    <!-- Earthy Background Elements -->
    <div class="background-decor">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Main Login Card -->
    <q-card class="panel glass-panel shadow-24 animate-in login-card">
      <q-card-section class="q-px-xl q-py-lg">
        <div class="text-center q-mb-lg">
          <div class="logo-container q-mb-sm">
            <img
              src="../assets/migasfree-logo.svg"
              class="main-logo"
              alt="migasfree logo"
            />
          </div>
          <div class="slogan-text q-mb-md">We ❤️ Change</div>

          <h1 class="text-h5 text-weight-regular text-main m-0">
            {{ $gettext('Log in') }} <span class="opacity-50">@</span> migasfree
          </h1>

          <!-- Subtle Organization Badge -->
          <div v-if="organization" class="q-mt-md">
            <div class="org-badge">
              <q-icon
                :name="appIcon('organization')"
                size="18px"
                class="q-mr-xs"
              />
              <span>{{ organization }}</span>
            </div>
          </div>
        </div>

        <q-form class="q-gutter-y-lg q-mt-md" @submit.prevent="login">
          <div class="input-wrapper">
            <q-input
              ref="primaryInput"
              v-model="model.username"
              autocomplete="username"
              :label="$gettext('User')"
              :aria-label="$gettext('User')"
              color="primary"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            >
              <template #prepend>
                <q-icon :name="modelIcon('users')" />
              </template>
            </q-input>
          </div>

          <div class="input-wrapper">
            <q-input
              id="password"
              v-model="model.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :label="$gettext('Password')"
              :aria-label="$gettext('Password')"
              color="primary"
              lazy-rules
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
            >
              <template #prepend>
                <q-icon name="mdi-lock-outline" />
              </template>
              <template #append>
                <q-icon
                  :name="appIcon(showPassword ? 'show' : 'hide')"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            :label="
              isValid
                ? $gettext('Log In')
                : $gettext('Please enter your credentials')
            "
            :aria-label="
              isValid
                ? $gettext('Log In')
                : $gettext('Please enter your credentials')
            "
            :aria-disabled="!isValid"
            type="submit"
            unelevated
            class="full-width premium-btn q-py-md text-weight-bold"
            :loading="loading"
            :disabled="!isValid"
          >
            <template #loading>
              <q-spinner-dots size="30px" />
            </template>
          </q-btn>
        </q-form>

        <div class="q-mt-lg text-center">
          <div class="row items-center justify-center q-gutter-x-md">
            <!-- Language Selector -->
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              class="opacity-80 q-px-sm"
            >
              <div class="row items-center no-wrap">
                <q-icon :name="appIcon('language')" />
                <q-icon name="mdi-chevron-up" size="18px" class="q-ml-xs" />
              </div>
              <q-menu
                anchor="top middle"
                self="bottom middle"
                content-class="glass-menu"
              >
                <q-list class="lang-list">
                  <q-item
                    v-for="(language, key) in $language.available"
                    :key="key"
                    v-close-popup
                    clickable
                    @click="changeAppLanguage(key)"
                  >
                    <q-item-section
                      :class="{ 'text-weight-bold': key === $language.current }"
                      >{{ language }}</q-item-section
                    >
                    <q-item-section v-if="key === $language.current" side>
                      <q-icon name="mdi-check" color="primary" size="xs" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
              <q-tooltip>{{ $gettext('Change App Language') }}</q-tooltip>
            </q-btn>

            <!-- Using the recently refactored ToggleDarkMode component -->
            <ToggleDarkMode class="opacity-80" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Footer Credits -->
    <div
      class="absolute-bottom text-center q-pb-md footer-credits row items-center justify-center"
    >
      <q-icon :name="appIcon('copyright')" size="16px" />
      <span class="text-weight-medium q-ml-xs q-mr-sm">
        {{ MIGASFREE_MIN_YEAR }}-{{ new Date().getFullYear() }}
      </span>
      <q-btn
        flat
        dense
        label="migasfree"
        type="a"
        href="https://migasfree.org/"
        no-caps
        size="15px"
        class="footer-link-btn"
      >
        <q-tooltip>{{ $gettext('Website') }}</q-tooltip>
      </q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'
import { gettext } from 'boot/gettext'
import { MIN_PASSWORD_LEN, MIGASFREE_MIN_YEAR } from 'config/app.conf'

import ToggleDarkMode from 'components/ui/ToggleDarkMode.vue'
import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

const $q = useQuasar()
const { $gettext } = useGettext()
const { inputRef: primaryInput } = useAutoFocus()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

useMeta({ title: $gettext('Log In') })

const loading = ref(false)
const showPassword = ref(false)
const model = reactive({ username: '', password: '' })
const theme = ref(localStorage.getItem('theme') || 'light')

const { server } = storeToRefs(authStore)

const isValid = computed(() => {
  return (
    model.username.trim() !== '' && model.password.length >= MIN_PASSWORD_LEN
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
}

onMounted(async () => {
  await authStore.getServerInfo()

  // To keep background synced if theme changes from ToggleDarkMode
  window.addEventListener('theme-changed', (e) => {
    theme.value = e.detail
  })
})
</script>

<style scoped>
.login-redesign {
  background: var(--bg-body);
  position: relative;
  overflow: hidden;
  height: 100vh;
  width: 100%;
}

.login-card {
  max-width: 440px;
  width: 100%;
  z-index: 1;
}

.slogan-text {
  font-size: 0.95rem;
  color: var(--neutral-500);
  letter-spacing: 0.5px;
  font-weight: 500;
  text-transform: uppercase;
}

.org-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: var(--neutral-100);
  color: var(--neutral-700);
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Background Decorations */
.background-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
  animation: float 25s infinite alternate;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: var(--brand-primary);
  top: -150px;
  left: -150px;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: var(--brand-tertiary);
  bottom: -100px;
  right: -100px;
  animation-delay: -7s;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: var(--brand-secondary);
  top: 30%;
  left: 20%;
  animation-delay: -12s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(60px, 40px) scale(1.1);
  }
  100% {
    transform: translate(-30px, 80px) scale(0.95);
  }
}

.main-logo {
  height: 92px;
  width: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.animate-in {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(48px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.premium-btn {
  background: var(--brand-primary) !important;
  color: var(--brand-on-primary) !important;
  border-radius: var(--radius);
  font-size: 1.05rem;
  transition: all 0.3s ease;
}

.premium-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.footer-credits {
  color: var(--text-main);
  opacity: 0.8;
  font-size: 0.9rem;
  z-index: 1;
}

.footer-link-btn {
  padding: 0 4px;
}

.lang-list {
  padding: 0;
  min-width: 140px;
}

/* =======================================
   DARK MODE OVERRIDES
   ======================================= */

/* Text & Headings */
:global(.body--dark) .slogan-text {
  color: var(--brand-secondary);
}

/* Input Backgrounds (Supplying the missing rule from frontend) */
:global(.body--dark) :deep(.q-field--filled .q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
}
:global(.body--dark) :deep(.q-field__native),
:global(.body--dark) :deep(.q-field__input) {
  color: #fefce8 !important;
}

/* Button */
:global(.body--dark) .premium-btn {
  background: var(--brand-tertiary) !important;
  color: #000 !important;
}
</style>
