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
      @set-related="setRelated"
      @update-related="updateRelated"
      @reset-element="resetElement"
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.property_att"
                outlined
                :label="$gettext('Stamp')"
                :options="stamps"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.value"
                outlined
                label="Valor"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                :label="$gettext('Description')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-select
                v-model="element.computers"
                outlined
                use-input
                map-options
                multiple
                counter
                input-debounce="0"
                :label="$gettext('Computers')"
                :options="computers"
                @filter="filterComputers"
                @filter-abort="abortFilterComputers"
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
                    {{ scope.opt.__str__ }}
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
                      model="computers"
                      :pk="scope.opt.id"
                      :value="scope.opt.__str__ || ''"
                      :icon="elementIcon(scope.opt.status)"
                      :tooltip="scope.opt.summary"
                    />
                  </q-chip>
                </template>
              </q-select>
            </div>

            <div
              v-if="element.id && inflicted.length > 0"
              class="col-6 col-md col-sm"
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

          <template v-if="viewMap">
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

import ItemDetail from 'components/ui/ItemDetail'
import OverflowList from 'components/ui/OverflowList'
import AddLocation from 'components/map/AddLocation'
import MigasLink from 'components/MigasLink'

import { modelIcon, useElement } from 'composables/element'

export default {
  components: {
    ItemDetail,
    MigasLink,
    OverflowList,
    AddLocation,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const uiStore = useUiStore()

    const title = ref($gettext('Tag'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'tags-list',
      add: 'tag-add',
      detail: 'tag-detail',
    }
    const model = 'tags'

    let element = reactive({ id: 0, computers: [] })

    const stamps = ref([])
    const computers = ref([])
    const inflicted = ref([])

    const viewMap = ref(false)
    const coords = ref([0, 0])

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
        text: $gettext('Tags'),
        icon: modelIcon(model),
        to: 'tags-dashboard',
      },
    ])

    const isValid = computed(() => {
      return (
        element.value !== undefined &&
        element.value.trim() !== '' &&
        element.hasOwnProperty('property_att')
      )
    })

    const loadRelated = async () => {
      await api
        .get('/api/v1/token/stamps/')
        .then((response) => {
          stamps.value = response.data.results
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })

      if (element.id) {
        await api
          .get(`/api/v1/token/tags/${element.id}/computers/`)
          .then((response) => {
            element.computers = response.data.computers
            inflicted.value = response.data.inflicted
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
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
      await api
        .patch(`/api/v1/token/${model}/${element.id}/computers/`, {
          computers: element.computers
            ? element.computers.map((item) => item.id)
            : [],
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
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

    const filterComputers = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/computers/', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          computers.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterComputers = () => {
      // console.log('delayed filter aborted')
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      stamps,
      computers,
      inflicted,
      viewMap,
      coords,
      isValid,
      elementData,
      loadRelated,
      setRelated,
      updateRelated,
      resetElement,
      resetRelated,
      setTitle,
      updateCoords,
      updateMapCoords,
      filterComputers,
      abortFilterComputers,
      elementIcon,
    }
  },
}
</script>
