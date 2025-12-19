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
      @set-related="setRelated"
      @update-related="updateRelated"
      @post-remove="postRemove"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template v-if="element.id" #actions>
        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('scopes')"
          @click="
            $router.push({
              name: 'scope-add',
              query: { domain: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Scope') }}</q-tooltip></q-btn
        >

        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('deployments')"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { domain: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
        >

        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('user-profiles')"
          @click="
            $router.push({
              name: 'user-profile-add',
              query: { domains: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add User Profile') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                ref="primaryInput"
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                @update:model-value="
                  (v) => {
                    element.name = v.toUpperCase()
                  }
                "
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.comment"
                outlined
                type="textarea"
                :label="$gettext('Comment')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Attributes') }}
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.included_attributes"
                :label="$gettext('Included')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.excluded_attributes"
                :label="$gettext('Excluded')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Others') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <FilteredMultiSelect
                v-model="element.tags"
                :label="$gettext('Available Tags')"
                :fetch-options="filterTags"
              >
                <template #option="{ scope }">
                  <q-item v-bind="scope.itemProps">
                    {{ attributeValue(scope.opt) }}
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
                    <MigasLink
                      model="tags"
                      :pk="scope.opt.id"
                      :value="attributeValue(scope.opt)"
                    />
                  </q-chip>
                </template>
              </FilteredMultiSelect>
            </div>

            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.domain_admins"
                multiple
                chip-mode
                :label="$gettext('Domain Admins')"
                :options="userProfiles"
                link-model="user-profiles"
                add-route="user-profile-add"
                :add-tooltip="$gettext('Add User Profile')"
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
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import EntitySelect from 'components/ui/EntitySelect'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    EntitySelect,
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const authStore = useAuthStore()
    const { attributeValue } = useElement()
    const { $gettext } = useGettext()

    const title = ref($gettext('Domain'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'domains-list',
      add: 'domain-add',
      detail: 'domain-detail',
    }
    const model = 'domains'

    const element = reactive({
      id: 0,
      name: undefined,
      comment: undefined,
      included_attributes: [],
      excluded_attributes: [],
      tags: [],
      domain_admins: [],
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
        text: $gettext('Domains'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const userProfiles = ref([])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const loadRelated = async () => {
      try {
        const { data } = await api.get(
          '/api/v1/token/user-profiles/domain-admins/',
        )
        userProfiles.value = Object.values(data).map(({ id, username }) => ({
          id,
          name: username,
        }))
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const setRelated = () => {
      element.domain_admins = element.domain_admins.map(({ id, username }) => ({
        id,
        name: username,
      }))
    }

    const updateRelated = () => {
      if (element.id)
        authStore.addDomain({
          id: element.id,
          name: element.name,
        })
    }

    const postRemove = () => {
      authStore.deleteDomain(element.id)
    }

    const elementData = () => {
      return {
        name: element.name,
        comment: element.comment,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
        tags: element.tags.map((item) => item.id),
        domain_admins: element.domain_admins.map((item) => item.id),
      }
    }

    const filterTags = async (val) => {
      const { data } = await api.get('/api/v1/token/tags/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        comment: '',
        included_attributes: [],
        excluded_attributes: [],
        tags: [],
        domain_admins: [],
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      userProfiles,
      isValid,
      filterTags,
      attributeValue,
      loadRelated,
      setRelated,
      updateRelated,
      postRemove,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
    }
  },
}
</script>
