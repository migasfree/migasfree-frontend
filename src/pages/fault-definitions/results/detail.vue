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
            <div class="col-6 col-md col-sm">
              <q-checkbox
                v-model="element.enabled"
                left-label
                :label="$gettext('Enabled?')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
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
                outlined
                type="textarea"
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Code</div>

          <div class="row q-pa-md q-gutter-md justify-between">
            <div class="col-md-3 col-sm-3">
              <q-select
                v-model="element.language"
                outlined
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
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Attributes</div>

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
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">User Profiles</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-select
                v-model="element.users"
                outlined
                use-input
                map-options
                multiple
                input-debounce="0"
                :label="$gettext('User Profiles')"
                :options="userProfiles"
                @filter="filterUserProfiles"
                @filter-abort="abortFilterUserProfiles"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section v-translate class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>

                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.username }}
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
                    <MigasLink
                      model="user-profiles"
                      :pk="scope.opt.id"
                      :value="scope.opt.username"
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

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'
import CodeEditor from 'components/ui/CodeEditor'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    SelectAttributes,
    CodeEditor,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Fault Definition'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'fault-definitions-list',
      add: 'fault-definition-add',
      detail: 'fault-definition-detail',
    }
    const model = 'fault-definitions'

    const languages = ref([])
    const userProfiles = reactive([])

    let element = reactive({
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
      users: [],
      code: '',
    })

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
      await api
        .get('/api/v1/public/languages/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            languages.value.push({
              id: parseInt(key),
              name: val,
            })
          })
          if (element.id && typeof element.language === 'number')
            element.language = languages.value.find(
              (x) => x.id === element.language
            )
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
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

    const filterUserProfiles = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      /* if (val.length < 3) {
        abort()
        return
      } */

      await api
        .get('/api/v1/token/user-profiles/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          Object.assign(userProfiles, response.data.results)
        })

      update(() => {})
    }

    const abortFilterUserProfiles = () => {
      // console.log('delayed filter aborted')
    }

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
    }
  },
}
</script>
