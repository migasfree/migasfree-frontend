<template>
  <l-map
    id="map"
    :zoom="MAP_DETAIL_ZOOM"
    :min-zoom="MAP_MIN_ZOOM"
    :max-zoom="MAP_MAX_ZOOM"
    :center="coords"
    @click="updateMarker"
  >
    <l-tile-layer :url="MAP_TILE_URL" :attribution="MAP_ATTRIBUTION" />
    <l-control-scale position="bottomleft" :imperial="false" :metric="true" />
    <l-marker :lat-lng="coords">
      <l-icon
        :icon-url="iconUrl"
        :icon-size="iconSize"
        :icon-anchor="iconAnchor"
      />
    </l-marker>
  </l-map>
</template>

<script>
import { ref, watch } from 'vue'
import useMap from 'composables/map'

export default {
  name: 'AddLocation',
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
  },
  emits: ['update-coords'],
  setup(props, { emit }) {
    const {
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DETAIL_ZOOM,
      MAP_TILE_URL,
      MAP_ATTRIBUTION,
      iconUrl,
      iconSize,
      iconAnchor,
    } = useMap()

    const coords = ref(props.modelValue || [0, 0])

    const updateMarker = ($evt) => {
      if ($evt.latlng === undefined) return
      coords.value = [$evt.latlng.lat, $evt.latlng.lng]
      emit('update-coords', coords.value)
    }

    watch(
      () => props.modelValue,
      (val) => {
        coords.value = val
      },
    )

    return {
      MAP_MIN_ZOOM,
      MAP_MAX_ZOOM,
      MAP_DETAIL_ZOOM,
      MAP_TILE_URL,
      MAP_ATTRIBUTION,
      coords,
      iconUrl,
      iconSize,
      iconAnchor,
      updateMarker,
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
