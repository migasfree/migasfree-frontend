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
          <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <MigasLink
                model="properties"
                :pk="element.property_att.id"
                :value="element.property_att.name || ''"
                icon="mdi-function-variant"
                :tooltip="$gettext('Formula')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-icon name="mdi-pound" size="sm" class="vertical-middle" />
              <span class="vertical-middle">{{ element.value }}</span>
              <q-tooltip self="bottom middle">{{
                $gettext('Value')
              }}</q-tooltip>
            </div>
          </div>

          <div class="row q-pa-md">
            <div class="col">
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
              <div class="col-6 col-md col-sm">
                <q-input
                  v-model="element.latitude"
                  outlined
                  :label="$gettext('Latitude')"
                  @input="updateMapCoords"
                />
              </div>

              <div class="col-6 col-md col-sm">
                <q-input
                  v-model="element.longitude"
                  outlined
                  :label="$gettext('Longitude')"
                  @input="updateMapCoords"
                />
              </div>
            </div>

            <div class="row q-pa-md q-gutter-md">
              <div class="col">
                <AddLocation v-model="coords" @update-coords="updateCoords" />
              </div>
            </div>
          </template>
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
import AddLocation from 'components/map/AddLocation'
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
    MigasLink,
    AddLocation
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
      coords: [0, 0]
    }
  },
  computed: {
    elementText() {
      return this.element.id ? this.attributeValue(this.element) : ''
    }
  },
  methods: {
    elementData() {
      return {
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

    updateCoords(params) {
      if (this.viewMap) {
        this.element.latitude = params[0]
        this.element.longitude = params[1]
      } else {
        this.element.latitude = null
        this.element.longitude = null
      }
    },

    updateMapCoords() {
      this.coords = [this.element.latitude, this.element.longitude]
    }
  }
}
</script>
