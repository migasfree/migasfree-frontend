<template>
  <q-card class="locations-card shadow-2 rounded-borders">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div
          class="text-h6 text-weight-bold"
          :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
        >
          {{ $gettext('Locations') }}
        </div>
      </div>

      <l-map
        id="map"
        ref="map"
        :zoom="MAP_DEFAULT_ZOOM"
        :min-zoom="MAP_MIN_ZOOM"
        :max-zoom="MAP_MAX_ZOOM"
        :center="center"
        @ready="centerMarkers"
      >
        <l-tile-layer :url="MAP_TILE_URL" :attribution="MAP_ATTRIBUTION" />

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
            ><q-tooltip>{{ $gettext('Center Markers') }}</q-tooltip></q-btn
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
              v-if="item.description && item.description !== item.tooltip"
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
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
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

import useMap from 'composables/map'

export default {
  name: 'ComputerLocations',
  components: {
    LMap,
    LTileLayer,
    LControlScale,
    LControl,
    LMarker,
    LIcon,
    LTooltip,
  },
  props: {
    markers: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const map = ref(null)

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

    const center = computed(() => {
      if (props.markers.length > 0) {
        return [props.markers[0].lat, props.markers[0].lng]
      }
      return [0, 0] // Default, though v-if in parent prevents this
    })

    const centerMarkers = () => {
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

    return {
      map,
      center,
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DEFAULT_ZOOM,
      MAP_TILE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
      pluralize,
      centerMarkers,
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

#map {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 400px;
  z-index: 1;
}
</style>
