<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :is-valid="false"
      :add-button="false"
      :continue-button="false"
      :save-button="false"
      :borderless="true"
      @set-related="setRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-6 col-md col-sm-12 col-xs-12">
            <ComputerInfo
              :cid="element.id"
              :name="element.name"
              :fqdn="element.fqdn"
              :project="element.project"
              :created-at="element.created_at"
              :ip-address="element.ip_address"
              :forwarded-ip-address="element.forwarded_ip_address"
            />
          </div>

          <div class="col-6 col-md col-sm-12 col-xs-12">
            <ComputerHardwareResume
              :cid="element.id"
              :last-hardware-capture="showDate(element.last_hardware_capture)"
              :product="element.product"
              :product-system="element.product_system"
              :architecture="element.architecture"
              :uuid="element.uuid"
              :cpu="element.cpu"
              :ram="element.ram"
              :storage="element.storage"
              :disks="element.disks"
              :mac-address="element.mac_address"
            />
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div class="col-6 col-md col-sm-12 col-xs-12">
            <ComputerCurrentSituation
              :cid="element.id"
              :status="element.status"
              :comment="element.comment"
              :tags="element.tags"
              :attribute-sets="onlyAttributeSets"
              :domains="onlyDomains"
              @updated="onCurrentSituationUpdated"
            />
          </div>

          <div class="col-6 col-md col-sm-12 col-xs-12">
            <ComputerSynchronization
              :cid="element.id"
              :sync-user="element.sync_user"
              :sync-info="syncInfo"
              :attributes="onlyAttributes"
              :loading="loadingSync"
            />
          </div>
        </div>

        <div class="row q-pb-md q-col-gutter-md">
          <div
            v-if="element.has_software_inventory"
            class="col-6 col-md col-sm-12 col-xs-12"
          >
            <ComputerSoftware :cid="element.id" />
          </div>

          <div v-if="element.id" class="col-6 col-md col-sm-12 col-xs-12">
            <ComputerDevices :cid="element.id" />
          </div>
        </div>

        <div v-if="markers.length > 0" class="row q-pb-md q-col-gutter-md">
          <div class="col col-md col-sm-12">
            <q-card class="shadow-2 rounded-borders">
              <q-card-section>
                <div
                  class="text-h6 text-weight-bold q-mb-md"
                  :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
                >
                  {{ $gettext('Locations') }}
                </div>

                <l-map
                  id="map"
                  ref="map"
                  :zoom="MAP_DEFAULT_ZOOM"
                  :min-zoom="MAP_MIN_ZOOM"
                  :max-zoom="MAP_MAX_ZOOM"
                  :center="[markers[0].lat, markers[0].lng]"
                  @ready="centerMarkers"
                >
                  <l-tile-layer
                    :url="MAP_TILE_URL"
                    :attribution="MAP_ATTRIBUTION"
                  />

                  <l-control-scale
                    position="bottomleft"
                    :imperial="false"
                    :metric="true"
                  />

                  <l-control position="topright">
                    <q-btn
                      icon="mdi-crosshairs-gps"
                      padding="xs"
                      color="white"
                      text-color="black"
                      size="md"
                      @click="centerMarkers"
                      ><q-tooltip>{{
                        $gettext('Center Markers')
                      }}</q-tooltip></q-btn
                    >
                  </l-control>

                  <l-marker
                    v-for="(item, key) in markers"
                    :key="key"
                    :lat-lng="[item.lat, item.lng]"
                    @click="
                      $router.push({
                        name: `${pluralize.singular(item.model)}-detail`,
                        params: { id: item.id },
                      })
                    "
                  >
                    <l-icon
                      :icon-url="iconUrl"
                      :icon-size="iconSize"
                      :icon-anchor="iconAnchor"
                    />

                    <l-tooltip>
                      <p>
                        <strong>{{ item.tooltip }}</strong>
                      </p>
                      <p
                        v-if="
                          item.description && item.description !== item.tooltip
                        "
                        class="pre-wrap"
                      >
                        {{ item.description }}
                      </p>
                      ></l-tooltip
                    >
                  </l-marker>
                </l-map>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'
