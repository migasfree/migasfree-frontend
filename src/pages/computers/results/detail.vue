<template>
  <q-page padding>
    <ItemDetail
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
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5">{{ $gettext('Current Situation') }}</div>

                <q-select
                  v-model="element.status"
                  class="q-my-md"
                  outlined
                  emit-value
                  map-options
                  :label="$gettext('Status')"
                  :options="status"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #selected-item="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{
                          scope.opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <q-input
                  v-model="element.comment"
                  class="q-my-md"
                  outlined
                  type="textarea"
                  :label="$gettext('Comment')"
                />

                <q-select
                  v-model="element.tags"
                  class="q-my-md"
                  outlined
                  use-input
                  map-options
                  multiple
                  counter
                  input-debounce="0"
                  :label="$gettext('Tags')"
                  :hint="
                    $gettext('Type to search (minimum %{num} characters)', {
                      num: MIN_CHARS_SEARCH,
                    })
                  "
                  :options="tags"
                  @filter="filterTags"
                  @filter-abort="abortFilterTags"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ $gettext('No results') }}
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      {{ attributeValue(scope.opt) }}
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
                        model="tags"
                        :pk="scope.opt.id"
                        :value="attributeValue(scope.opt)"
                        :tooltip="scope.opt.description"
                      />
                    </q-chip>
                  </template>
                </q-select>

                <OverflowList
                  model="attribute-sets"
                  :label="$gettext('Attribute Sets')"
                  :items="onlyAttributeSets"
                />

                <OverflowList
                  model="domains"
                  :label="$gettext('Domains')"
                  :items="onlyDomains"
                />

                <div class="row q-pa-md text-center">
                  <div class="col">
                    <q-tooltip>{{ $gettext('Errors') }}</q-tooltip>
                    <q-icon :name="modelIcon('errors')" size="xl" />
                    <q-btn
                      round
                      size="md"
                      :color="errors.unchecked > 0 ? 'negative' : 'grey-3'"
                      :text-color="errors.unchecked > 0 ? 'white' : 'black'"
                      :to="{
                        name: 'errors-list',
                        query: { computer_id: element.id, checked: false },
                      }"
                      ><strong>{{ errors.unchecked }}</strong>
                      <q-tooltip anchor="top middle" self="bottom middle">{{
                        $gettext('Unchecked')
                      }}</q-tooltip></q-btn
                    >
                    /
                    <q-btn
                      round
                      size="md"
                      color="grey-3"
                      text-color="black"
                      :to="{
                        name: 'errors-list',
                        query: { computer_id: element.id },
                      }"
                      ><strong>{{ errors.total }}</strong>
                      <q-tooltip anchor="top middle" self="bottom middle">{{
                        $gettext('Total')
                      }}</q-tooltip></q-btn
                    >
                  </div>

                  <div class="col">
                    <q-tooltip>{{ $gettext('Faults') }}</q-tooltip>
                    <q-icon :name="modelIcon('faults')" size="xl" />
                    <q-btn
                      round
                      size="md"
                      :color="faults.unchecked > 0 ? 'negative' : 'grey-3'"
                      :text-color="faults.unchecked > 0 ? 'white' : 'black'"
                      :to="{
                        name: 'faults-list',
                        query: { computer_id: element.id, checked: false },
                      }"
                      ><strong>{{ faults.unchecked }}</strong>
                      <q-tooltip anchor="top middle" self="bottom middle">{{
                        $gettext('Unchecked')
                      }}</q-tooltip></q-btn
                    >
                    /
                    <q-btn
                      round
                      size="md"
                      color="grey-3"
                      text-color="black"
                      :to="{
                        name: 'faults-list',
                        query: { computer_id: element.id },
                      }"
                      ><strong>{{ faults.total }}</strong>
                      <q-tooltip anchor="top middle" self="bottom middle">{{
                        $gettext('Total')
                      }}</q-tooltip></q-btn
                    >
                  </div>
                </div>
              </q-card-section>

              <q-card-actions class="q-px-md">
                <q-btn
                  class="full-width"
                  color="primary"
                  :icon="appIcon('save-edit')"
                  :label="$gettext('Save and continue editing')"
                  :loading="loading"
                  :disabled="loading"
                  @click="updateCurrentSituation"
                />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-6 col-md col-sm-12 col-xs-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="row">
                  <div class="col">
                    <div class="text-h5">{{ $gettext('Synchronization') }}</div>
                  </div>

                  <div v-if="element.id" class="col-auto">
                    <DateDiff
                      :begin="new Date(element.sync_end_date)"
                      :tooltip="$gettext('unsynchronized from')"
                    />
                  </div>
                </div>

                <div v-if="element.sync_user" class="row q-py-sm">
                  <MigasLink
                    model="users"
                    :pk="element.sync_user.id"
                    :value="element.sync_user.__str__ || ''"
                    :tooltip="$gettext('User')"
                  />
                </div>

                <div
                  v-if="loadingSync || Object.keys(syncInfo).length == 0"
                  class="justify-center"
                >
                  <q-spinner-dots color="primary" size="3em" />
                </div>

                <template v-else>
                  <div class="row q-py-sm items-baseline">
                    <div class="col-md">
                      <DateView
                        :value="syncInfo.sync_start_date"
                        icon="mdi-play"
                        :tooltip-text="$gettext('sync start date')"
                      />
                    </div>

                    <div
                      class="col-md"
                      :class="{
                        'bg-warning text-black':
                          syncInfo.sync_end_date < syncInfo.sync_start_date,
                      }"
                    >
                      <DateView
                        :value="syncInfo.sync_end_date"
                        icon="mdi-stop"
                        :tooltip-text="$gettext('sync end date')"
                      />
                    </div>

                    <div class="col-auto">
                      <DateDiff
                        v-if="syncInfo.sync_start_date"
                        class="vertical-middle"
                        :begin="new Date(syncInfo.sync_start_date)"
                        :end="new Date(syncInfo.sync_end_date)"
                        :tooltip="$gettext('last sync time')"
                      />
                    </div>
                  </div>

                  <OverflowList
                    model="attributes"
                    :label="$gettext('Attributes')"
                    :items="onlyAttributes"
                  />
                </template>
              </q-card-section>
            </q-card>
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
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h5 q-pb-sm">{{ $gettext('Locations') }}</div>

                <l-map
                  id="map"
                  ref="map"
                  :zoom="zoom"
                  :min-zoom="3"
                  :max-zoom="19"
                  :center="[markers[0].lat, markers[0].lng]"
                  @ready="centerMarkers"
                >
                  <l-tile-layer :url="url" :attribution="attribution" />

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
                        v-html="item.description"
                      ></p
                    ></l-tooltip>
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
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import pluralize from 'pluralize-esm'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

