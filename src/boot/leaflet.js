import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LControl,
  LIcon,
} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

export default async ({ app }) => {
  app.component('LMap', LMap)
  app.component('LTileLayer', LTileLayer)
  app.component('LMarker', LMarker)
  app.component('LTooltip', LTooltip)
  app.component('LControl', LControl)
  app.component('LIcon', LIcon)
}
