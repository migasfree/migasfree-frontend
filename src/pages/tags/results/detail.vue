<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Tag')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="tags"
          :pk="element.id"
          :value="attributeValue(element)"
          icon="mdi-tag"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-select
              v-model="element.property_att"
              outlined
              :label="$gettext('Stamp')"
              :options="stamps"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-md">
            <q-input
              v-model="element.value"
              outlined
              label="Valor"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-input
              v-model="element.description"
              outlined
              type="textarea"
              :label="$gettext('Description')"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-select
              v-model="element.computers"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('Computers')"
              :options="computers"
              @filter="filterComputers"
              @filter-abort="abortFilterComputers"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.__str__ }}
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
                    model="computers"
                    :pk="scope.opt.id"
                    :value="scope.opt.__str__ || ''"
                    :icon="elementIcon(scope.opt.status)"
                    :tooltip="scope.opt.summary"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>

          <div v-if="element.id && inflicted.length > 0" class="col-md">
            <OverflowList
              :label="$gettext('Inflicted Computers')"
              icon="mdi-desktop-classic"
              :items="inflicted"
              model="computers"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Location</div>

        <q-toggle
          v-model="viewMap"
          :label="
            viewMap
              ? $gettext('Remove Coordinates')
              : $gettext('Add Coordinates')
          "
          :false-value="false"
          :true-value="true"
          @input="updateCoords"
        />

        <template v-if="viewMap">
          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <q-input
                v-model="element.latitude"
                outlined
                :label="$gettext('Latitude')"
                @input="updateMapCoords"
              />
            </div>

            <div class="col-md">
              <q-input
                v-model="element.longitude"
                outlined
                :label="$gettext('Longitude')"
                @input="updateMapCoords"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md">
              <l-map
                v-if="viewMap"
                id="map"
                :zoom="zoom"
                :center="coords"
                @click="updateMarker"
              >
                <l-tile-layer
                  :url="url"
                  :attribution="attribution"
                ></l-tile-layer>
                <l-marker :lat-lng="coords" :icon="iconMarker"></l-marker>
              </l-map>
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and add other')"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and continue editing')"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          :label="$gettext('Save')"
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </q-card-actions>
    </q-card>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
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
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import OverflowList from 'components/ui/OverflowList'
import RemoveDialog from 'components/ui/RemoveDialog'
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
    MigasLink,
    OverflowList
  },
  mixins: [elementMixin, detailMixin],
  data() {
    const title = this.$gettext('Tag')
    const element = { id: 0, computers: [] }

    return {
      title,
      originalTitle: title,
      model: 'tags',
      listRoute: 'tags-list',
      addRoute: 'tag-add',
      detailRoute: 'tag-detail',
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
          text: this.$gettext('Tags'),
          to: 'tags-dashboard',
          icon: 'mdi-tag'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      stamps: [],
      computers: [],
      inflicted: [],
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
    isValid() {
      return (
        this.element.value !== undefined &&
        this.element.value !== '' &&
        this.element.hasOwnProperty('property_att')
      )
    },
    elementText() {
      return this.element.id ? this.attributeValue(this.element) : ''
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/stamps/')
        .then((response) => {
          this.stamps = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (this.element.id) {
        await this.$axios
          .get(`/api/v1/token/tags/${this.element.id}/computers/`)
          .then((response) => {
            this.$set(this.element, 'computers', response.data.computers)
            this.inflicted = response.data.inflicted
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    elementData() {
      return {
        property_att: this.element.property_att.id,
        value: this.element.value,
        description: this.element.description,
        latitude: this.element.latitude,
        longitude: this.element.longitude
      }
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
      } else {
        this.element.latitude = null
        this.element.longitude = null
      }
    },

    updateMarker($evt) {
      this.coords = [$evt.latlng.lat, $evt.latlng.lng]
      this.updateCoords()
    },

    updateMapCoords() {
      this.coords = [this.element.latitude, this.element.longitude]
    },

    filterComputers(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/computers/', { params: { search: needle } })
          .then((response) => {
            this.computers = response.data.results
          })
        /* this.computers = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterComputers() {
      // console.log('delayed filter aborted')
    },

    async updateRelated() {
      await this.$axios
        .patch(`/api/v1/token/${this.model}/${this.element.id}/computers/`, {
          computers: this.element.computers
            ? this.element.computers.map((item) => item.id)
            : []
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
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
