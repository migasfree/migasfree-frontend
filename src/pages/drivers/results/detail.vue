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
                autofocus
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <FilteredMultiSelect
                v-model="element.model"
                :label="$gettext('Model')"
                :multiple="false"
                :fetch-options="filterModels"
              >
                <template #option="{ scope }">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.name }}
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
                      model="devices/models"
                      :pk="scope.opt.id"
                      :value="`${scope.opt.name} (${scope.opt.manufacturer.name})`"
                    />
                  </q-chip>
                </template>
              </FilteredMultiSelect>
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
              >
                <template #prepend>
                  <q-icon :name="modelIcon('projects')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'project-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>
              </q-select>

              <q-btn
                color="secondary"
                class="q-ma-sm"
                :icon="appIcon('add')"
                :icon-right="modelIcon('projects')"
                @click="$router.push({ name: 'project-add' })"
                ><q-tooltip>{{ $gettext('Add Project') }}</q-tooltip></q-btn
              >
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
              >
                <template #prepend>
                  <q-icon :name="modelIcon('devices/capabilities')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'capability-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>
              </q-select>

              <q-btn
                color="secondary"
                class="q-ma-sm"
                :icon="appIcon('add')"
                :icon-right="modelIcon('devices/capabilities')"
                @click="$router.push({ name: 'capability-add' })"
                ><q-tooltip>{{ $gettext('Add Capability') }}</q-tooltip></q-btn
              >
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <OrderTextArea
                v-model="element.packages_to_install"
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import OrderTextArea from 'components/ui/OrderTextArea'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    FilteredMultiSelect,
    ItemDetail,
    OrderTextArea,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()

    const title = ref($gettext('Driver'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'drivers-list',
      add: 'driver-add',
      detail: 'driver-detail',
    }
    const model = 'devices/drivers'

    const element = reactive({
      id: 0,
      name: undefined,
      model: null,
      project: null,
      capability: null,
      packages_to_install: null,
    })

    const projects = ref([])
    const capabilities = ref([])

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
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
      try {
        const [capabilitiesResponse, projectsResponse] = await Promise.all([
          api.get('/api/v1/token/devices/capabilities/'),
          api.get('/api/v1/token/projects/'),
        ])

        capabilities.value = capabilitiesResponse.data.results
        projects.value = projectsResponse.data.results

        if (Array.isArray(element?.packages_to_install)) {
          element.packages_to_install = element.packages_to_install.join('\n')
        }

        if (route.query.project)
          element.project =
            projects.value.find(
              (item) => item.id === Number(route.query.project),
            ) || null

        if (route.query.capability)
          element.capability =
            capabilities.value.find(
              (item) => item.id === Number(route.query.capability),
            ) || null
      } catch (error) {
        uiStore.notifyError(error)
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

    const filterModels = async (val) => {
      const { data } = await api.get('/api/v1/token/devices/models/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      projects,
      capabilities,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
      filterModels,
    }
  },
}
</script>
