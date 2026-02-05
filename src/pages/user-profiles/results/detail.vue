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
      <template #actions>
        <q-btn
          v-if="element.is_superuser"
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('scopes')"
          @click="
            $router.push({
              name: 'scope-add',
              query: { user: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Scope') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="element.id"
          class="q-ma-sm"
          :aria-label="$gettext('Change Password')"
          color="primary"
          :icon="appIcon('password')"
          @click="
            $router.push({
              name: 'user-profile-change-password',
              params: { id: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Change Password') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <q-input
                ref="primaryInput"
                v-model.trim="element.username"
                counter
                maxlength="150"
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
                :label="$gettext('First Name')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.last_name"
                :label="$gettext('Last Name')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model.trim="element.email"
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
              <EntitySelect
                v-model="element.groups"
                :options="groups"
                :label="$gettext('Groups')"
                multiple
                chip-mode
                detail-route="group-detail"
                add-route="group-add"
                :add-tooltip="$gettext('Add Group')"
                :prepend-icon="modelIcon('accounts/groups')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.domains"
                :options="domains"
                :label="$gettext('Domains')"
                link-model="domains"
                chip-mode
                multiple
                add-route="domain-add"
                :add-tooltip="$gettext('Add Domain')"
              />
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
              <EntitySelect
                v-model="element.domain_preference"
                :options="domains"
                :label="$gettext('Domain')"
                link-model="domains"
                chip-mode
                add-route="domain-add"
                :add-tooltip="$gettext('Add Domain')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.scope_preference"
                :options="scopes"
                :label="$gettext('Scope')"
                link-model="scopes"
                chip-mode
                add-route="scope-add"
                :add-tooltip="$gettext('Add Scope')"
              />
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta, useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import EntitySelect from 'components/ui/EntitySelect'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    CopyToClipboard,
    DateView,
    EntitySelect,
    FilteredMultiSelect,
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()
    const $q = useQuasar()
    const route = useRoute()
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

    const element = reactive({
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

    const isValid = computed(() => !!element.username?.trim())

    const isValidEmail = (val) => {
      if (val === undefined || val === '') return true
      // Validates basic email structure to avoid ReDoS. Logic handles length checks separately if needed.
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

        groups.value = groupsData.results.map(({ id, name }) => ({ id, name }))

        domains.value = domainsData.results.map(({ id, name }) => ({
          id,
          name,
        }))

        scopes.value = scopesData.results.map(({ id, name }) => ({ id, name }))

        if (route.query.groups) {
          const ids = route.query.groups.split(',').map((v) => Number(v))

          element.groups = groups.value.filter((item) => ids.includes(item.id))
        }

        if (route.query.domains) {
          const ids = route.query.domains.split(',').map((v) => Number(v))

          element.domains = domains.value.filter((item) =>
            ids.includes(item.id),
          )
        }
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
      primaryInput,
    }
  },
}
</script>
