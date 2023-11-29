<template>
  <q-page padding>
    <ItemDetail
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :element-data="elementData"
      :is-valid="isValid"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <q-input
                v-model="element.username"
                outlined
                counter
                maxlength="150"
                autofocus
                :label="$gettext('Username')"
                :hint="$gettext('Only letters, digits and @/./+/-/_')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('user-profiles')" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.first_name"
                outlined
                :label="$gettext('First Name')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.last_name"
                outlined
                :label="$gettext('Last Name')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.email"
                outlined
                type="email"
                :label="$gettext('Email')"
                lazy-rules
                :rules="[(val) => !!val, isValidEmail]"
              >
                <template #prepend> <q-icon name="mail" /> </template
              ></q-input>
            </div>
          </div>

          <div v-if="element.id" class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <p>
                <translate>Joined Date</translate>:
                <strong><DateView :value="element.date_joined" /></strong>
              </p>
            </div>

            <div class="col-6 col-md col-sm">
              <p>
                <translate>Last Login</translate>:
                <strong><DateView :value="element.last_login" /></strong>
              </p>
            </div>
          </div>

          <div v-if="element.id" class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <p>
                <translate>Token</translate>:
                <strong>{{ element.token }}</strong>
                <q-btn
                  class="q-ma-sm"
                  icon="mdi-refresh"
                  color="warning"
                  @click="updateToken"
                  ><q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
                >
                <q-btn
                  v-if="element.token"
                  class="q-ma-sm"
                  icon="mdi-content-copy"
                  color="primary"
                  @click.stop="contentToClipboard(element.token)"
                  ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
                >
              </p>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Authorizations</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-checkbox
                v-model="element.is_active"
                left-label
                :label="$gettext('Enabled?')"
              />
              <p v-translate class="text-caption">
                Indicates whether the user should be treated as active. Uncheck
                this option instead of deleting the account.
              </p>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-checkbox
                v-model="element.is_superuser"
                left-label
                :label="$gettext('Is Super User?')"
              />
              <p v-translate class="text-caption">
                Indicates that this user has all permissions without explicitly
                assigning them.
              </p>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-checkbox
                v-model="element.is_staff"
                left-label
                :label="$gettext('Is Staff?')"
              />
              <p v-translate class="text-caption">
                Indicates whether the user can enter this administration site.
              </p>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.groups"
                :options="groups"
                :label="$gettext('Groups')"
                outlined
                multiple
                counter
                option-value="id"
                option-label="name"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('accounts/groups')" />
                </template>

                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <q-btn
                      no-caps
                      flat
                      color="primary"
                      :to="{
                        name: 'group-detail',
                        params: { id: scope.opt.id },
                      }"
                      :label="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.domains"
                :options="domains"
                :label="$gettext('Domains')"
                outlined
                multiple
                counter
                option-value="id"
                option-label="name"
              >
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="domains"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <q-select
                v-model="element.user_permissions"
                outlined
                use-input
                map-options
                multiple
                counter
                input-debounce="0"
                :label="$gettext('User Permissions')"
                :hint="
                  $gettext('Type to search (minimum %{num} characters)', {
                    num: MIN_CHARS_SEARCH,
                  })
                "
                :options="userPermissions"
                @filter="filterUserPermissions"
                @filter-abort="abortFilterUserPermissions"
              >
                <template #prepend>
                  <q-icon name="mdi-account-key" />
                </template>

                <template #no-option>
                  <q-item>
                    <q-item-section v-translate class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>

                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.name }}
                  </q-item>
                </template>

                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    {{ scope.opt.name }}
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Preferences</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.domain_preference"
                :options="domains"
                :label="$gettext('Domain')"
                outlined
                option-value="id"
                option-label="name"
              >
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="domains"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.scope_preference"
                :options="scopes"
                :label="$gettext('Scope')"
                outlined
                option-value="id"
                option-label="name"
              >
                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="scopes"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import ItemDetail from 'components/ui/ItemDetail'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'
import useCopyPaste from 'composables/copyPaste'

export default {
  components: {
    ItemDetail,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const $q = useQuasar()
    const uiStore = useUiStore()
    const { contentToClipboard } = useCopyPaste()

    const title = ref($gettext('User Profile'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'user-profiles-list',
      add: 'user-profile-add',
      detail: 'user-profile-detail',
    }
    const model = 'user-profiles'

    const groups = ref([])
    const domains = ref([])
    const scopes = ref([])
    const userPermissions = ref([])

    let element = reactive({
      id: 0,
      is_active: false,
      is_superuser: false,
      is_staff: false,
      groups: [],
      domains: [],
      user_permissions: [],
    })

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

    const isValid = computed(() => {
      return element.username !== undefined && element.username.trim() !== ''
    })

    const isValidEmail = (val) => {
      if (val === undefined || val === '') return true
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
      return emailPattern.test(val) || $gettext('Invalid email')
    }

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/accounts/groups/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            groups.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            domains.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/scopes/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            scopes.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const elementData = () => {
      return {
        username: element.username,
        first_name: element.first_name,
        last_name: element.last_name,
        is_active: element.is_active,
        is_superuser: element.is_superuser,
        is_staff: element.is_staff,
        domain_preference: element.domain_preference
          ? element.domain_preference.id
          : null,
        scope_preference: element.scope_preference
          ? element.scope_preference.id
          : null,
        domains: element.domains.map((item) => item.id),
        groups: element.groups.map((item) => item.id),
        user_permissions: element.user_permissions.map((item) => item.id),
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        username: undefined,
        first_name: undefined,
        last_name: undefined,
        is_active: false,
        is_superuser: false,
        is_staff: false,
        domain_preference: null,
        scope_preference: null,
        domains: [],
        groups: [],
        user_permissions: [],
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const updateToken = async () => {
      $q.dialog({
        title: $gettext('Confirm'),
        message: $gettext('Would you like to update token?'),
        ok: { label: $gettext('Update') },
        cancel: { label: $gettext('Cancel'), flat: true },
        persistent: true,
      }).onOk(async () => {
        await api
          .post(`/api/v1/token/user-profiles/${element.id}/update-token/`)
          .then((response) => {
            element.token = response.data.info
            uiStore.notifySuccess(response.data.detail)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      })
    }

    const filterUserPermissions = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/accounts/permissions', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          userPermissions.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterUserPermissions = () => {
      // console.log('delayed filter aborted')
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      groups,
      domains,
      scopes,
      userPermissions,
      isValid,
      isValidEmail,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      updateToken,
      contentToClipboard,
      filterUserPermissions,
      abortFilterUserPermissions,
      modelIcon,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
