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
      @update-related="updateRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.device_type"
                outlined
                autofocus
                :label="$gettext('Type')"
                :options="deviceTypes"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('devices/types')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'device-type-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>
              </q-select>
            </div>

            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.manufacturer"
                outlined
                :label="$gettext('Manufacturer')"
                :options="manufacturers"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('devices/manufacturers')" />
                </template>

                <template #selected-item="scope">
                  <q-btn
                    no-caps
                    flat
                    color="primary"
                    :to="{
                      name: 'manufacturer-detail',
                      params: { id: scope.opt.id },
                    }"
                    :label="scope.opt.name"
                  />
                </template>
              </q-select>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.connections"
                outlined
                multiple
                counter
                :label="$gettext('Connections')"
                :options="connections"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('devices/connections')" />
                </template>

                <template #selected-item="scope">
                  <q-chip
                    removable
                    dense
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <q-btn
                      no-caps
                      flat
                      color="primary"
                      :to="{
                        name: 'connection-detail',
                        params: { id: scope.opt.id },
                      }"
                      :label="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
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
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Drivers') }}</div>

          <q-list v-if="drivers.length > 0" class="q-pa-md" bordered separator>
            <q-item v-for="(driver, index) in drivers" :key="index">
              <q-item-section side top>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  :icon="appIcon('delete')"
                  @click="removeInline(index)"
                  ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                >
              </q-item-section>

              <q-item-section>
                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
                    <q-select
                      v-model="driver.project"
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
                  </div>

                  <div class="col-5 col-md col-sm">
                    <q-select
                      v-model="driver.capability"
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
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
                    <q-input
                      v-model="driver.name"
                      outlined
                      :label="$gettext('Name')"
                    />
                  </div>

                  <div class="col-5 col-md col-sm">
                    <OrderTextArea
                      v-model="driver.packages_to_install"
                      :label="$gettext('Packages to Install')"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-pa-md">
            <q-btn
              :icon="appIcon('add')"
              :label="$gettext('Add other Driver')"
              @click="addInline"
            />
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
import OrderTextArea from 'components/ui/OrderTextArea'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    OrderTextArea,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Model'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'models-list',
      add: 'model-add',
      detail: 'model-detail',
    }
    const model = 'devices/models'

    let element = reactive({ id: 0, connections: [] })

    const deviceTypes = ref([])
    const manufacturers = ref([])
    const connections = ref([])
    const drivers = ref([])
    const removedDrivers = ref([])
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
        text: $gettext('Models'),
        icon: modelIcon(model),
        to: 'models-dashboard',
      },
    ])

    const isValid = computed(() => {
      return (
        element.device_type !== undefined &&
        element.manufacturer !== undefined &&
        element.name !== undefined &&
        element.name.trim() !== ''
      )
    })

    const loadRelated = async () => {
      const fetchAndAssign = async (url, target) => {
        try {
          const { data } = await api.get(url)
          target.value = data.results
        } catch (error) {
          uiStore.notifyError(error)
        }
      }

      await Promise.all([
        fetchAndAssign('/api/v1/token/devices/types/', deviceTypes),
        fetchAndAssign('/api/v1/token/devices/manufacturers/', manufacturers),
        fetchAndAssign('/api/v1/token/devices/connections/', connections),
        fetchAndAssign('/api/v1/token/projects/', projects),
        fetchAndAssign('/api/v1/token/devices/capabilities/', capabilities),
      ])

      if (element.id) {
        try {
          const { data } = await api.get(
            `/api/v1/token/devices/drivers/?model__id=${element.id}`,
          )
          drivers.value = data.results.map((item) => ({
            ...item,
            packages_to_install: item.packages_to_install.join('\n'),
          }))
        } catch (error) {
          uiStore.notifyError(error)
        }
      }
    }

    const elementData = () => {
      return {
        device_type: element.device_type.id,
        manufacturer: element.manufacturer.id,
        name: element.name,
        connections: element.connections.map((item) => item.id),
      }
    }

    const updateRelated = async () => {
      drivers.value.forEach((driver) => {
        if (driver.project === undefined || driver.capability === undefined) {
          return
        }

        if (driver.id > 0) {
          api
            .patch(`/api/v1/token/devices/drivers/${driver.id}/`, {
              model: element.id,
              project: driver.project.id,
              capability: driver.capability.id,
              name: driver.name,
              packages_to_install:
                driver.packages_to_install !== null
                  ? driver.packages_to_install.split('\n')
                  : [],
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        } else {
          api
            .post('/api/v1/token/devices/drivers/', {
              model: element.id,
              project: driver.project.id,
              capability: driver.capability.id,
              name: driver.name,
              packages_to_install:
                driver.packages_to_install !== null
                  ? driver.packages_to_install.split('\n')
                  : [],
            })
            .catch((error) => {
              uiStore.notifyError(error)
            })
        }
      })

      removedDrivers.value.forEach((id) => {
        api.delete(`/api/v1/token/devices/drivers/${id}/`).catch((error) => {
          uiStore.notifyError(error)
        })
      })
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        device_type: null,
        manufacturer: null,
        connections: [],
      })
    }

    const resetRelated = () => {
      drivers.value = []
      removedDrivers.value = []
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const addInline = () => {
      drivers.value.push({
        id: 0,
        project: null,
        capability: null,
        name: null,
        packages_to_install: null,
      })
    }

    const removeInline = (index) => {
      const removedItem = drivers.value.splice(index, 1)[0]
      if (removedItem.id > 0) {
        removedDrivers.value.push(removedItem.id)
      }
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      deviceTypes,
      manufacturers,
      connections,
      drivers,
      removedDrivers,
      projects,
      capabilities,
      isValid,
      elementData,
      loadRelated,
      updateRelated,
      resetElement,
      resetRelated,
      setTitle,
      addInline,
      removeInline,
      appIcon,
      modelIcon,
    }
  },
}
</script>
