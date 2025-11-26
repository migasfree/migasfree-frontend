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
                v-model="element.enabled"
                left-label
                autofocus
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
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.property_att"
                outlined
                :label="$gettext('Formula')"
                :options="formulas"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('formulas')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'formula-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>

                <template #append>
                  <q-btn
                    round
                    dense
                    color="secondary"
                    :icon="appIcon('add')"
                    @click="$router.push({ name: 'formula-add' })"
                    ><q-tooltip>{{ $gettext('Add Formula') }}</q-tooltip></q-btn
                  >
                </template>
              </q-select>
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.priority"
                outlined
                type="number"
                :label="$gettext('Priority')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
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
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Code') }}</div>

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
                  <p>
                    {{
                      $gettext(
                        'This code will execute in the client computer, and it must put in the standard output the value of the attribute correspondent to this property.',
                      )
                    }}
                  </p>
                  <p>
                    {{
                      $gettext(
                        "The format of this value is 'name~description', where 'description' is optional.",
                      )
                    }}
                  </p>
                  <p>
                    <b>{{ $gettext('Example of code:') }}</b>
                  </p>
                  <p>
                    <code>
                      {{
                        $gettext(
                          '# Create an attribute with the name of computer from bash',
                        )
                      }} </code
                    ><br />echo $HOSTNAME
                  </p>
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import SelectAttributes from 'components/ui/SelectAttributes'
import CodeEditor from 'components/ui/CodeEditor'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    SelectAttributes,
    CodeEditor,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()

    const title = ref($gettext('Singularity'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'singularities-list',
      add: 'singularity-add',
      detail: 'singularity-detail',
    }
    const model = 'singularities'

    const element = reactive({
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
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
        text: $gettext('Singularities'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const formulas = ref([])
    const languages = ref([])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.property_att !== undefined &&
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
        const [formulasResponse, languagesResponse] = await Promise.all([
          api.get('/api/v1/token/formulas/?sort=client'),
          api.get('/api/v1/public/languages/'),
        ])

        formulas.value = formulasResponse.data.results

        languages.value = Object.entries(languagesResponse.data).map(
          ([id, name]) => ({
            id: parseInt(id),
            name,
          }),
        )

        if (element.id && typeof element.language === 'number') {
          element.language = languages.value.find(
            (x) => x.id === element.language,
          )
        }

        if (route.query.property_att)
          element.property_att =
            formulas.value.find(
              (item) => item.id === Number(route.query.property_att),
            ) || null
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        enabled: element.enabled,
        name: element.name,
        priority: element.priority,
        property_att: element.property_att.id,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
        language: element.language.id,
        code: element.code,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        property_att: undefined,
        priority: 0,
        included_attributes: [],
        excluded_attributes: [],
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
      formulas,
      languages,
      isValid,
      highlightLang,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
    }
  },
}
</script>
