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
      :no-data="isBasic"
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
                autofocus
                :label="$gettext('Enabled?')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.kind"
                outlined
                :label="$gettext('Kind')"
                :options="kind"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.prefix"
                outlined
                :label="$gettext('Prefix')"
                counter
                maxlength="3"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) =>
                    val.length <= 3 ||
                    $gettextInterpolate(
                      $gettext('Please use maximum %{n} characters'),
                      {
                        n: 3,
                      }
                    ),
                ]"
                @update:model-value="
                  (v) => {
                    element.prefix = v.toUpperCase()
                  }
                "
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
        </q-card-section>

        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Code</div>

          <div class="row q-pa-md q-gutter-md justify-between q-mb-xl">
            <div class="col-md-3 col-sm-3 col-xs-3">
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

            <div class="col-md-8 col-sm-8 col-xs-8 q-mb-xl">
              <CodeEditor v-model="element.code" :language="highlightLang" />

              <q-input borderless dense bottom-slots readonly>
                <template #hint>
                  <p v-translate>
                    This code will execute in the client computer, and it must
                    put in the standard output the value of the attribute
                    correspondent to this property.
                  </p>
                  <p v-translate>
                    The format of this value is 'name~description', where
                    'description' is optional.
                  </p>
                  <p><b v-translate>Example of code:</b></p>
                  <p v-translate>
                    # Create an attribute with the name of computer from bash
                  </p>
                  <p><code>echo $HOSTNAME</code></p>
                </template>
              </q-input>
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
import CodeEditor from 'components/ui/CodeEditor'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    CodeEditor,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Formula'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'formulas-list',
      add: 'formula-add',
      detail: 'formula-detail',
    }
    const model = 'formulas'

    let element = reactive({ id: 0, enabled: false, code: '' })

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
        text: $gettext('Formulas'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const languages = ref([])
    const kind = ref([])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.language !== undefined &&
        element.kind !== undefined &&
        element.prefix !== undefined &&
        element.prefix.length <= 3 &&
        element.code !== undefined &&
        element.code.trim() !== ''
      )
    })

    const isBasic = computed(() => {
      return Boolean(element.id && element.sort === 'basic')
    })

    const highlightLang = computed(() => {
      if ('language' in element && typeof element.language === 'object')
        return element.language.name
      return 'python'
    })

    const loadRelated = async () => {
      await api
        .get(`/api/v1/token/properties/kind/`)
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            kind.value.push({
              id: key,
              name: val,
            })
          })
          if (element.id && typeof element.kind === 'string')
            element.kind = kind.value.find((x) => x.id == element.kind)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get(`/api/v1/public/languages/`)
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
        prefix: element.prefix,
        enabled: element.enabled,
        kind: element.kind.id,
        language: element.language.id,
        code: element.code,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        prefix: undefined,
        enabled: false,
        kind: undefined,
        language: undefined,
        code: '',
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
      kind,
      languages,
      isBasic,
      isValid,
      highlightLang,
      elementData,
      loadRelated,
      resetElement,
      setTitle,
    }
  },
}
</script>
