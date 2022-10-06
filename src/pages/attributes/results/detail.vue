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
      :add-button="false"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-related="setRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <MigasLink
                v-if="'property_att' in element"
                model="formulas"
                :pk="element.property_att.id"
                :value="element.property_att.name || ''"
                :tooltip="$gettext('Formula')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-icon
                :name="modelIcon('attributes')"
                size="sm"
                class="vertical-middle"
              />
              <span class="vertical-middle">{{ element.value }}</span>
              <q-tooltip self="bottom middle">{{
                $gettext('Value')
              }}</q-tooltip>
            </div>
          </div>

          <div class="row q-pa-md">
            <div class="col">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                autofocus
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">Location</div>

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
import AddLocation from 'components/map/AddLocation'
import MigasLink from 'components/MigasLink'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    AddLocation,
  },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('Attribute'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'attributes-list',
      detail: 'attribute-detail',
    }
    const model = 'features'

    let element = reactive({
      id: 0,
      description: undefined,
      latitude: null,
      longitude: null,
    })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: $gettext('Attributes'),
        to: 'attributes-dashboard',
        icon: modelIcon('attributes'),
      },
    ])

    const viewMap = ref(false)
    const coords = ref([0, 0])

    const isValid = computed(() => {
      return true
    })

    const elementData = () => {
      return {
        description: element.description,
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
        description: undefined,
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
      modelIcon,
    }
  },
}
</script>
