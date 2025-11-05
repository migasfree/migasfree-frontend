<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false">
      <template v-if="element.id" #append
        ><span class="vertical-middle">: </span>
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
                  :name="appIcon(showPassword ? 'show' : 'hide')"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col">
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
                  :name="appIcon(showPassword ? 'show' : 'hide')"
                  @click="showPassword = !showPassword"
                />
                <q-tooltip>{{ $gettext('Show / hide password') }}</q-tooltip>
              </template>
            </q-input>
          </div>

          <div class="col">
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
                  :name="appIcon(showPassword ? 'show' : 'hide')"
                  @click="showPassword = !showPassword"
                />
                <q-tooltip>{{ $gettext('Show / hide password') }}</q-tooltip>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          color="primary"
          :label="$gettext('Change Password')"
          :icon="titleIcon"
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
import { useRoute, useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'
import { MIN_PASSWORD_LEN, MIN_PASSWORD_RECOMMENDED_LEN } from 'config/app.conf'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'

import useDetail from 'composables/detail'
import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
  },
  setup() {
    const { $gettext, interpolate } = useGettext()
    const route = useRoute()
    const router = useRouter()
    const uiStore = useUiStore()
    const authStore = useAuthStore()

    const titleIcon = appIcon('password')
    const title = $gettext('Change Password')
    const windowTitle = ref(title)
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
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Configuration'),
        icon: appIcon('configuration'),
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
        password.value.length >= MIN_PASSWORD_RECOMMENDED_LEN &&
        passwordConfirm.value &&
        passwordConfirm.value.length >= MIN_PASSWORD_RECOMMENDED_LEN &&
        password.value === passwordConfirm.value

      return element.id === authStore.user.id
        ? hasNewPasswords &&
            oldPassword.value &&
            oldPassword.value.length >= MIN_PASSWORD_LEN
        : hasNewPasswords
    })

    const confirmPassword = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          (typeof v === 'string' && v.length >= MIN_PASSWORD_RECOMMENDED_LEN) ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: MIN_PASSWORD_RECOMMENDED_LEN,
          }),
        (v) =>
          v == (fldPasswordChange.value?.modelValue ?? '') ||
          $gettext('The passwords are different'),
      ]
    })

    const required = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          (typeof v === 'string' && v.length >= MIN_PASSWORD_RECOMMENDED_LEN) ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: MIN_PASSWORD_RECOMMENDED_LEN,
          }),
      ]
    })

    const requiredOldPassword = computed(() => {
      return [
        (v) => !!v || $gettext('* Required'),
        (v) =>
          (typeof v === 'string' && v.length >= MIN_PASSWORD_LEN) ||
          interpolate($gettext('Please use minimum %{n} characters'), {
            n: MIN_PASSWORD_LEN,
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
      title,
      model,
      routes,
      breadcrumbs,
      element,
      elementData,
    )

    const changePassword = async () => {
      if (element.id && element.id === authStore.user.id) {
        loading.value = true
        await api
          .post('/rest-auth/password/change/', elementData())
          .then(() => {
            uiStore.notifySuccess($gettext('Password changed!'))
            router.push({
              name: routes.detail,
              params: { id: element.id },
            })
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
            elementData(),
          )
          .then(() => {
            uiStore.notifySuccess($gettext('Password changed!'))
            router.push({
              name: routes.detail,
              params: { id: element.id },
            })
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
        icon: titleIcon,
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
      titleIcon,
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
      appIcon,
    }
  },
}
</script>
