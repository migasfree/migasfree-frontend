<template>
  <q-page class="flex bg-image flex-center">
    <q-card :style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }">
      <q-card-section>
        <q-avatar
          size="110px"
          class="absolute-center shadow-10"
          :color="$q.dark.isActive ? 'blue-grey-9' : 'white'"
        >
          <img
            id="logo"
            src="../assets/migasfree-logo.svg"
            alt="migasfree logo"
          />
        </q-avatar>
      </q-card-section>

      <q-card-section>
        <div class="text-center q-pt-lg">
          <div class="col text-h6 ellipsis">
            <translate>Log in</translate> @ migasfree
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
              <translate>User</translate>
            </template>

            <template #prepend>
              <q-icon name="mdi-account" />
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
                val.length > 3 ||
                $gettextInterpolate(
                  $gettext('Please use minimum %{n} characters'),
                  {
                    n: 4,
                  }
                ),
            ]"
            :type="showPassword ? 'text' : 'password'"
          >
            <template #label>
              <translate>Password</translate>
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
              ><translate>Log In</translate></q-btn
            >
          </div>
        </q-form>

        <q-toolbar class="q-pa-md">
          <q-btn-dropdown ref="changeLanguage" flat stretch>
            <template #label>
              <q-icon name="mdi-earth" />
              <q-tooltip>
                <translate>Change App Language</translate>
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
import ToggleDarkMode from 'components/ui/ToggleDarkMode'

export default {
  name: 'Login',
  meta() {
    return {
      title: this.$gettext('Log In'),
    }
  },
  components: { ToggleDarkMode },
  data: () => ({
    loading: false,
    showPassword: false,
    model: {
      username: '',
      password: '',
    },
  }),
  computed: {
    isValid() {
      return this.model.username !== '' && this.model.password.length > 3
    },
  },
  methods: {
    async login() {
      this.loading = true
      this.$store.dispatch('auth/reset')
      await this.$store
        .dispatch('auth/login', this.model)
        .then(() => {
          if (this.$route.params.nextUrl != null) {
            this.$router.push(this.$route.params.nextUrl)
          } else {
            this.$router.push({ name: 'home' })
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    },

    changeAppLanguage(key) {
      if (this.$language.current !== key) {
        this.$language.current = key
        this.$q.cookies.set('language', key)
      }
      this.$refs.changeLanguage.hide()
    },
  },
}
</script>

<style scoped>
#logo {
  width: 75px;
  height: 75px;
}
</style>
