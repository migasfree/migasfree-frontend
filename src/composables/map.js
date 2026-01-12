import {
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
  MAP_DEFAULT_ZOOM,
  MAP_DETAIL_ZOOM,
  MAP_TILE_URL,
  MAP_ATTRIBUTION,
  MAP_ICON_SIZE,
  MAP_ICON_ANCHOR,
} from 'config/app.conf'

// Icon URL requires bundler (webpack) - cannot be in static config
const iconUrl = require('leaflet/dist/images/marker-icon.png')

export default function useMap() {
  return {
    // Zoom configuration
    MAP_MIN_ZOOM,
    MAP_MAX_ZOOM,
    MAP_DEFAULT_ZOOM,
    MAP_DETAIL_ZOOM,

    // Tile layer configuration
    MAP_TILE_URL,
    MAP_ATTRIBUTION,

    // Marker icon configuration
    iconUrl,
    iconSize: MAP_ICON_SIZE,
    iconAnchor: MAP_ICON_ANCHOR,
  }
}
