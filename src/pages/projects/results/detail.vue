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
            <div class="col-4 col-md col-sm">
              <q-select
                v-model="element.platform"
                outlined
                autofocus
                :label="$gettext('Platform')"
                :options="platforms"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('platforms')" />
                </template>
              </q-select>
            </div>

            <div class="col-4 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) =>
                    val === '' ||
                    !val.includes(' ') ||
                    $gettext('* No blank spaces allowed'),
                ]"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-input
                v-model="element.base_os"
                outlined
                :label="$gettext('Base Operating System')"
                lazy-rules
                :rules="[
                  (val) =>
                    !(val && val.trim() !== '' && val.includes(' ')) ||
                    $gettext('* No blank spaces allowed'),
                ]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-4 col-md col-sm">
              <q-checkbox
                v-model="element.auto_register_computers"
                left-label
                :label="$gettext('Auto register computers?')"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-select
                v-model="element.pms"
                outlined
                :label="$gettext('Package Management System')"
                :options="pms"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                @update:model-value="updateArchitectures"
              />
            </div>

            <div class="col-4 col-md col-sm">
              <q-select
                v-model="element.architecture"
                outlined
                multiple
                :rules="[(val) => !!val || $gettext('* Required')]"
                :label="$gettext('Architecture')"
                :options="architectures"
                :disable="!element.pms"
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

    const title = ref($gettext('Project'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'projects-list',
      add: 'project-add',
      detail: 'project-detail',
    }
    const model = 'projects'

    let element = reactive({ id: 0, auto_register_computers: false })

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
        text: $gettext('Projects'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const platforms = ref([])
    const pms = ref([])

    const architectures = computed(() => {
      if (!element.pms) return []

      return pms.value
        .filter((pms) => pms.id === element.pms.id)
        .flatMap((pms) => pms.architectures)
    })

    const updateArchitectures = () => {
      element.architecture = []
    }

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        !element.name.includes(' ') &&
        (element.base_os === undefined ||
          element.base_os === null ||
          element.base_os.trim() === '' ||
          !element.base_os.includes(' ')) &&
        element.platform !== undefined &&
        element.pms !== undefined &&
        element.architecture !== undefined
      )
    })

    const elementData = () => {
      return {
        name: element.name,
        base_os: element.base_os,
        architecture: Array.isArray(element.architecture)
          ? element.architecture.join(' ')
          : '',
        platform: element.platform.id,
        auto_register_computers: element.auto_register_computers,
        pms: element.pms.id,
      }
    }

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/platforms/')
        .then((response) => {
          platforms.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/public/pms/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            pms.value.push({
              id: key,
              name: val.module,
              architectures: val.architectures,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (typeof element.pms === 'string')
        element.pms = pms.value.find((x) => x.id === element.pms)

      if (typeof element.architecture === 'string')
        element.architecture = element.architecture
          ? element.architecture.split(' ')
          : []
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        auto_register_computers: false,
        name: undefined,
        base_os: undefined,
        platform: undefined,
        pms: undefined,
        architecture: undefined,
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
      platforms,
      pms,
      architectures,
      updateArchitectures,
      isValid,
      elementData,
      loadRelated,
      resetElement,
      setTitle,
      modelIcon,
    }
  },
}
</script>
