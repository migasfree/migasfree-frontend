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
      :header-link="false"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.model"
                outlined
                use-input
                map-options
                input-debounce="0"
                :label="$gettext('Model')"
                :options="models"
                @filter="filterModels"
                @filter-abort="abortFilterModels"
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
                    {{ scope.opt.name }}
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
                      model="devices/models"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.project"
                outlined
                :label="$gettext('Project')"
                :options="projects"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                ><template #prepend>
                  <q-icon :name="modelIcon('projects')" />
                </template>
              </q-select>
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.capability"
                outlined
                :label="$gettext('Capability')"
                :options="capabilities"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                ><template #prepend>
                  <q-icon :name="modelIcon('devices/capabilities')" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.packages_to_install"
                outlined
                type="textarea"
                :label="$gettext('Packages to Install')"
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
import MigasLink from 'components/MigasLink'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Driver'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'drivers-list',
      add: 'driver-add',
      detail: 'driver-detail',
    }
    const model = 'devices/drivers'

    let element = reactive({
      id: 0,
      name: undefined,
      model: null,
      project: null,
      capability: null,
      packages_to_install: null,
    })

    const projects = ref([])
    const models = ref([])
    const capabilities = ref([])

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Devices'),
        icon: 'mdi-printer-eye',
      },
      {
        text: $gettext('Drivers'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.model !== undefined &&
        element.capability !== undefined &&
        element.project !== undefined
      )
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          capabilities.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      await api
        .get('/api/v1/token/projects/')
        .then((response) => {
          projects.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (element.id) {
        element.packages_to_install = element.packages_to_install.join('\n')
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        model: element.model.id,
        project: element.project.id,
        capability: element.capability.id,
        packages_to_install:
          element.packages_to_install !== null
            ? element.packages_to_install.split('\n')
            : [],
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        model: null,
        project: null,
        capability: null,
        packages_to_install: [],
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const filterModels = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/devices/models/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          models.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterModels = () => {
      // console.log('delayed filter aborted')
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      projects,
      models,
      capabilities,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      modelIcon,
      filterModels,
      abortFilterModels,
    }
  },
}
</script>
