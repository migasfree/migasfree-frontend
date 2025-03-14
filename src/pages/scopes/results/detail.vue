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
      @set-related="setRelated"
      @update-related="updateRelated"
      @post-remove="postRemove"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                autofocus
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                @update:model-value="
                  (v) => {
                    element.name = v.toLowerCase()
                  }
                "
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.domain"
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
          </div>

          <div v-if="isSuperUser" class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-select
                v-model="element.user"
                :options="userProfiles"
                :label="$gettext('User')"
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
                      model="user-profiles"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
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

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const authStore = useAuthStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Scope'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'scopes-list',
      add: 'scope-add',
      detail: 'scope-detail',
    }
    const model = 'scopes'

    let element = reactive({
      id: 0,
      domain: null,
      included_attributes: [],
      excluded_attributes: [],
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
        text: $gettext('Scopes'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const domains = ref([])
    const userProfiles = ref([])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([, item]) => {
            domains.value.push({
              id: item.id,
              name: item.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (authStore.user.is_superuser)
        await api
          .get('/api/v1/token/user-profiles/')
          .then((response) => {
            Object.entries(response.data.results).map(([, item]) => {
              userProfiles.value.push({
                id: item.id,
                name: item.username,
              })
            })
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    }

    const setRelated = () => {
      element.user.name = element.user.username
      delete element.username
    }

    const updateRelated = () => {
      if (element.id && element.user.id === authStore.user.id)
        authStore.addScope({
          id: element.id,
          name: element.name,
          domain: element.domain,
        })
    }

    const postRemove = () => {
      if (element.user.id === authStore.user.id)
        authStore.deleteScope(element.id)
    }

    const elementData = () => {
      return {
        user: element.user ? element.user.id : authStore.user.pk,
        name: element.name,
        domain: element.domain ? element.domain.id : null,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        user: undefined,
        name: undefined,
        domain: null,
        included_attributes: [],
        excluded_attributes: [],
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
      domains,
      isValid,
      isSuperUser: authStore.user.is_superuser,
      loadRelated,
      setRelated,
      updateRelated,
      postRemove,
      elementData,
      resetElement,
      setTitle,
    }
  },
}
</script>
