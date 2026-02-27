<template>
  <q-card class="locations-card panel shadow-2 rounded-borders">
    <q-card-section>
      <!-- Header -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <h2 class="panel-title">
          {{ $gettext('Locations') }}
        </h2>
      </div>

      <!-- Map Area -->
      <div
        class="relative-position overflow-hidden rounded-xl map-wrapper shadow-2"
      >
        <l-map
          id="map"
          ref="map"
          v-model:zoom="zoom"
          :min-zoom="MAP_MIN_ZOOM"
          :max-zoom="MAP_MAX_ZOOM"
          :center="center"
          :options="{ zoomControl: false }"
          class="map-instance"
          @ready="centerMarkers"
        >
          <l-tile-layer
            :url="mapLayer === 'street' ? MAP_TILE_URL : MAP_SATELLITE_URL"
            :attribution="MAP_ATTRIBUTION"
            layer-type="base"
          />

          <l-control-scale
            position="bottomleft"
            :imperial="false"
            :metric="true"
          />

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
              <div class="q-pa-xs column">
                <span class="text-weight-bold text-subtitle2">{{
                  item.tooltip
                }}</span>
                <span
                  v-if="item.description && item.description !== item.tooltip"
                  class="pre-wrap text-caption opacity-80"
                >
                  {{ item.description }}
                </span>
              </div>
            </l-tooltip>
          </l-marker>
        </l-map>

        <!-- Map Layers Toggle -->
        <div class="absolute-top-left q-ma-md overlay-control pointer-none">
          <q-btn-toggle
            v-model="mapLayer"
            dense
            unelevated
            no-caps
            :color="$q.dark.isActive ? 'grey-9' : 'white'"
            :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
            toggle-color="primary"
            toggle-text-color="white"
            class="pointer-all shadow-1"
            :options="[
              { label: $gettext('Map'), value: 'street', icon: 'mdi-map' },
              {
                label: $gettext('Satellite'),
                value: 'satellite',
                icon: 'mdi-earth',
              },
            ]"
          />
        </div>

        <!-- Custom Map Controls -->
        <div
          class="map-controls absolute-top-right q-ma-md column q-gutter-y-sm overlay-control pointer-none"
        >
          <q-btn
            fab-mini
            :color="$q.dark.isActive ? 'grey-9' : 'white'"
            :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
            icon="mdi-plus"
            class="map-action-btn pointer-all shadow-1"
            @click="zoom++"
          >
            <q-tooltip anchor="center left" self="center right">{{
              $gettext('Zoom In')
            }}</q-tooltip>
          </q-btn>
          <q-btn
            fab-mini
            :color="$q.dark.isActive ? 'grey-9' : 'white'"
            :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
            icon="mdi-minus"
            class="map-action-btn pointer-all shadow-1"
            @click="zoom--"
          >
            <q-tooltip anchor="center left" self="center right">{{
              $gettext('Zoom Out')
            }}</q-tooltip>
          </q-btn>
          <q-btn
            fab-mini
            :color="$q.dark.isActive ? 'grey-9' : 'white'"
            :text-color="$q.dark.isActive ? 'grey-3' : 'grey-8'"
            icon="mdi-crosshairs-gps"
            class="map-action-btn pointer-all shadow-1 q-mt-md"
            @click="centerMarkers"
          >
            <q-tooltip anchor="center left" self="center right">{{
              $gettext('Center Markers')
            }}</q-tooltip>
          </q-btn>
        </div>

        <!-- Bottom Coordinates Bar -->
        <div
          class="absolute-bottom full-width q-pa-sm overlay-control glass-blur-bar flex justify-between items-center pointer-none"
        >
          <div class="flex items-center q-gutter-x-md q-px-md pointer-all">
            <div class="flex items-center">
              <q-icon
                name="mdi-compass-outline"
                class="q-mr-xs text-primary"
                size="16px"
              />
              <span
                class="text-caption font-mono text-weight-bold"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                {{ center[0].toFixed(4) }} / {{ center[1].toFixed(4) }}
              </span>
            </div>
          </div>
          <div
            class="flex items-center q-gutter-x-sm q-px-md q-pr-xl pointer-all"
          >
            <MicroInteractionButton
              icon="mdi-content-copy"
              success-icon="mdi-check"
              :tooltip="$gettext('Copy coordinates')"
              :success-tooltip="$gettext('Copied!')"
              color="grey"
              class="opacity-60 hover-opacity-100"
              :action="copyCoordinates"
            />
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="mdi-google-maps"
              color="primary"
              class="q-ml-sm opacity-80 hover-opacity-100"
              @click="openGoogleMaps"
            >
              <q-tooltip>{{ $gettext('Google Maps') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
import {
  LMap,
  LTileLayer,
  LControlScale,
  LMarker,
  LIcon,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import pluralize from 'pluralize-esm'

import useMap from 'composables/map'
import useCopyPaste from 'composables/copyPaste'
import MicroInteractionButton from 'components/ui/MicroInteractionButton'

export default {
  name: 'ComputerLocations',
  components: {
    LMap,
    LTileLayer,
    LControlScale,
    LMarker,
    LIcon,
    LTooltip,
    MicroInteractionButton,
  },
  props: {
    markers: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const map = ref(null)
    const { contentToClipboard } = useCopyPaste()
    const zoom = ref(15)
    const mapLayer = ref('street')

    const {
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DEFAULT_ZOOM,
      MAP_TILE_URL,
      MAP_SATELLITE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
    } = useMap()

    const center = computed(() => {
      if (props.markers.length > 0) {
        return [props.markers[0].lat, props.markers[0].lng]
      }
      return [0, 0] // Default, though v-if in parent prevents this
    })

    const centerMarkers = () => {
      zoom.value = MAP_DEFAULT_ZOOM
      if (map.value !== null && props.markers.length) {
        nextTick(() => {
          map.value.leafletObject.panTo([
            props.markers[0].lat,
            props.markers[0].lng,
          ])
        })
      }
    }

    watch(
      () => props.markers,
      () => {
        centerMarkers()
      },
      { deep: true },
    )

    const copyCoordinates = async () => {
      await contentToClipboard(`${center.value[0]}, ${center.value[1]}`)
    }

    const openGoogleMaps = () => {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${center.value[0]},${center.value[1]}`,
        '_blank',
      )
    }

    return {
      map,
      zoom,
      mapLayer,
      center,
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DEFAULT_ZOOM,
      MAP_TILE_URL,
      MAP_SATELLITE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
      pluralize,
      centerMarkers,
      copyCoordinates,
      openGoogleMaps,
    }
  },
}
</script>

<style scoped>
.locations-card {
  height: 100%;
}

.pre-wrap {
  white-space: pre-wrap;
}

.map-wrapper {
  height: 500px;
  background: rgba(var(--brand-primary-rgb), 0.05);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.1);
  position: relative;
}

[data-theme='dark'] .map-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.05);
}

.map-instance {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.overlay-control {
  z-index: 1000;
}

.map-action-btn {
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme='dark'] .map-action-btn {
  border-color: rgba(255, 255, 255, 0.1);
}

.map-action-btn:hover {
  transform: translateY(-2px);
  border-color: var(--brand-primary);
}

.pointer-none {
  pointer-events: none;
}

.pointer-all {
  pointer-events: all;
}

:deep(.leaflet-control-attribution) {
  font-size: 9px !important;
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.5) !important;
  padding: 2px 8px !important;
  border-top-left-radius: 8px;
}

[data-theme='dark'] :deep(.leaflet-control-attribution) {
  background: rgba(0, 0, 0, 0.5) !important;
  color: #fff;
}
</style>
