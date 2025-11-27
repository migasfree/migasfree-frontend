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
      @set-related="setRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

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
              <SelectAttributes
                v-model="element.available_for_attributes"
                :label="$gettext('Available for Attributes')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <FilteredMultiSelect
                v-model="element.model"
                :label="$gettext('Model')"
                :multiple="false"
                :fetch-options="filterModels"
                @update:model-value="resetConnections"
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

            <div class="col-6 col-md col-sm">
              <EntitySelect
                v-if="element.model"
                v-model="element.connection"
                :options="element.model.connections"
                :label="$gettext('Connection')"
                detail-route="connection-detail"
                :prepend-icon="modelIcon('devices/connections')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
                @update:model-value="localConnectionFields"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="element.connection">
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Connection Fields') }}
          </div>

          <div
            v-for="(field, index) in element.connection.fields"
            :key="index"
            class="row q-pa-md q-gutter-md"
          >
            <div class="col-md">
              <q-input
                v-model="field.value"
                outlined
                :label="field.id"
                :hint="field.hint"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Logical Devices') }}
          </div>

          <template v-if="!isLoadingLogical">
            <q-list
              v-if="logicalDevices.length > 0"
              class="q-pa-md"
              bordered
              separator
            >
              <q-item v-for="(logical, index) in logicalDevices" :key="index">
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
                        v-model="logical.capability"
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

                    <div class="col-5 col-md col-sm">
                      <q-input
                        v-model="logical.alternative_capability_name"
                        outlined
                        :label="$gettext('Alternative Capability Name')"
                      />
                    </div>
                  </div>

                  <div class="row q-pa-md q-gutter-md">
                    <div class="col-10 col-md col-sm">
                      <SelectAttributes
                        v-model="logical.attributes"
                        :label="$gettext('Attributes')"
                      />
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-pa-md">
              <q-btn
                :icon="appIcon('add')"
                :label="$gettext('Add other Logical Device')"
                @click="addInline"
              />
            </div>
          </template>

          <template v-else>
            <q-spinner-dots color="primary" size="3em" />
          </template>
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

import EntitySelect from 'components/ui/EntitySelect'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    EntitySelect,
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Device'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'devices-list',
      add: 'device-add',
      detail: 'device-detail',
    }
    const model = 'devices/devices'

    let element = reactive({ id: 0, available_for_attributes: [], model: null })

    const logicalDevices = ref([])
    const removedLogicalDevices = ref([])
    const capabilities = ref([])
    const isLoadingLogical = ref(false)

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
        text: $gettext('Devices'),
        icon: modelIcon(model),
        to: 'devices-dashboard',
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.model !== undefined &&
        element.model !== null &&
        element.connection !== null
      )
    })

    const localConnectionFields = async () => {
      if (!element.connection?.id) return

      try {
        const { data } = await api.get(
          `/api/v1/token/devices/connections/${element.connection.id}/`,
        )
        // `data.fields` is a string separated by commas
        element.connection.fields = data.fields.split(',').map((item) => {
          const [id, hint] = item.trim().split(':')

          return {
            id,
            value: element.data?.[id] ?? null,
            hint: hint ?? null,
          }
        })
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/token/devices/capabilities/')
        capabilities.value = data.results
      } catch (error) {
        uiStore.notifyError(error)
      }

      if (element.id) {
        isLoadingLogical.value = true
        try {
          const { data } = await api.get(
            `/api/v1/token/devices/logical/?device__id=${element.id}`,
          )
          logicalDevices.value = data.results
        } catch (error) {
          uiStore.notifyError(error)
        } finally {
          isLoadingLogical.value = false
        }

        localConnectionFields()
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        model: element.model.id,
        connection: element.connection.id,
        available_for_attributes: element.available_for_attributes
          ? element.available_for_attributes.map((item) => item.id)
          : [],
        data: element.connection.fields.reduce((obj, v) => {
          if (v.value) obj[v.id] = v.value
          return obj
        }, {}),
      }
    }

    const updateRelated = async () => {
      for (const logical of logicalDevices.value) {
        if (!logical.capability) return

        const payload = {
          device: element.id,
          capability: logical.capability.id,
          alternative_capability_name: logical.alternative_capability_name,
          attributes: logical.attributes?.map((item) => item.id) ?? [],
        }

        const isExisting = logical.id > 0
        const method = isExisting ? 'patch' : 'post'
        const url = isExisting
          ? `/api/v1/token/devices/logical/${logical.id}/`
          : '/api/v1/token/devices/logical/'

        if (isExisting) payload.id = logical.id

        try {
          await api[method](url, payload)
        } catch (error) {
          uiStore.notifyError(error)
        }
      }

      for (const id of removedLogicalDevices.value) {
        try {
          await api.delete(`/api/v1/token/devices/logical/${id}/`)
        } catch (error) {
          uiStore.notifyError(error)
        }
      }
    }

    const setRelated = async () => {
      await localConnectionFields()
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        model: null,
        connection: null,
        available_for_attributes: [],
        data: {},
      })
    }

    const resetRelated = () => {
      logicalDevices.value = []
      removedLogicalDevices.value = []
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const resetConnections = () => {
      element.connection = null
    }

    const addInline = () => {
      logicalDevices.value.push({
        id: 0,
        capability: null,
        alternative_capability_name: null,
        attributes: [],
      })
    }

    const removeInline = (index) => {
      const removedItem = logicalDevices.value.splice(index, 1)[0]
      if (removedItem.id > 0) {
        removedLogicalDevices.value.push(removedItem.id)
      }
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
      logicalDevices,
      removedLogicalDevices,
      capabilities,
      isLoadingLogical,
      isValid,
      elementData,
      loadRelated,
      localConnectionFields,
      updateRelated,
      setRelated,
      resetElement,
      resetRelated,
      setTitle,
      resetConnections,
      addInline,
      removeInline,
      filterModels,
      appIcon,
      modelIcon,
    }
  },
}
</script>
