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
      :add-button="false"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-related="setRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h6 q-px-md q-pt-md text-primary flex items-center">
            {{ $gettext('General') }}
          </div>

          <div class="row q-pa-md q-col-gutter-lg">
            <div class="col-12 col-sm-4">
              <div class="text-caption text-muted q-mb-xs">
                {{ $gettext('Formula') }}
              </div>
              <MigasLink
                v-if="'property_att' in element"
                model="formulas"
                :pk="element.property_att.id"
                :value="element.property_att.name || ''"
                class="text-weight-bold"
              />
            </div>

            <div class="col-12 col-sm-4">
              <div class="text-caption text-muted q-mb-xs">
                {{ $gettext('Prefix') }}
              </div>
              <template v-if="element.id">
                <q-icon
                  :name="elementIcon(element.property_att.prefix)"
                  size="xs"
                  class="q-mr-xs text-primary"
                />
                <span class="text-weight-medium">{{
                  element.property_att.prefix
                }}</span>
              </template>
            </div>

            <div class="col-12 col-sm-4">
              <div class="text-caption text-muted q-mb-xs">
                {{ $gettext('Value') }}
              </div>
              <span class="text-weight-bold">{{ element.value }}</span>
            </div>
          </div>

          <div class="row q-px-md q-pb-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                type="textarea"
                rows="3"
                autogrow
                outlined
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6 q-px-md q-pt-md text-primary flex items-center">
            {{ $gettext('Location') }}
          </div>

          <div class="row q-pa-md items-center">
            <q-toggle
              v-model="viewMap"
              :label="
                viewMap
                  ? $gettext('Remove Coordinates')
                  : $gettext('Add Coordinates')
              "
              color="primary"
              @update:model-value="updateCoords"
            />
          </div>

          <q-slide-transition>
            <div v-if="viewMap">
              <div class="row q-px-md q-pb-md q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="element.latitude"
                    outlined
                    dense
                    :label="$gettext('Latitude')"
                    @update:model-value="updateMapCoords"
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="element.longitude"
                    outlined
                    dense
                    :label="$gettext('Longitude')"
                    @update:model-value="updateMapCoords"
                  />
                </div>
              </div>

              <div class="row q-px-md q-pb-md">
                <div class="col-12">
                  <div
                    class="map-wrapper rounded-borders overflow-hidden shadow-1"
                  >
                    <AddLocation
                      v-model="coords"
                      @update-coords="updateCoords"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import ItemDetail from 'components/ui/ItemDetail'
import AddLocation from 'components/map/AddLocation'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

const { $gettext } = useGettext()
const { elementIcon } = useElement()

const title = ref($gettext('Attribute'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'attributes-list',
  detail: 'attribute-detail',
}
const model = 'features'

const element = reactive({
  id: 0,
  description: undefined,
  latitude: null,
  longitude: null,
})

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Data'),
    icon: appIcon('data'),
  },
  {
    text: $gettext('Attributes'),
    icon: modelIcon('attributes'),
    to: 'attributes-dashboard',
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
</script>

<style scoped>
.text-muted {
  color: var(--text-muted);
}
.map-wrapper {
  height: 300px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
[data-theme='dark'] .map-wrapper {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
