<template>
  <l-map id="map" :zoom="zoom" :center="coords" @click="updateMarker">
    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    <l-marker :lat-lng="coords" :icon="iconMarker"></l-marker>
  </l-map>
</template>

<script>
export default {
  name: 'AddLocation',
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      zoom: 16,
      url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      coords: this.value || [0, 0],
      attribution:
        '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      iconMarker: L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [32, 40],
        iconAnchor: [16, 37]
      })
    }
  },
  watch: {
    value: {
      handler: function(val, oldVal) {
        this.coords = val
      }
    }
  },
  methods: {
    updateMarker($evt) {
      this.coords = [$evt.latlng.lat, $evt.latlng.lng]
      this.$emit('update-coords', this.coords)
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: 400px;
}
</style>
