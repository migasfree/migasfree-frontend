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
      @set-related="setRelated"
      @update-related="updateRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h6 q-px-md q-pt-md text-primary">
            {{ $gettext('General') }}
          </div>
          <div class="row q-pa-md q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <EntitySelect
                v-model="element.property_att"
                :options="stamps"
                :label="$gettext('Stamp')"
                link-model="stamps"
                chip-mode
                add-route="stamp-add"
                :add-tooltip="$gettext('Add Stamp')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="element.value"
                :label="$gettext('Value')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-px-md q-pb-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                type="textarea"
                rows="2"
                autogrow
                :label="$gettext('Description')"
              />
            </div>
          </div>

          <div class="row q-px-md q-pb-md q-col-gutter-md">
            <div class="col-12">
              <FilteredMultiSelect
                v-model="element.computers"
                :label="$gettext('Computers')"
                :fetch-options="filterComputers"
              >
                <template #option="{ scope }">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.__str__ }}
                  </q-item>
                </template>

                <template #selected-item="{ scope }">
                  <q-chip
                    removable
                    dense
                    color="transparent"
                    :tabindex="scope.tabindex"
                    class="q-ma-sm q-pa-none"
                    @remove="scope.removeAtIndex(scope.index)"
                  >
                    <MigasLink
                      model="computers"
                      :pk="scope.opt.id"
                      :value="scope.opt.__str__ || ''"
                      :icon="elementIcon(scope.opt.status)"
                      :tooltip="scope.opt.summary"
                    />
                  </q-chip>
                </template>
              </FilteredMultiSelect>
            </div>

            <div
              v-if="element.id && inflicted.length > 0"
              class="col-12 col-sm-6"
            >
              <OverflowList
                model="computers"
                :label="$gettext('Inflicted Computers')"
                :items="inflicted"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6 q-px-md q-pt-md text-primary">
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import EntitySelect from 'components/ui/EntitySelect'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import OverflowList from 'components/ui/OverflowList'
import AddLocation from 'components/map/AddLocation'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

const { $gettext } = useGettext()
const { elementIcon } = useElement()
const uiStore = useUiStore()
const route = useRoute()

const title = ref($gettext('Tag'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'tags-list',
  add: 'tag-add',
  detail: 'tag-detail',
}
const model = 'tags'

const element = reactive({ id: 0, computers: [] })

const stamps = ref([])
const inflicted = ref([])

const viewMap = ref(false)
const coords = ref([0, 0])

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
    text: $gettext('Tags'),
    icon: modelIcon(model),
    to: 'tags-dashboard',
  },
])

const isValid = computed(() => {
  return (
    element.value !== undefined &&
    element.value.trim() !== '' &&
    Object.hasOwn(element, 'property_att')
  )
})

const loadRelated = async () => {
  try {
    const [stampsResponse, computersResponse] = await Promise.all([
      api.get('/api/v1/token/stamps/'),
      element.id
        ? api.get(`/api/v1/token/tags/${element.id}/computers/`)
        : Promise.resolve({ data: { computers: [], inflicted: [] } }),
    ])

    stamps.value = stampsResponse.data.results

    if (element.id) {
      element.computers = computersResponse.data.computers
      inflicted.value = computersResponse.data.inflicted
    }

    if (route.query.property_att)
      element.property_att =
        stamps.value.find(
          (item) => item.id === Number(route.query.property_att),
        ) || null
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const elementData = () => {
  return {
    property_att: element.property_att.id,
    value: element.value,
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

const updateRelated = async () => {
  const computers = element.computers?.map((item) => item.id) ?? []
  try {
    await api.patch(`/api/v1/token/${model}/${element.id}/computers/`, {
      computers,
    })
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const resetElement = () => {
  Object.assign(element, {
    id: 0,
    property_att: null,
    value: undefined,
    description: undefined,
    computers: [],
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

const filterComputers = async (val) => {
  const { data } = await api.get('/api/v1/token/computers/', {
    params: { search: val.toLowerCase() },
  })

  return data.results
}
</script>

<style scoped>
.map-wrapper {
  height: 300px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
[data-theme='dark'] .map-wrapper {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
