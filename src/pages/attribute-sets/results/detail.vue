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
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-related="setRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-checkbox
                v-model="element.enabled"
                left-label
                autofocus
                :label="$gettext('Enabled?')"
              />
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

          <div class="row q-pa-md q-gutter-md">
            <div class="col-12 col-md col-sm">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Attributes') }}
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.included_attributes"
                :label="$gettext('Included')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.excluded_attributes"
                :label="$gettext('Excluded')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Location') }}</div>

          <q-toggle
            v-model="viewMap"
            :label="
              viewMap
                ? $gettext('Remove Coordinates')
                : $gettext('Add Coordinates')
            "
            :false-value="false"
            :true-value="true"
            @update:model-value="updateCoords"
          />

          <q-slide-transition>
            <div v-if="viewMap">
              <div class="row q-pa-md q-gutter-md">
                <div class="col-6 col-md col-sm">
                  <q-input
                    v-model="element.latitude"
                    outlined
                    :label="$gettext('Latitude')"
                    @update:model-value="updateMapCoords"
                  />
                </div>

                <div class="col-6 col-md col-sm">
                  <q-input
                    v-model="element.longitude"
                    outlined
                    :label="$gettext('Longitude')"
                    @update:model-value="updateMapCoords"
                  />
                </div>
              </div>

              <div class="row q-pa-md q-gutter-md">
                <div class="col">
                  <AddLocation v-model="coords" @update-coords="updateCoords" />
                </div>
              </div>
            </div>
          </q-slide-transition>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import ItemDetail from 'components/ui/ItemDetail'
import SelectAttributes from 'components/ui/SelectAttributes'
import AddLocation from 'components/map/AddLocation'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    SelectAttributes,
    AddLocation,
  },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('Attribute Set'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'attribute-sets-list',
      add: 'attribute-set-add',
      detail: 'attribute-set-detail',
    }
    const model = 'attribute-sets'

    let element = reactive({
      id: 0,
      enabled: false,
      included_attributes: [],
      excluded_attributes: [],
      latitude: null,
      longitude: null,
    })

    const viewMap = ref(false)
    const coords = ref([0, 0])

    const breadcrumbs = ref([
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
        text: $gettext('Attribute Sets'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const elementData = () => {
      return {
        name: element.name,
        description: element.description,
        enabled: element.enabled,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
        latitude: element.latitude,
        longitude: element.longitude,
      }
    }

    const setRelated = () => {
      if (element.latitude !== null) {
        coords.value = [element.latitude, element.longitude]
        viewMap.value = true
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          coords.value = [position.coords.latitude, position.coords.longitude]
        })
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        description: undefined,
        included_attributes: [],
        excluded_attributes: [],
        latitude: null,
        longitude: null,
      })
    }

    const resetRelated = () => {
      viewMap.value = false
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const updateCoords = (params) => {
      if (viewMap.value) {
        element.latitude = params[0]
        element.longitude = params[1]
      } else {
        element.latitude = null
        element.longitude = null
      }
    }

    const updateMapCoords = () => {
      coords.value = [element.latitude, element.longitude]
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      viewMap,
      coords,
      isValid,
      elementData,
      setRelated,
      resetElement,
      resetRelated,
      setTitle,
      updateCoords,
      updateMapCoords,
    }
  },
}
</script>
