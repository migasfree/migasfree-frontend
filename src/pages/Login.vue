<template>
  <q-page class="flex bg-image flex-center">
    <q-card :style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }">
      <q-card-section>
        <q-avatar size="110px" class="absolute-center shadow-10">
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
            Log in @ migasfree
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="login">
          <q-input
            v-model="model.username"
            autofocus
            label="User"
            lazy-rules
            :rules="[(val) => !!val || '* Required']"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-account" />
            </template>
          </q-input>

          <q-input
            id="password"
            v-model="model.password"
            label="Password"
            lazy-rules
            counter
            :rules="[
              (val) => !!val || '* Required',
              (val) => val.length > 3 || 'Please use minimum 4 characters'
            ]"
            :type="showPassword ? 'text' : 'password'"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-lock" />
            </template>

            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div>
            <q-btn
              label="Login"
              class="full-width"
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="!isValid"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    loading: false,
    showPassword: false,
    model: {
      username: '',
      password: ''
    }
  }),
  computed: {
    isValid() {
      return this.model.username !== '' && this.model.password.length > 3
    }
  },
  methods: {
    async login() {
      this.loading = true
      await this.$store.dispatch('auth/login', this.model).then(() => {
        if (this.$route.params.nextUrl != null) {
          console.log(this.$route.params.nextUrl)
          this.$router.push(this.$route.params.nextUrl)
        } else {
          this.$router.push(
            {
              name: 'home'
            },
            () => {}
          ) /*.catch((err) => {
          throw new Error(`Problem handling something: ${err}.`)
        })*/
        }
      })
      this.loading = false
    }
  }
}
</script>

<style scoped>
#logo {
  width: 75px;
  height: 75px;
}
</style>
