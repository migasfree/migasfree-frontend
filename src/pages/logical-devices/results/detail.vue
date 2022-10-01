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
              <q-select
                v-model="element.device"
                outlined
                use-input
                map-options
                input-debounce="0"
                :label="$gettext('Device')"
                :hint="
                  $gettext('Type to search (minimum %{num} characters)', {
                    num: MIN_CHARS_SEARCH,
                  })
                "
                :options="devices"
                @filter="filterDevices"
                @filter-abort="abortFilterDevices"
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
                      model="devices/devices"
                      :pk="scope.opt.id"
                      :value="scope.opt.name"
                    />
                  </q-chip>
                </template>
              </q-select>
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
                ><template #prepend>
                  <q-icon :name="modelIcon('devices/capabilities')" />
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
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Logical Device'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'logical-devices-list',
      add: 'logical-device-add',
      detail: 'logical-device-detail',
    }
    const model = 'devices/logical'

    let element = reactive({ id: 0, attributes: [] })

    const devices = ref([])
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
        text: $gettext('Logical Devices'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.device !== undefined && element.capability !== undefined
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

    const filterDevices = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/devices/devices/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          devices.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterDevices = () => {
      // console.log('delayed filter aborted')
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      devices,
      capabilities,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      modelIcon,
      filterDevices,
      abortFilterDevices,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>
