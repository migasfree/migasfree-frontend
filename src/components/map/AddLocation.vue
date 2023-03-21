<template>
  <l-map
    id="map"
    :zoom="zoom"
    :min-zoom="3"
    :max-zoom="19"
    :center="coords"
    @click="updateMarker"
  >
    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
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
    const zoom = 16
    const url = 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
    const attribution =
      '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'

    const coords = ref(props.modelValue || [0, 0])

    const iconUrl = require('leaflet/dist/images/marker-icon.png')
    const iconSize = [32, 40]
    const iconAnchor = [16, 37]

    const updateMarker = ($evt) => {
      if ($evt.latlng === undefined) return
      coords.value = [$evt.latlng.lat, $evt.latlng.lng]
      emit('update-coords', coords.value)
    }

    watch(
      () => props.modelValue,
      (val) => {
        coords.value = val
      }
    )

    return {
      zoom,
      url,
      attribution,
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
