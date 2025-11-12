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
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <FilteredMultiSelect
                v-model="element.device"
                autofocus
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
                    :tabindex="scope.tabindex"
                    class="q-ma-md"
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

            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.attributes"
                :label="$gettext('Attributes')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
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
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.alternative_capability_name"
                outlined
                :label="$gettext('Alternative Capability Name')"
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

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const { $gettext } = useGettext()
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

    let element = reactive({ id: 0, attributes: [], device: null })

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
      modelIcon,
      filterDevices,
    }
  },
}
</script>
