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
      <template v-if="element.id" #actions>
        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('devices/models')"
          @click="
            $router.push({
              name: 'model-add',
              query: { connections: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Model') }}</q-tooltip></q-btn
        >
      </template>

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
              <EntitySelect
                v-model="element.device_type"
                :options="deviceTypes"
                :label="$gettext('Device Type')"
                detail-route="device-type-detail"
                add-route="device-type-add"
                :add-tooltip="$gettext('Add Device Type')"
                :prepend-icon="modelIcon('devices/types')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.fields"
                outlined
                :label="$gettext('Fields')"
                :hint="$gettext('Format: NAME[:Placeholder],...')"
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
import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: { EntitySelect, ItemDetail },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()

    const title = ref($gettext('Connection'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'connections-list',
      add: 'connection-add',
      detail: 'connection-detail',
    }
    const model = 'devices/connections'

    let element = reactive({ id: 0 })

    const deviceTypes = ref([])

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
        text: $gettext('Connections'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return (
        element.name !== undefined &&
        element.name.trim() !== '' &&
        element.device_type !== undefined
      )
    })

    const loadRelated = async () => {
      try {
        const { data } = await api.get('/api/v1/token/devices/types/')
        deviceTypes.value = data.results

        if (route.query.device_type)
          element.device_type =
            deviceTypes.value.find(
              (item) => item.id === Number(route.query.device_type),
            ) || null
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        device_type: element.device_type.id,
        fields: element.fields,
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        device_type: null,
        fields: undefined,
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
      deviceTypes,
      isValid,
      loadRelated,
      elementData,
      resetElement,
      setTitle,
      appIcon,
      modelIcon,
    }
  },
}
</script>
