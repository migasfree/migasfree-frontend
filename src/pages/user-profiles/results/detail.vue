<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
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
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

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
                <span class="vertical-middle">
                  {{ $gettext('Joined Date') }}:
                </span>
                <strong><DateView :value="element.date_joined" /></strong>
              </p>
            </div>

            <div class="col-6 col-md col-sm">
              <p>
                <span class="vertical-middle">
                  {{ $gettext('Last Login') }}:
                </span>
                <strong><DateView :value="element.last_login" /></strong>
              </p>
            </div>
          </div>

          <div v-if="element.id" class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <p>
                {{ $gettext('Token') }}:
                <strong>{{ element.token }}</strong>
                <q-btn
                  class="q-ma-sm"
                  :icon="appIcon('update')"
                  color="warning"
                  @click="updateToken"
                  ><q-tooltip>{{ $gettext('Update') }}</q-tooltip></q-btn
                >
                <CopyToClipboard
                  v-if="element.token"
                  class="q-ma-sm"
                  size="md"
                  :flat="false"
                  :content="element.token"
                />
              </p>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Authorizations') }}
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-checkbox
                v-model="element.is_active"
                left-label
                :label="$gettext('Enabled?')"
              />
              <p class="text-caption">
                {{
                  $gettext(
                    'Indicates whether the user should be treated as active. Uncheck this option instead of deleting the account.',
                  )
                }}
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
              <p class="text-caption">
                {{
                  $gettext(
                    'Indicates that this user has all permissions without explicitly assigning them.',
                  )
                }}
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
              <p class="text-caption">
                {{
                  $gettext(
                    'Indicates whether the user can enter this administration site.',
                  )
                }}
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
              <FilteredMultiSelect
                v-model="element.user_permissions"
                :label="$gettext('User Permissions')"
                :fetch-options="filterUserPermissions"
              >
                <template #prepend>
                  <q-icon :name="appIcon('permission')" />
                </template>

                <template #option="{ scope }">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.name }}
                  </q-item>
                </template>

                <template #selected-item="{ scope }">
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
              </FilteredMultiSelect>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Preferences') }}
          </div>

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

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    CopyToClipboard,
    DateView,
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const $q = useQuasar()
    const uiStore = useUiStore()

    const title = ref($gettext('User Profile'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'user-profiles-list',
      add: 'user-profile-add',
      detail: 'user-profile-detail',
    }
    const model = 'user-profiles'

    const groups = ref([])
    const domains = ref([])
    const scopes = ref([])

    let element = reactive({
      id: 0,
      is_active: false,
      is_superuser: false,
      is_staff: false,
      groups: [],
      domains: [],
      user_permissions: [],
    })

    const breadcrumbs = ref([
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
      try {
        const [
          { data: groupsData },
          { data: domainsData },
          { data: scopesData },
        ] = await Promise.all([
          api.get('/api/v1/token/accounts/groups/'),
          api.get('/api/v1/token/domains/'),
          api.get('/api/v1/token/scopes/'),
        ])

        groups.value = groupsData.results.map((item) => ({
          id: item.id,
          name: item.name,
        }))

        domains.value = domainsData.results.map((item) => ({
          id: item.id,
          name: item.name,
        }))

        scopes.value = scopesData.results.map((item) => ({
          id: item.id,
          name: item.name,
        }))
      } catch (error) {
        uiStore.notifyError(error)
      }
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
        try {
          const { data } = await api.post(
            `/api/v1/token/user-profiles/${element.id}/update-token/`,
          )
          element.token = data.info
          uiStore.notifySuccess(data.detail)
        } catch (error) {
          uiStore.notifyError(error)
        }
      })
    }

    const filterUserPermissions = async (val) => {
      const { data } = await api.get('/api/v1/token/accounts/permissions', {
        params: { search: val.toLowerCase() },
      })

      return data.results
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
      isValid,
      isValidEmail,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      updateToken,
      filterUserPermissions,
      appIcon,
      modelIcon,
    }
  },
}
</script>
