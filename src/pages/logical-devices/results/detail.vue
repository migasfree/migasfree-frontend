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
          <div class="text-h5 q-mt-sm q-mb-md">{{ $gettext('General') }}</div>

          <div class="row q-col-gutter-lg q-mb-md">
            <div class="col-12 col-md-6">
              <FilteredMultiSelect
                ref="primaryInput"
                v-model="element.device"
                :label="$gettext('Device')"
                :multiple="false"
                :fetch-options="filterDevices"
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
                    color="transparent"
                    :tabindex="scope.tabindex"
                    class="q-ma-md q-pa-none"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="devices/devices"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </FilteredMultiSelect>
            </div>

            <div class="col-12 col-md-6">
              <EntitySelect
                v-model="element.capability"
                :options="capabilities"
                :label="$gettext('Capability')"
                detail-route="capability-detail"
                add-route="capability-add"
                :add-tooltip="$gettext('Add Capability')"
                :prepend-icon="modelIcon('devices/capabilities')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <q-input
                v-model="element.alternative_capability_name"
                :label="$gettext('Alternative Capability Name')"
              />
            </div>

            <div class="col-12 col-md-6">
              <SelectAttributes
                v-model="element.attributes"
                :label="$gettext('Attributes')"
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

import EntitySelect from 'components/ui/EntitySelect'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

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
    const { inputRef: primaryInput } = useAutoFocus()
    const route = useRoute()
    const uiStore = useUiStore()

    const title = ref($gettext('Logical Device'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'logical-devices-list',
      add: 'logical-device-add',
      detail: 'logical-device-detail',
    }
    const model = 'devices/logical'

    const element = reactive({ id: 0, attributes: [], device: null })

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
        text: $gettext('Logical Devices'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.device !== undefined && element.capability !== undefined
    })

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/token/devices/capabilities/')
        capabilities.value = data.results

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
        device: element.device.id,
        capability: element.capability.id,
        attributes: element.attributes.map((item) => item.id),
        alternative_capability_name: element.alternative_capability_name,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        device: null,
        capability: null,
        attributes: [],
        alternative_capability_name: undefined,
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const filterDevices = async (val) => {
      const { data } = await api.get('/api/v1/token/devices/devices/', {
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
      capabilities,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
      primaryInput,
      filterDevices,
    }
  },
}
</script>