import {
  LMap,
  LTileLayer,
  LControlScale,
  LControl,
  LMarker,
  LIcon,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import pluralize from 'pluralize-esm'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'

import ComputerInfo from 'components/computer/Info'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import ComputerSoftware from 'components/computer/Software'
import ComputerDevices from 'components/computer/Devices'
import ComputerCurrentSituation from 'components/computer/CurrentSituation'
import ComputerSynchronization from 'components/computer/Synchronization'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'
import useMap from 'composables/map'

export default {
  components: {
    ItemDetail,
    ComputerInfo,
    ComputerHardwareResume,
    ComputerSoftware,
    ComputerDevices,
    ComputerCurrentSituation,
    ComputerSynchronization,
    LMap,
    LTileLayer,
    LControlScale,
    LControl,
    LMarker,
    LIcon,
    LTooltip,
  },
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()
    const { elementIcon, attributeValue } = useElement()
    const { showDate } = useDate()

    const routes = {
      list: 'computers-list',
    }
    const model = 'computers'

    let element = reactive({
      id: 0,
    })

    const title = ref($gettext('Computer'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const loading = ref(false)
    const loadingSync = ref(false)
    const map = ref(null)

    const status = ref([])
    const syncInfo = reactive({})
    const onlyAttributes = ref([])
    const onlyAttributeSets = ref([])
    const onlyDomains = ref([])
    const errors = reactive({})
    const faults = reactive({})

    const markers = ref([])

    const {
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DEFAULT_ZOOM,
      MAP_TILE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
    } = useMap()

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
        text: $gettext('Computers'),
        icon: modelIcon(model),
        to: 'computers-dashboard',
      },
    ])

    const centerMarkers = () => {
      if (map.value !== null && markers.value.length) {
        nextTick(() => {
          map.value.leafletObject.panTo([
            markers.value[0].lat,
            markers.value[0].lng,
          ])
        })
      }
    }

    const loadSyncInfo = async () => {
      loadingSync.value = true
      try {
        const response = await api.get(
          `/api/v1/token/${model}/${route.params.id}/sync/`,
        )
        Object.assign(syncInfo, response.data)

        const fetchBadge = async (val, type) => {
          const { data } = await api.get(
            `/api/v1/token/attributes/${val.id}/badge/`,
          )
          const icon = modelIcon(type)
          const model =
            type === 'attribute-sets'
              ? data.pk === 1
                ? 'features'
                : 'attribute-sets'
              : 'domains'
          return {
            id: data.pk,
            icon,
            model,
            value: attributeValue(val),
            summary: data.summary,
          }
        }

        const badgePromises = []
        for (const [, val] of Object.entries(response.data.sync_attributes)) {
          if (val.property_att.prefix === 'SET') {
            badgePromises.push(
              fetchBadge(val, 'attribute-sets').then((obj) =>
                onlyAttributeSets.value.push(obj),
              ),
            )
          } else if (val.property_att.prefix === 'DMN') {
            badgePromises.push(
              fetchBadge(val, 'domains').then((obj) =>
                onlyDomains.value.push(obj),
              ),
            )
          } else {
            onlyAttributes.value.push({
              id: val.id,
              value: attributeValue(val),
              model: val.property_att.sort === 'server' ? 'tags' : 'features',
              icon:
                val.property_att.sort === 'server'
                  ? modelIcon('tags')
                  : modelIcon('attributes'),
              summary: val.description,
            })
          }

          if (val.latitude !== null) {
            markers.value.push({
              id: val.id,
              model: val.property_att.sort === 'server' ? 'tags' : 'features',
              lat: val.latitude,
              lng: val.longitude,
              tooltip: attributeValue(val),
              description: val.description ? val.description : null,
            })
          }
        }

        await Promise.all(badgePromises)
        if (markers.value.length) centerMarkers()
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loadingSync.value = false
      }
    }

    const loadErrors = async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/${model}/${route.params.id}/errors/`,
        )
        Object.assign(errors, data)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadFaults = async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/${model}/${route.params.id}/faults/`,
        )
        Object.assign(faults, data)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const updateCurrentSituation = async () => {
      loading.value = true
      try {
        await api.patch(`/api/v1/token/${model}/${element.id}/`, {
          status: element.status,
          comment: element.comment,
          tags: element.tags.map((item) => item.id),
        })
        uiStore.notifySuccess($gettext('Current Situation has been changed!'))
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    const filterTags = async (val) => {
      const { data } = await api.get('/api/v1/token/tags/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    const getComputerStatus = async () => {
      try {
        const response = await api.get(`/api/v1/token/${model}/status/`)
        const { choices } = response.data

        Object.entries(choices).forEach(([key, val]) => {
          status.value.push({
            label: val,
            value: key,
            icon: elementIcon(key),
          })
        })
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const setRelated = () => {
      loadSyncInfo()
      loadErrors()
      loadFaults()

      getComputerStatus()

      Object.entries(element.tags).map(([, val]) => {
        if (val.latitude !== null) {
          markers.value.push({
            id: val.id,
            model: 'tags',
            lat: val.latitude,
            lng: val.longitude,
            tooltip: attributeValue(val),
            description: val.description ? val.description : null,
          })
        }
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const onCurrentSituationUpdated = (data) => {
      element.status = data.status
      element.comment = data.comment
      element.tags = data.tags
    }

    return {
      title,
      breadcrumbs,
      loading,
      loadingSync,
      map,
      routes,
      model,
      element,
      status,
      syncInfo,
      onlyAttributes,
      onlyAttributeSets,
      onlyDomains,
      errors,
      faults,
      markers,
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DEFAULT_ZOOM,
      MAP_TILE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
      elementIcon,
      attributeValue,
      showDate,
      centerMarkers,
      updateCurrentSituation,
      filterTags,
      pluralize,
      setRelated,
      setTitle,
      appIcon,
      modelIcon,
      onCurrentSituationUpdated,
    }
  },
}
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
}
#map {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 400px;
}

/* Counter mini-cards */
.counter-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
}
.counter-row {
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
  color: inherit;
}
.counter-row:hover {
  background-color: rgba(128, 128, 128, 0.15);
}
.counter-row--alert {
  background-color: rgba(var(--q-negative-rgb, 198, 40, 40), 0.1);
}
.counter-row--alert:hover {
  background-color: rgba(var(--q-negative-rgb, 198, 40, 40), 0.2);
}
.text-decoration-none {
  text-decoration: none;
}
</style>
