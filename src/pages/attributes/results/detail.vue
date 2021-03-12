<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <template v-if="element.id">
      <Header :title="$gettext('Attribute')">
        <template v-if="element.id" #append
          >:
          <MigasLink
            model="features"
            :pk="element.id"
            :value="attributeValue(element)"
            :icon="elementIcon(element.property_att.prefix)"
          />
        </template>
      </Header>

      <q-card>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md">
              <q-field outlined :label="$gettext('Formula')" stack-label>
                <template #control>
                  <MigasLink
                    model="properties"
                    :pk="element.property_att.id"
                    :value="element.property_att.name || ''"
                    icon="mdi-function-variant"
                  />
                </template>
              </q-field>
            </div>

            <div class="col-6 col-md">
              <q-input
                v-model="element.value"
                outlined
                :label="$gettext('Value')"
                readonly
              />
            </div>
          </div>

          <div class="row q-pa-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                autofocus
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-mx-md">
          <q-toggle
            v-model="viewMap"
            :label="viewMap ? $gettext('Hide Map') : $gettext('View Map')"
            :false-value="false"
            :true-value="true"
            @input="updateCoords"
          />

          <l-map
            v-if="viewMap"
            id="map"
            :zoom="zoom"
            :center="coords"
            @click="updateMarker"
          >
            <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
            <l-marker :lat-lng="coords" :icon="iconMarker"></l-marker>
          </l-map>
        </q-card-section>

        <q-card-actions class="justify-around">
          <q-btn
            flat
            color="primary"
            icon="mdi-content-save-edit"
            :label="$gettext('Save and continue editing')"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="updateElement"
          />
          <q-btn
            color="primary"
            icon="mdi-content-save-move"
            :label="$gettext('Save')"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="updateElement('return')"
          />
        </q-card-actions>
      </q-card>

      <div class="row q-pa-md">
        <q-btn
          flat
          icon="mdi-delete"
          color="negative"
          :label="$gettext('Delete')"
          @click="confirmRemove = true"
        />
      </div>

      <RemoveDialog
        v-model="confirmRemove"
        @confirmed="remove"
        @canceled="confirmRemove = !confirmRemove"
      />
    </template>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import RemoveDialog from 'components/ui/RemoveDialog'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { detailMixin } from 'mixins/detail'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink
  },
  mixins: [elementMixin, detailMixin],
  data() {
    const title = this.$gettext('Attribute')
    const element = {}

    return {
      title,
      originalTitle: title,
      model: 'features',
      listRoute: 'attributes-list',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Attributes'),
          to: 'attributes-dashboard',
          icon: 'mdi-pound'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      isValid: true,
      confirmRemove: false,

      viewMap: false,
      zoom: 16,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      coords: [0, 0],
      attribution:
        '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      iconMarker: L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [32, 40],
        iconAnchor: [16, 37]
      })
    }
  },
  computed: {
    elementText() {
      return this.element.id ? this.attributeValue(this.element) : ''
    }
  },
  methods: {
    elementData() {
      let data = {
        description: this.element.description
      }
      if (this.viewMap) {
        data['latitude'] = this.element.latitude
        data['longitude'] = this.element.longitude
      }

      return data
    },

    setRelated() {
      if (this.element.latitude !== null) {
        this.coords = [this.element.latitude, this.element.longitude]
        this.viewMap = true
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.coords = [position.coords.latitude, position.coords.longitude]
        })
      }
    },

    updateCoords() {
      if (this.viewMap) {
        this.element.latitude = this.coords[0]
        this.element.longitude = this.coords[1]
      }
    },

    updateMarker($evt) {
      this.coords = [$evt.latlng.lat, $evt.latlng.lng]
      this.updateCoords()
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
</style>
