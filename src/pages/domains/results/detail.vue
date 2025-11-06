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
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                autofocus
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
                :options="tags"
                @filter="filterTags"
                @filter-abort="abortFilterTags"
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
              <q-select
                v-model="element.domain_admins"
                :options="userProfiles"
                :label="$gettext('Domain Admins')"
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
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
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
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'domains-list',
      add: 'domain-add',
      detail: 'domain-detail',
    }
    const model = 'domains'

    let element = reactive({
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

    const tags = ref([])
    const userProfiles = ref([])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/user-profiles/domain-admins/')
        .then((response) => {
          Object.entries(response.data).map(([, item]) => {
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

    const filterTags = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/tags/', { params: { search: val.toLowerCase() } })
        .then((response) => {
          tags.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterTags = () => {
      // console.log('delayed filter aborted')
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
      tags,
      isValid,
      filterTags,
      abortFilterTags,
      attributeValue,
      loadRelated,
      setRelated,
      updateRelated,
      postRemove,
      elementData,
      resetElement,
      setTitle,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
