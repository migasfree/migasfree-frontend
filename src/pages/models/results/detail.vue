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
              <EntitySelect
                v-model="element.device_type"
                focus
                :options="deviceTypes"
                :label="$gettext('Type')"
                detail-route="device-type-detail"
                add-route="device-type-add"
                :add-tooltip="$gettext('Add Device Type')"
                :prepend-icon="modelIcon('devices/types')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.manufacturer"
                :options="manufacturers"
                :label="$gettext('Manufacturer')"
                detail-route="manufacturer-detail"
                add-route="manufacturer-add"
                :add-tooltip="$gettext('Add Manufacturer')"
                :prepend-icon="modelIcon('devices/manufacturers')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-model="element.connections"
                :options="connections"
                multiple
                chip-mode
                :label="$gettext('Connections')"
                detail-route="connection-detail"
                add-route="connection-add"
                :add-tooltip="$gettext('Add Connection')"
                :prepend-icon="modelIcon('devices/connections')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
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
                    <EntitySelect
                      v-model="driver.project"
                      :options="projects"
                      :label="$gettext('Project')"
                      detail-route="project-detail"
                      :prepend-icon="modelIcon('projects')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>

                  <div class="col-5 col-md col-sm">
                    <EntitySelect
                      v-model="driver.capability"
                      :options="capabilities"
                      :label="$gettext('Capability')"
                      detail-route="capability-detail"
                      :prepend-icon="modelIcon('devices/capabilities')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
                    <q-input v-model="driver.name" :label="$gettext('Name')" />
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import EntitySelect from 'components/ui/EntitySelect'
import ItemDetail from 'components/ui/ItemDetail'
import OrderTextArea from 'components/ui/OrderTextArea'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    EntitySelect,
    ItemDetail,
    OrderTextArea,
  },
  setup() {
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()
    const route = useRoute()
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

      if (route.query.device_type)
        element.device_type =
          deviceTypes.value.find(
            (item) => item.id === Number(route.query.device_type),
          ) || null

      if (route.query.manufacturer)
        element.manufacturer =
          manufacturers.value.find(
            (item) => item.id === Number(route.query.manufacturer),
          ) || null

      if (route.query.connections) {
        const ids = route.query.connections.split(',').map((v) => Number(v))

        element.connections = connections.value.filter((item) =>
          ids.includes(item.id),
        )
      }

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
      const buildPayload = (driver) => ({
        model: element.id,
        project: driver.project.id,
        capability: driver.capability.id,
        name: driver.name,
        packages_to_install:
          driver.packages_to_install !== null
            ? driver.packages_to_install.split('\n')
            : [],
      })

      const driverPromises = drivers.value
        .filter((d) => d.project && d.capability) // skip invalid entries
        .map(async (driver) => {
          const payload = buildPayload(driver)
          try {
            if (driver.id > 0) {
              await api.patch(
                `/api/v1/token/devices/drivers/${driver.id}/`,
                payload,
              )
            } else {
              await api.post('/api/v1/token/devices/drivers/', payload)
            }
          } catch (error) {
            uiStore.notifyError(error)
          }
        })

      const removePromises = removedDrivers.value.map((id) =>
        api
          .delete(`/api/v1/token/devices/drivers/${id}/`)
          .catch((error) => uiStore.notifyError(error)),
      )

      await Promise.all([...driverPromises, ...removePromises])
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
      primaryInput,
    }
  },
}
</script>
