<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="user-profiles"
          :pk="element.id"
          :value="elementText"
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
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'

import useDetail from 'composables/detail'
import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
  },
  setup() {
    const { $gettext, interpolate } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()
    const authStore = useAuthStore()

    const title = ref($gettext('Change Password'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'user-profiles-list',
      detail: 'user-profile-detail',
    }
    const model = 'user-profiles'

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Configuration'),
        icon: 'mdi-cogs',
      },
      {
        text: $gettext('User Profiles'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const showPassword = ref(false)

    const oldPassword = ref(null)
    const password = ref(null)
    const passwordConfirm = ref(null)

    const fldPasswordChange = ref(null)

    let element = reactive({ id: 0 })

    const isValid = computed(() => {
      const hasNewPasswords =
        password.value &&
        password.value.length > 7 &&
        passwordConfirm.value &&
        passwordConfirm.value.length > 7 &&
        password.value === passwordConfirm.value

      return element.id === authStore.user.id
        ? hasNewPasswords && oldPassword.value && oldPassword.value.length > 3
        : hasNewPasswords
    })

    const confirmPassword = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          v.length > 7 ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: 8,
          }),
        (v) =>
          v == fldPasswordChange.value ||
          $gettext('The passwords are different'),
      ]
    })

    const required = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          v.length > 7 ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: 8,
          }),
      ]
    })

    const requiredOldPassword = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          v.length > 3 ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: 4,
          }),
      ]
    })

    const elementData = () => {
      if (element.id === authStore.user.id) {
        return {
          old_password: oldPassword.value,
          new_password1: password.value,
          new_password2: passwordConfirm.value,
        }
      }

      return {
        password: password.value,
        password2: passwordConfirm.value,
      }
    }

    const { loading, elementText } = useDetail(
      title.value,
      model,
      routes,
      breadcrumbs,
      element,
      elementData
    )

    const changePassword = async () => {
      if (element.id && element.id === authStore.user.id) {
        loading.value = true
        await api
          .post('/rest-auth/password/change/', elementData())
          .then((response) => {
            uiStore.notifySuccess($gettext('Password changed!'))
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.value = false))
      } else if (element.id) {
        loading.value = true
        await api
          .put(
            `/api/v1/token/user-profiles/${element.id}/change-password/`,
            elementData()
          )
          .then((response) => {
            uiStore.notifySuccess($gettext('Password changed!'))
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.value = false))
      }
    }

    // created
    if (route.params.id) {
      breadcrumbs.push({
        text: windowTitle.value,
      })
    }

    watch(element, (val) => {
      if (val.id !== 0) {
        breadcrumbs.find((x) => x.text === val.username).to = {
          name: routes.detail,
          params: { id: val.id },
        }
      }
    })

    return {
      title,
      breadcrumbs,
      loading,
      showPassword,
      oldPassword,
      password,
      passwordConfirm,
      fldPasswordChange,
      element,
      isValid,
      elementText,
      currentUser: authStore.user,
      confirmPassword,
      required,
      requiredOldPassword,
      changePassword,
    }
  },
}
</script>
