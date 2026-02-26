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
      :no-data="isBasic"
      :visible-actions="!isBasic"
      :borderless="isBasic"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template v-if="element.id" #actions>
        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('singularities')"
          @click="
            $router.push({
              name: 'singularity-add',
              query: { property_att: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Singularity') }}</q-tooltip></q-btn
        >
      </template>

      <template v-if="!isBasic" #fields>
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
              <q-select
                v-model="element.kind"
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
                :label="$gettext('Prefix')"
                counter
                :maxlength="MAX_PREFIX_LEN"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) =>
                    val.length <= MAX_PREFIX_LEN ||
                    $gettextInterpolate(
                      $gettext('Please use maximum %{n} characters'),
                      {
                        n: MAX_PREFIX_LEN,
                      },
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
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Code') }}</div>

          <div class="row q-pa-md q-gutter-md justify-between q-mb-xl">
            <div class="col-md-3 col-sm-3 col-xs-3">
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

            <div class="col-md-8 col-sm-8 col-xs-8 q-mb-xl">
              <CodeEditor v-model="element.code" :language="highlightLang" />

              <div class="text-caption opacity-80 q-mt-sm flex column gap-sm">
                <p class="q-ma-none">
                  {{
                    $gettext(
                      'This code will execute in the client computer, and it must put in the standard output the value of the attribute correspondent to this property.',
                    )
                  }}
                </p>
                <p class="q-ma-none">
                  {{
                    $gettext(
                      "The format of this value is 'name~description', where 'description' is optional.",
                    )
                  }}
                </p>
                <p class="q-ma-none">
                  <b class="text-weight-bold">{{
                    $gettext('Example of code:')
                  }}</b>
                </p>
                <div
                  class="q-ma-none q-pa-sm rounded-borders text-body2 font-monospace"
                  style="background-color: var(--bg-surface-variant)"
                >
                  <div class="opacity-60">
                    {{
                      $gettext(
                        '# Create an attribute with the name of computer from bash',
                      )
                    }}
                  </div>
                  <div>echo $HOSTNAME</div>
                </div>
              </div>
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
import useAutoFocus from 'composables/autoFocus'
import { MAX_PREFIX_LEN } from 'config/app.conf'

export default {
  components: {
    ItemDetail,
    CodeEditor,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Formula'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'formulas-list',
      add: 'formula-add',
      detail: 'formula-detail',
    }
    const model = 'formulas'

    let element = reactive({ id: 0, enabled: false, code: '' })

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
        element.prefix.length <= MAX_PREFIX_LEN &&
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
      try {
        const [kindResponse, languagesResponse] = await Promise.all([
          api.get(`/api/v1/token/properties/kind/`),
          api.get(`/api/v1/public/languages/`),
        ])

        kind.value = Object.entries(kindResponse.data).map(([key, val]) => ({
          id: key,
          name: val,
        }))

        if (element.id && typeof element.kind === 'string') {
          element.kind = kind.value.find((x) => x.id == element.kind)
        }

        languages.value = Object.entries(languagesResponse.data).map(
          ([key, val]) => ({
            id: Number(key),
            name: val,
          }),
        )

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
      appIcon,
      modelIcon,
      primaryInput,
      MAX_PREFIX_LEN,
    }
  },
}
</script>
