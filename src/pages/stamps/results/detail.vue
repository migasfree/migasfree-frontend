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
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
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

import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Stamp'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'stamps-list',
      add: 'stamp-add',
      detail: 'stamp-detail',
    }
    const model = 'stamps'

    let element = reactive({
      id: 0,
      enabled: false,
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
        text: $gettext('Stamps'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const kind = ref([])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.kind !== undefined &&
        element.prefix !== undefined &&
        element.prefix.length <= 3
      )
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/properties/kind/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            kind.value.push({
              id: key,
              name: val,
            })
          })
          if (element.id)
            element.kind = kind.value.find((x) => x.id == element.kind)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (typeof element.kind === 'string')
        element.kind = kind.value.find((x) => x.id == element.kind)
    }

    const elementData = () => {
      return {
        name: element.name,
        prefix: element.prefix,
        enabled: element.enabled,
        kind: element.kind.id,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        prefix: undefined,
        enabled: false,
        kind: undefined,
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
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
    }
  },
}
</script>