import OverflowList from 'components/ui/OverflowList'
import ItemDetail from 'components/ui/ItemDetail'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import DateDiff from 'components/DateDiff'

import ComputerInfo from 'components/computer/Info'
import ComputerHardwareResume from 'components/computer/HardwareResume'
import ComputerSoftware from 'components/computer/Software'
import ComputerDevices from 'components/computer/Devices'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: {
    OverflowList,
    ItemDetail,
    DateView,
    MigasLink,
    DateDiff,
    ComputerInfo,
    ComputerHardwareResume,
    ComputerSoftware,
    ComputerDevices,
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
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const loading = ref(false)
    const loadingSync = ref(false)
    const map = ref(null)

    const status = ref([])
    const syncInfo = reactive({})
    const onlyAttributes = ref([])
    const onlyAttributeSets = ref([])
    const onlyDomains = ref([])
    const tags = ref([])
    const errors = reactive({})
    const faults = reactive({})

    const markers = ref([])
    const zoom = 12
    const url = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
    const attribution =
      '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    const iconUrl = require('leaflet/dist/images/marker-icon.png')
    const iconSize = [32, 40]
    const iconAnchor = [16, 37]

    const breadcrumbs = reactive([
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
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/sync/`)
        .then((response) => {
          Object.assign(syncInfo, response.data)
          Object.entries(response.data.sync_attributes).map(([, val]) => {
            if (val.property_att.prefix === 'SET') {
              api
                .get(`/api/v1/token/attributes/${val.id}/badge/`)
                .then((response) => {
                  onlyAttributeSets.value.push({
                    id: response.data.pk,
                    icon: modelIcon('attribute-sets'),
                    model:
                      response.data.pk === 1 ? 'features' : 'attribute-sets',
                    value: attributeValue(val),
                    summary: response.data.summary,
                  })
                })
                .catch((error) => {
                  uiStore.notifyError(error)
                })
            } else if (val.property_att.prefix === 'DMN') {
              api
                .get(`/api/v1/token/attributes/${val.id}/badge/`)
                .then((response) => {
                  onlyDomains.value.push({
                    id: response.data.pk,
                    icon: modelIcon('domains'),
                    value: attributeValue(val),
                    summary: response.data.summary,
                  })
                })
                .catch((error) => {
                  uiStore.notifyError(error)
                })
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
                description: val.description
                  ? val.description.replaceAll('\n', '<br />')
                  : null,
              })
              centerMarkers()
            }
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loadingSync.value = false
        })
    }

    const loadErrors = async () => {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/errors/`)
        .then((response) => {
          Object.assign(errors, response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const loadFaults = async () => {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/faults/`)
        .then((response) => {
          Object.assign(faults, response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    const updateCurrentSituation = async () => {
      loading.value = true
      await api
        .patch(`/api/v1/token/${model}/${element.id}/`, {
          status: element.status,
          comment: element.comment,
          tags: element.tags.map((item) => item.id),
        })
        .then(() => {
          uiStore.notifySuccess($gettext('Current Situation has been changed!'))
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    }

    const filterTags = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/tags/', { params: { search: val.toLowerCase() } })
        .then((response) => {
          tags.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterTags = () => {
      // console.log('delayed filter aborted')
    }

    const getComputerStatus = async () => {
      await api
        .get(`/api/v1/token/${model}/status/`)
        .then((response) => {
          Object.entries(response.data.choices).map(([key, val]) => {
            status.value.push({
              label: val,
              value: key,
              icon: elementIcon(key),
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
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
            description: val.description
              ? val.description.replaceAll('\n', '<br />')
              : null,
          })
        }
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
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
      tags,
      errors,
      faults,
      markers,
      zoom,
      url,
      attribution,
      iconUrl,
      iconSize,
      iconAnchor,
      elementIcon,
      attributeValue,
      showDate,
      centerMarkers,
      updateCurrentSituation,
      filterTags,
      abortFilterTags,
      pluralize,
      setRelated,
      setTitle,
      appIcon,
      modelIcon,
      MIN_CHARS_SEARCH,
    }
  },
}
</script>

<style scoped>
#map {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 400px;
}
</style>
