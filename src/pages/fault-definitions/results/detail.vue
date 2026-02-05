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
            <div class="col-6 col-md col-sm">
              <q-checkbox
                ref="primaryInput"
                v-model="element.enabled"
                left-label
                :label="$gettext('Enabled?')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.description"
                type="textarea"
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Code') }}</div>

          <div class="row q-pa-md q-gutter-md justify-between">
            <div class="col-md-3 col-sm-3">
              <q-select
                v-model="element.language"
                :label="$gettext('Language')"
                :options="languages"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-md-8 col-sm-8">
              <CodeEditor v-model="element.code" :language="highlightLang" />
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
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('User Profiles') }}
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <EntitySelect
                v-model="element.users"
                :label="$gettext('User Profiles')"
                :options="userProfiles"
                option-value="id"
                option-label="username"
                multiple
                use-input
                map-options
                chip-mode
                link-model="user-profiles"
                use-custom-option
                @filter="filterUserProfiles"
                @filter-abort="abortFilterUserProfiles"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.username }}
                  </q-item>
                </template>
              </EntitySelect>
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

import EntitySelect from 'components/ui/EntitySelect'
import ItemDetail from 'components/ui/ItemDetail'
import SelectAttributes from 'components/ui/SelectAttributes'
import CodeEditor from 'components/ui/CodeEditor'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    EntitySelect,
    ItemDetail,
    SelectAttributes,
    CodeEditor,
  },
  setup() {
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()
    const uiStore = useUiStore()

    const title = ref($gettext('Fault Definition'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'fault-definitions-list',
      add: 'fault-definition-add',
      detail: 'fault-definition-detail',
    }
    const model = 'fault-definitions'

    const languages = ref([])
    const userProfiles = ref([])

    let element = reactive({
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
      users: [],
      code: '',
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
        text: $gettext('Fault Definitions'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.language !== undefined &&
        element.code !== undefined &&
        element.code.trim() !== ''
      )
    })

    const highlightLang = computed(() => {
      if ('language' in element && typeof element.language === 'object')
        return element.language.name
      return 'python'
    })

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/public/languages/')
        languages.value = Object.entries(data).map(([key, val]) => ({
          id: Number(key),
          name: val,
        }))

        if (element.id && typeof element.language === 'number') {
          element.language = languages.value.find(
            (x) => x.id === element.language,
          )
        }
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        enabled: element.enabled,
        description: element.description,
        language: element.language.id,
        code: element.code,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
        users: element.users.map((item) => item.id),
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        enabled: false,
        description: undefined,
        language: undefined,
        code: '',
        included_attributes: [],
        excluded_attributes: [],
        users: [],
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const filterUserProfiles = async (val, update /*, abort */) => {
      // call abort() at any time if you can't retrieve data somehow
      /* if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      } */

      try {
        const { data } = await api.get('/api/v1/token/user-profiles/', {
          params: { search: val.toLowerCase() },
        })
        userProfiles.value = data.results
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        update(() => {})
      }
    }

    const abortFilterUserProfiles = () => {}

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      languages,
      userProfiles,
      isValid,
      highlightLang,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      filterUserProfiles,
      abortFilterUserProfiles,
      primaryInput,
    }
  },
}
</script>
