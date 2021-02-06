<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Change Password')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="user-profiles"
          :pk="element.id"
          :value="element.username"
          icon="mdi-account-cog"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div
          v-if="element.id === currentUser.id"
          class="row q-pa-md q-gutter-md"
        >
          <div class="col-md">
            <q-input
              v-model="oldPassword"
              outlined
              counter
              :label="$gettext('Current Password')"
              :type="showPassword ? 'text' : 'password'"
              lazy-rules
              :rules="requiredOldPassword"
            >
              <template #append>
                <q-icon
                  class="cursor-pointer"
                  :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-input
              ref="fldPasswordChange"
              v-model="password"
              outlined
              counter
              :label="$gettext('New Password')"
              :type="showPassword ? 'text' : 'password'"
              lazy-rules
              :rules="required"
            >
              <template #append>
                <q-icon
                  class="cursor-pointer"
                  :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="col-md">
            <q-input
              ref="fldPasswordChangeConfirm"
              v-model="passwordConfirm"
              outlined
              counter
              :label="$gettext('Password Confirmation')"
              :type="showPassword ? 'text' : 'password'"
              lazy-rules
              :rules="confirmPassword"
            >
              <template #append>
                <q-icon
                  class="cursor-pointer"
                  :name="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          color="primary"
          :label="$gettext('Change Password')"
          icon="mdi-account-key"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="changePassword"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { detailMixin } from 'mixins/detail'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink
  },
  mixins: [detailMixin],
  data() {
    const title = this.$gettext('Change Password')

    return {
      title,
      originalTitle: title,
      model: 'user-profiles',
      listRoute: 'user-profiles-list',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs'
        },
        {
          text: this.$gettext('User Profiles'),
          icon: 'mdi-account-cog',
          to: 'user-profiles-list'
        }
      ],
      element: { id: 0 },
      loading: false,
      showPassword: false,
      oldPassword: null,
      password: null,
      passwordConfirm: null
    }
  },
  computed: {
    isValid() {
      const hasNewPasswords =
        this.password &&
        this.password.length > 7 &&
        this.passwordConfirm &&
        this.passwordConfirm.length > 7 &&
        this.password === this.passwordConfirm

      return this.element.id === this.currentUser.id
        ? hasNewPasswords && this.oldPassword && this.oldPassword.length > 3
        : hasNewPasswords
    },

    elementText() {
      return this.element.id ? this.element.username : ''
    },

    currentUser() {
      return this.$store.getters['auth/user']
    },

    confirmPassword() {
      return [
        (v) => !!v || this.$gettext('* Required'),
        (v) =>
          v.length > 7 ||
          this.$gettextInterpolate(
            this.$gettext('Please use minimum %{n} characters'),
            {
              n: 8
            }
          ),
        (v) =>
          v == this.$refs.fldPasswordChange.value ||
          this.$gettext('The passwords are different')
      ]
    },

    required() {
      return [
        (v) => !!v || this.$gettext('* Required'),
        (v) =>
          v.length > 7 ||
          this.$gettextInterpolate(
            this.$gettext('Please use minimum %{n} characters'),
            {
              n: 8
            }
          )
      ]
    },

    requiredOldPassword() {
      return [
        (v) => !!v || this.$gettext('* Required'),
        (v) =>
          v.length > 3 ||
          this.$gettextInterpolate(
            this.$gettext('Please use minimum %{n} characters'),
            {
              n: 4
            }
          )
      ]
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: this.originalTitle
      })
    }
  },
  methods: {
    setRelated() {
      this.breadcrumbs.find((x) => x.text === 'Id').to = {
        name: 'user-profile-detail',
        params: { id: this.element.id }
      }
    },

    elementData() {
      if (this.element.id === this.currentUser.id) {
        return {
          old_password: this.oldPassword,
          new_password1: this.password,
          new_password2: this.passwordConfirm
        }
      }

      return {
        password: this.password,
        password2: this.passwordConfirm
      }
    },

    async changePassword() {
      if (this.element.id && this.element.id === this.currentUser.id) {
        this.loading = true
        await this.$axios
          .post('/rest-auth/password/change/', this.elementData())
          .then((response) => {
            console.log(response)
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Password changed!')
            )
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else if (this.element.id) {
        this.loading = true
        await this.$axios
          .put(
            `/api/v1/token/user-profiles/${this.element.id}/change-password/`,
            this.elementData()
          )
          .then((response) => {
            console.log(response)
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Password changed!')
            )
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>
